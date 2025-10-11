/**
 * サーキットブレーカー
 * 認証エラーが連続発生した場合の保護機構
 */

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

class AuthCircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    successCount: 0,
  };

  private readonly maxFailures = 3; // 3回連続失敗でサーキットオープン
  private readonly timeoutMs = 30000; // 30秒間サーキットオープン
  private readonly resetTimeoutMs = 60000; // 1分後にリセット

  /**
   * サーキットブレーカーがオープンかどうかチェック
   */
  isOpen(): boolean {
    const now = Date.now();

    // タイムアウト後にリセット
    if (this.state.isOpen && now - this.state.lastFailureTime > this.resetTimeoutMs) {
      this.reset();
      return false;
    }

    return this.state.isOpen;
  }

  /**
   * 失敗を記録
   */
  recordFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.maxFailures) {
      this.state.isOpen = true;
      console.warn('認証サーキットブレーカー: オープン（認証エラーが連続発生）');
    }
  }

  /**
   * 成功を記録
   */
  recordSuccess(): void {
    this.state.successCount++;
    this.state.failureCount = 0;

    if (this.state.successCount >= 2) {
      this.state.isOpen = false;
      console.log('認証サーキットブレーカー: クローズ（認証が正常化）');
    }
  }

  /**
   * サーキットブレーカーをリセット
   */
  reset(): void {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
    };
    console.log('認証サーキットブレーカー: リセット');
  }

  /**
   * 現在の状態を取得
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

// シングルトンインスタンス
export const authCircuitBreaker = new AuthCircuitBreaker();
