// Rate Limiter
// レート制限を管理し、多重リクエストやループを防止

/**
 * レート制限設定
 */
interface RateLimitConfig {
  maxRequestsPerMinute: number; // 1分間の最大リクエスト数
  maxRequestsPerDay: number; // 1日の最大リクエスト数
  requestTimeout: number; // リクエストタイムアウト（ミリ秒）
  maxRetries: number; // 最大リトライ回数
}

/**
 * リクエストレコード
 */
interface RequestRecord {
  timestamp: number;
  id: string;
}

/**
 * キューアイテム
 */
interface QueueItem<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  retryCount: number;
  createdAt: number;
}

/**
 * レート制限マネージャー
 *
 * 機能:
 * - 1分間/1日のリクエスト数制限
 * - キューイングによる順序保証
 * - 重複リクエスト防止
 * - 安全なリトライロジック（最大回数制限付き）
 * - 同時実行制御
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private minuteRequests: RequestRecord[] = [];
  private dayRequests: RequestRecord[] = [];
  private queue: QueueItem<any>[] = [];
  private processing = false;
  private activeRequests = new Set<string>();
  private requestIdCounter = 0;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxRequestsPerMinute: config?.maxRequestsPerMinute || 15, // Gemini無料枠: 15 RPM
      maxRequestsPerDay: config?.maxRequestsPerDay || 1500, // Gemini無料枠: 1,500 RPD
      requestTimeout: config?.requestTimeout || 30000, // 30秒
      maxRetries: config?.maxRetries || 3, // 最大3回まで
    };
  }

  /**
   * リクエストを実行（レート制限付き）
   *
   * 重複防止機能:
   * - 同じIDのリクエストは同時に1つのみ実行
   * - キューに追加された時点でIDが割り当てられる
   */
  async execute<T>(fn: () => Promise<T>, requestId?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = requestId || this.generateRequestId();

      // 重複チェック: 同じIDのリクエストが既にアクティブまたはキューにある場合はエラー
      if (this.activeRequests.has(id)) {
        reject(new Error(`リクエストID ${id} は既に実行中です`));
        return;
      }

      if (this.queue.some((item) => item.id === id)) {
        reject(new Error(`リクエストID ${id} は既にキューに存在します`));
        return;
      }

      // キューに追加
      const queueItem: QueueItem<T> = {
        id,
        fn,
        resolve,
        reject,
        retryCount: 0,
        createdAt: Date.now(),
      };

      this.queue.push(queueItem);

      // プロセス開始（既に実行中でなければ）
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * キューを処理
   *
   * ループ防止機能:
   * - processingフラグで多重実行を防止
   * - キューが空になったら処理を終了
   */
  private async processQueue(): Promise<void> {
    // 多重実行防止: 既に処理中の場合は何もしない
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        // レート制限チェック
        if (!this.canMakeRequest()) {
          // レート制限に達した場合は待機
          const waitTime = this.getWaitTime();
          if (waitTime > 0) {
            await this.sleep(waitTime);
            continue;
          } else {
            // 1日の制限に達した場合はキューをクリア
            this.rejectAllQueued('1日のレート制限に達しました');
            break;
          }
        }

        // キューから1つ取り出す
        const item = this.queue.shift();
        if (!item) break;

        // タイムアウトチェック
        const elapsed = Date.now() - item.createdAt;
        if (elapsed > this.config.requestTimeout) {
          item.reject(new Error('リクエストがタイムアウトしました'));
          continue;
        }

        // リクエスト実行
        await this.executeItem(item);

        // 次のリクエストまで少し待機（レート制限の余裕を持たせる）
        await this.sleep(100);
      }
    } finally {
      // 処理終了: フラグをリセット
      this.processing = false;
    }
  }

  /**
   * キューアイテムを実行
   *
   * リトライ機能:
   * - 最大リトライ回数まで再試行
   * - 無限ループ防止のため回数制限あり
   */
  private async executeItem<T>(item: QueueItem<T>): Promise<void> {
    try {
      // アクティブリクエストとしてマーク（重複実行防止）
      this.activeRequests.add(item.id);

      // リクエスト実行
      const result = await item.fn();

      // リクエスト成功: 記録
      this.recordRequest(item.id);

      // 成功をresolve
      item.resolve(result);
    } catch (error) {
      // リトライ判定
      if (item.retryCount < this.config.maxRetries && this.isRetryableError(error)) {
        // リトライカウントを増加
        item.retryCount++;

        // 指数バックオフで待機
        const backoffTime = Math.min(1000 * Math.pow(2, item.retryCount - 1), 10000);
        await this.sleep(backoffTime);

        // キューに再度追加（最後尾に）
        this.queue.push(item);
      } else {
        // リトライ上限に達したか、リトライ不可能なエラー
        item.reject(error as Error);
      }
    } finally {
      // アクティブリクエストから削除
      this.activeRequests.delete(item.id);
    }
  }

  /**
   * リクエストを記録
   */
  private recordRequest(id: string): void {
    const now = Date.now();
    const record: RequestRecord = { timestamp: now, id };

    this.minuteRequests.push(record);
    this.dayRequests.push(record);

    // 古いレコードを削除
    this.cleanupOldRequests();
  }

  /**
   * 古いリクエストレコードを削除
   */
  private cleanupOldRequests(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    this.minuteRequests = this.minuteRequests.filter((r) => r.timestamp > oneMinuteAgo);
    this.dayRequests = this.dayRequests.filter((r) => r.timestamp > oneDayAgo);
  }

  /**
   * リクエスト可能かチェック
   */
  private canMakeRequest(): boolean {
    this.cleanupOldRequests();

    const minuteOk = this.minuteRequests.length < this.config.maxRequestsPerMinute;
    const dayOk = this.dayRequests.length < this.config.maxRequestsPerDay;

    return minuteOk && dayOk;
  }

  /**
   * 待機時間を計算
   */
  private getWaitTime(): number {
    this.cleanupOldRequests();

    if (this.dayRequests.length >= this.config.maxRequestsPerDay) {
      // 1日の制限に達した場合は-1を返す（待機不可）
      return -1;
    }

    if (this.minuteRequests.length >= this.config.maxRequestsPerMinute) {
      // 1分間の制限に達した場合は、最も古いリクエストから1分経過するまでの時間を返す
      const oldestRequest = this.minuteRequests[0];
      const oneMinuteLater = oldestRequest.timestamp + 60 * 1000;
      const waitTime = oneMinuteLater - Date.now();
      return Math.max(0, waitTime);
    }

    return 0;
  }

  /**
   * キュー内の全リクエストを拒否
   */
  private rejectAllQueued(reason: string): void {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        item.reject(new Error(reason));
      }
    }
  }

  /**
   * リトライ可能なエラーか判定
   */
  private isRetryableError(error: any): boolean {
    // ネットワークエラーやレート制限エラーはリトライ可能
    const message = error?.message || '';
    const status = error?.status || error?.statusCode;

    // レート制限エラー
    if (status === 429) return true;

    // サーバーエラー（5xx）
    if (status >= 500 && status < 600) return true;

    // タイムアウト
    if (message.includes('timeout') || message.includes('ETIMEDOUT')) return true;

    // ネットワークエラー
    if (message.includes('network') || message.includes('ECONNRESET')) return true;

    // その他のエラーはリトライしない（無限ループ防止）
    return false;
  }

  /**
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * リクエストIDを生成
   */
  private generateRequestId(): string {
    this.requestIdCounter++;
    return `req_${Date.now()}_${this.requestIdCounter}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * 統計情報を取得
   */
  getStats() {
    this.cleanupOldRequests();
    return {
      minuteRequests: this.minuteRequests.length,
      maxMinuteRequests: this.config.maxRequestsPerMinute,
      dayRequests: this.dayRequests.length,
      maxDayRequests: this.config.maxRequestsPerDay,
      queueLength: this.queue.length,
      activeRequests: this.activeRequests.size,
      processing: this.processing,
    };
  }

  /**
   * キューをクリア（緊急時用）
   */
  clearQueue(): void {
    this.rejectAllQueued('キューが手動でクリアされました');
  }
}

// シングルトンインスタンス（アプリケーション全体で1つのみ）
let globalRateLimiter: RateLimiter | null = null;

/**
 * グローバルなレート制限マネージャーを取得
 *
 * シングルトンパターンで多重インスタンス化を防止
 */
export function getRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter(config);
  }
  return globalRateLimiter;
}

/**
 * レート制限マネージャーをリセット（テスト用）
 */
export function resetRateLimiter(): void {
  globalRateLimiter = null;
}
