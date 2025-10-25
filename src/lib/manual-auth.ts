/**
 * 手動認証管理
 * 自動リフレッシュを無効化した場合の手動認証処理
 */

import { authStopManager } from './auth-stop';
import { authCircuitBreaker } from './circuit-breaker';
import { supabase } from './supabase-auth';

export interface AuthStatus {
  isAuthenticated: boolean;
  needsRefresh: boolean;
  error?: string;
}

/**
 * 認証状態を手動でチェック（グローバル停止フラグ対応）
 */
export async function checkAuthStatus(): Promise<AuthStatus> {
  // グローバル停止フラグをチェック
  if (authStopManager.isAuthStopped()) {
    return {
      isAuthenticated: false,
      needsRefresh: false,
      error: '認証システムが停止中です。しばらく待ってから再試行してください。',
    };
  }

  // サーキットブレーカーがオープンの場合は認証チェックをスキップ
  if (authCircuitBreaker.isOpen()) {
    return {
      isAuthenticated: false,
      needsRefresh: false,
      error: '認証システムが一時的に利用できません。しばらく待ってから再試行してください。',
    };
  }

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      // リフレッシュトークンエラーの場合はグローバル停止をトリガー
      if (
        error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('Invalid Refresh Token')
      ) {
        console.warn('リフレッシュトークンエラーを検出。認証システムを停止します。');
        authStopManager.autoStopOnRefreshTokenError();
        authCircuitBreaker.recordFailure();
      }

      return {
        isAuthenticated: false,
        needsRefresh: false,
        error: error.message,
      };
    }

    if (!session) {
      return {
        isAuthenticated: false,
        needsRefresh: false,
      };
    }

    // トークンの有効期限をチェック
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    const needsRefresh = expiresAt - now < 300; // 5分以内に期限切れ

    // 成功を記録
    authCircuitBreaker.recordSuccess();

    return {
      isAuthenticated: true,
      needsRefresh,
    };
  } catch (error) {
    // エラーを記録
    authCircuitBreaker.recordFailure();

    return {
      isAuthenticated: false,
      needsRefresh: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 手動でトークンをリフレッシュ（レート制限を考慮）
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      // レート制限エラーの場合は特別な処理
      if (
        error.message?.includes('rate limit') ||
        error.message?.includes('over_request_rate_limit')
      ) {
        console.warn(
          'トークンリフレッシュ: レート制限に達しています。しばらく待ってから再試行してください。'
        );
        return false;
      }

      console.error('トークンリフレッシュエラー:', error);
      return false;
    }

    console.log('トークンリフレッシュ成功');
    return true;
  } catch (error) {
    console.error('トークンリフレッシュ失敗:', error);
    return false;
  }
}

/**
 * 安全な認証チェック（レート制限を考慮）
 */
export async function safeAuthCheck(): Promise<AuthStatus> {
  try {
    // まず現在のセッションをチェック
    const status = await checkAuthStatus();

    // リフレッシュが必要な場合のみ実行
    if (status.isAuthenticated && status.needsRefresh) {
      console.log('トークンリフレッシュが必要です');

      // リフレッシュを試行（失敗してもセッションは維持）
      const refreshSuccess = await refreshToken();

      if (!refreshSuccess) {
        console.warn('トークンリフレッシュに失敗しましたが、セッションは維持します');
      }
    }

    return status;
  } catch (error) {
    console.error('安全な認証チェック失敗:', error);
    return {
      isAuthenticated: false,
      needsRefresh: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * セッションを完全にクリア
 */
export async function clearSession(): Promise<void> {
  try {
    // Supabaseセッションをクリア
    await supabase.auth.signOut();

    // ローカルストレージをクリア
    if (typeof window !== 'undefined') {
      localStorage.removeItem(
        'sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token'
      );
      sessionStorage.clear();
    }

    console.log('セッションをクリアしました');
  } catch (error) {
    console.error('セッションクリアエラー:', error);
  }
}

/**
 * 破損したセッションを検出してクリア
 */
export async function detectAndClearCorruptedSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      // リフレッシュトークンエラーの場合はセッションをクリア
      if (
        error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('Invalid Refresh Token')
      ) {
        console.warn('破損したセッションを検出しました。クリアします。');
        await clearSession();
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('セッション検出エラー:', error);
    return false;
  }
}

/**
 * 認証状態の監視（定期的なチェック）
 */
export class AuthMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMs: number = 300000): void {
    // デフォルト5分間隔
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      try {
        // 破損したセッションをチェック
        const isCorrupted = await detectAndClearCorruptedSession();
        if (isCorrupted) {
          console.log('破損したセッションをクリアしました');
          return;
        }

        const status = await safeAuthCheck();
        console.log('認証状態監視:', status);
      } catch (error) {
        console.error('認証状態監視エラー:', error);
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}
