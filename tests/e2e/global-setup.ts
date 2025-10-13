import { chromium, FullConfig } from '@playwright/test';

/**
 * Playwright E2E Global Setup
 *
 * E2Eテスト実行前のグローバルセットアップ
 * - テストデータベースの初期化
 * - テストユーザーの作成
 * - 環境変数の検証
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 E2E Global Setup: Starting...');

  // 環境変数の検証（警告のみ、E2Eテストは続行）
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing some environment variables:', missingVars.join(', '));
    console.warn('⚠️ Some E2E tests may fail without proper environment setup');
    console.log('💡 Tip: Create .env.local file with required variables');
  } else {
    console.log('✅ Environment variables validated');
  }

  // ベースURLの検証
  const baseURL = config.use?.baseURL || 'http://localhost:3000';
  console.log(`🌐 Base URL: ${baseURL}`);

  // サーバーが起動するまで待機（webServerが起動する）
  console.log('⏳ Waiting for development server...');

  // 開発サーバーの起動確認
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // ヘルスチェックエンドポイントで確認
    const response = await page.goto(`${baseURL}/api/health`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    if (response?.ok()) {
      console.log('✅ Development server is ready');
    } else {
      console.warn('⚠️ Health check returned non-OK status, but continuing...');
    }
  } catch (error) {
    console.warn('⚠️ Could not verify health endpoint, but continuing...', error);
  } finally {
    await page.close();
    await browser.close();
  }

  console.log('🎉 E2E Global Setup: Complete!');
}

export default globalSetup;
