/**
 * デバッグ用認証ユーティリティ
 * 開発中に認証エラーを解決するためのヘルパー関数
 */

import { supabase } from './supabase-auth';

/**
 * セッションを強制的にクリア
 */
export async function forceClearSession(): Promise<void> {
  try {
    console.log('セッションを強制的にクリアしています...');

    // Supabaseセッションをクリア
    await supabase.auth.signOut();

    // ローカルストレージをクリア
    if (typeof window !== 'undefined') {
      // Supabase関連のキーを全て削除
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // セッションストレージもクリア
      sessionStorage.clear();

      console.log('ローカルストレージとセッションストレージをクリアしました');
    }

    console.log('セッションクリア完了');
  } catch (error) {
    console.error('セッションクリアエラー:', error);
  }
}

/**
 * 認証状態をデバッグ出力
 */
export async function debugAuthStatus(): Promise<void> {
  try {
    console.log('=== 認証状態デバッグ ===');

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log('Session:', session);
    console.log('Error:', error);

    if (session) {
      console.log('User:', session.user);
      console.log('Access Token:', session.access_token ? 'exists' : 'missing');
      console.log('Refresh Token:', session.refresh_token ? 'exists' : 'missing');
      console.log('Expires At:', new Date(session.expires_at! * 1000));
    }

    console.log('=== デバッグ完了 ===');
  } catch (error) {
    console.error('デバッグエラー:', error);
  }
}

// グローバルに公開（開発環境のみ）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).clearAuth = forceClearSession;
  (window as any).debugAuth = debugAuthStatus;

  console.log('デバッグ用関数が利用可能です:');
  console.log('- clearAuth(): セッションを強制クリア');
  console.log('- debugAuth(): 認証状態をデバッグ出力');
}
