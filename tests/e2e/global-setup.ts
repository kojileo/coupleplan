import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 E2Eテストのグローバルセットアップを開始...');

  // 環境変数の設定
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  }

  // テスト用のデータベース設定（必要に応じて）
  // await setupTestDatabase();

  // 基本的な接続確認
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // アプリケーションが起動していることを確認
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ アプリケーションの起動を確認');
  } catch (error) {
    console.error('❌ アプリケーションへの接続に失敗:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ E2Eテストのグローバルセットアップが完了');
}

export default globalSetup;
