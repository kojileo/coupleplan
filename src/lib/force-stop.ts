/**
 * 強制停止スクリプト
 * ブラウザコンソールから実行可能な緊急停止機能
 */

import { authStopManager } from './auth-stop';
import { clearSession } from './manual-auth';

/**
 * 即座に認証システムを停止
 */
export function forceStopAuth(): void {
  console.warn('🚨 認証システムを強制停止します...');

  // 1. グローバル停止フラグを設定
  authStopManager.stop('強制停止（手動実行）');

  // 2. セッションをクリア
  clearSession().then(() => {
    console.warn('✅ セッションをクリアしました');
  });

  // 3. ローカルストレージをクリア
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    console.warn('✅ ローカルストレージをクリアしました');
  }

  console.warn('🔄 ページをリロードしてください');
}

/**
 * 認証システムを再開
 */
export function forceResumeAuth(): void {
  console.log('✅ 認証システムを再開します...');
  authStopManager.resume();
  console.log('✅ 認証システムが再開されました');
}

/**
 * 認証システムの状態を確認
 */
export function checkAuthStatus(): void {
  const status = authStopManager.getStopInfo();
  console.log('📊 認証システムの状態:', status);
}

// グローバルに公開（ブラウザコンソールから実行可能）
if (typeof window !== 'undefined') {
  (window as any).forceStopAuth = forceStopAuth;
  (window as any).forceResumeAuth = forceResumeAuth;
  (window as any).checkAuthStatus = checkAuthStatus;

  console.log('🔧 緊急停止コマンドが利用可能です:');
  console.log('  - forceStopAuth() : 認証システムを強制停止');
  console.log('  - forceResumeAuth() : 認証システムを再開');
  console.log('  - checkAuthStatus() : 認証システムの状態を確認');
}
