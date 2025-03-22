// テスト用の定数を一元管理するファイル
// 環境変数から値を取得し、デフォルト値を設定

import { randomUUID } from 'crypto';

/**
 * テスト用ユーザー情報
 */
export const TEST_USER = {
  ID: process.env.TEST_USER_ID || 'test-user-id-123',
  EMAIL: process.env.TEST_USER_EMAIL || 'test@example.com',
  PASSWORD: process.env.TEST_USER_PASSWORD || 'Test123!',
};

/**
 * テスト用データベース情報
 */
export const TEST_DATABASE = {
  URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/couple_plan_test',
};

/**
 * テスト用Supabase情報
 */
export const TEST_SUPABASE = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example-test.supabase.co',
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
};

/**
 * テスト用アプリケーション情報
 */
export const TEST_APP = {
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

/**
 * テスト用認証情報
 * 毎回ランダムなトークンを生成するか、環境変数から取得
 */
export const TEST_AUTH = {
  // 環境変数から取得するか、ランダムなUUIDを生成してテストごとに異なるトークンを使用
  ACCESS_TOKEN: process.env.TEST_ACCESS_TOKEN || `test-token-${randomUUID()}`,
  REFRESH_TOKEN: process.env.TEST_REFRESH_TOKEN || `refresh-token-${randomUUID()}`,
  
  // セッション有効期限（現在から24時間後）
  EXPIRES_AT: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * モックセッションの生成
 * @param userId ユーザーID (省略時はTEST_USER.IDを使用)
 * @returns モックセッションオブジェクト
 */
export function createMockSession(userId = TEST_USER.ID) {
  return {
    access_token: TEST_AUTH.ACCESS_TOKEN,
    refresh_token: TEST_AUTH.REFRESH_TOKEN, 
    expires_at: TEST_AUTH.EXPIRES_AT,
    user: {
      id: userId,
      email: TEST_USER.EMAIL,
    }
  };
} 