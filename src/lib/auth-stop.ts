/**
 * グローバル認証停止フラグ
 * アプリケーション全体で認証チェックを停止
 */

class AuthStopManager {
  private isStopped: boolean = false;
  private stopReason: string = '';
  private stopTime: number = 0;

  /**
   * 認証システムを停止
   */
  stop(reason: string = '手動停止'): void {
    this.isStopped = true;
    this.stopReason = reason;
    this.stopTime = Date.now();
    console.warn(`🚨 認証システムが停止されました: ${reason}`);
  }

  /**
   * 認証システムを再開
   */
  resume(): void {
    this.isStopped = false;
    this.stopReason = '';
    this.stopTime = 0;
    console.log('✅ 認証システムが再開されました');
  }

  /**
   * 認証システムが停止中かどうか
   */
  isAuthStopped(): boolean {
    return this.isStopped;
  }

  /**
   * 停止情報を取得
   */
  getStopInfo(): {
    isStopped: boolean;
    reason: string;
    stopTime: string;
    duration: number;
  } {
    return {
      isStopped: this.isStopped,
      reason: this.stopReason,
      stopTime: new Date(this.stopTime).toISOString(),
      duration: this.isStopped ? Date.now() - this.stopTime : 0,
    };
  }

  /**
   * 自動停止（リフレッシュトークンエラー検出時）
   */
  autoStopOnRefreshTokenError(): void {
    this.stop('リフレッシュトークンエラーの無限ループ検出');
  }
}

// グローバルインスタンス
export const authStopManager = new AuthStopManager();

/**
 * 認証システムの緊急停止（ブラウザコンソールから実行可能）
 */
export function emergencyAuthStop(): void {
  authStopManager.autoStopOnRefreshTokenError();
  console.warn('🚨 認証システムが緊急停止されました');
  console.warn('📝 ページをリロードしてください');
}

/**
 * 認証システムの再開（ブラウザコンソールから実行可能）
 */
export function resumeAuth(): void {
  authStopManager.resume();
  console.log('✅ 認証システムが再開されました');
}

// グローバルに公開（ブラウザコンソールから実行可能）
if (typeof window !== 'undefined') {
  (window as any).emergencyAuthStop = emergencyAuthStop;
  (window as any).resumeAuth = resumeAuth;
  (window as any).authStopManager = authStopManager;
}
