/**
 * 緊急停止機能
 * 認証システムの完全停止とリセット
 */

import { authCircuitBreaker } from './circuit-breaker';
import { clearSession } from './manual-auth';

/**
 * 認証システムの緊急停止
 */
export async function emergencyStop(): Promise<void> {
  try {
    console.warn('🚨 認証システムの緊急停止を実行します');

    // 1. サーキットブレーカーを強制的にオープン
    authCircuitBreaker.reset();
    for (let i = 0; i < 10; i++) {
      authCircuitBreaker.recordFailure();
    }

    // 2. 全てのセッションをクリア
    await clearSession();

    // 3. ローカルストレージを完全にクリア
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();

      // Supabase関連のキーを個別に削除
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }

    console.warn('✅ 認証システムの緊急停止が完了しました');
    console.warn('📝 手動でページをリロードしてください');
  } catch (error) {
    console.error('❌ 緊急停止の実行中にエラーが発生しました:', error);
  }
}

/**
 * 認証システムの状態をリセット
 */
export async function resetAuthSystem(): Promise<void> {
  try {
    console.log('🔄 認証システムをリセットします');

    // 1. サーキットブレーカーをリセット
    authCircuitBreaker.reset();

    // 2. セッションをクリア
    await clearSession();

    console.log('✅ 認証システムのリセットが完了しました');
  } catch (error) {
    console.error('❌ 認証システムのリセット中にエラーが発生しました:', error);
  }
}

/**
 * 認証システムの状態を確認
 */
export function getAuthSystemStatus(): {
  circuitBreakerOpen: boolean;
  circuitBreakerState: any;
  timestamp: string;
} {
  return {
    circuitBreakerOpen: authCircuitBreaker.isOpen(),
    circuitBreakerState: authCircuitBreaker.getState(),
    timestamp: new Date().toISOString(),
  };
}
