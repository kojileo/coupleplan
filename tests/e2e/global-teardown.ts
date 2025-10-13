import { FullConfig } from '@playwright/test';

/**
 * Playwright E2E Global Teardown
 *
 * E2Eテスト実行後のグローバルクリーンアップ
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 E2E Global Teardown: Starting...');

  // 必要に応じてクリーンアップ処理を追加
  // - テストデータの削除
  // - テストユーザーの削除
  // - 一時ファイルの削除

  console.log('✅ E2E Global Teardown: Complete!');
}

export default globalTeardown;
