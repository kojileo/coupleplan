/**
 * テストユーザー管理ヘルパー
 *
 * E2Eテストで使用するテストユーザーの管理を行います。
 */

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

/**
 * 環境変数からテストユーザー情報を取得
 */
export function getTestUser(): TestUser {
  return {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'password123',
    name: 'Test User',
  };
}

/**
 * パートナーユーザー情報を取得
 */
export function getPartnerUser(): TestUser {
  return {
    email: process.env.TEST_PARTNER_EMAIL || 'partner@example.com',
    password: process.env.TEST_PARTNER_PASSWORD || 'password123',
    name: 'Partner User',
  };
}

/**
 * ランダムな新規ユーザーを生成
 */
export function generateNewUser(): TestUser {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);

  return {
    email: `test+${timestamp}+${randomId}@example.com`,
    password: 'SecurePass123!',
    name: `Test User ${randomId}`,
  };
}

/**
 * テスト用の無効なユーザー情報
 */
export function getInvalidUser(): TestUser {
  return {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  };
}

/**
 * 環境情報を取得
 */
export function getEnvironmentInfo() {
  return {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    isLocal: (process.env.BASE_URL || '').includes('localhost'),
    isStaging: (process.env.BASE_URL || '').includes('staging'),
    isProduction:
      (process.env.BASE_URL || '').includes('vercel.app') &&
      !(process.env.BASE_URL || '').includes('staging'),
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  };
}

/**
 * ログ出力用のヘルパー
 */
export function logTestInfo(testName: string, user?: TestUser) {
  const env = getEnvironmentInfo();
  console.log(`\n🧪 Test: ${testName}`);
  console.log(`🌐 Environment: ${env.baseURL}`);
  if (user) {
    console.log(`👤 User: ${user.email}`);
  }
}
