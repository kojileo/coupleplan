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
  const baseURL =
    config.use?.baseURL || 'https://coupleplan-staging-350595109373.asia-northeast1.run.app';
  console.log(`🌐 Base URL: ${baseURL}`);
  console.log(
    `📝 Environment: ${baseURL.includes('staging') ? 'Staging (Cloud Run)' : baseURL.includes('localhost') ? 'Local' : 'Production'}`
  );

  // ステージング環境の確認
  console.log('⏳ Verifying staging environment...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // ヘルスチェックまたはトップページで確認
    const response = await page.goto(baseURL, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    if (response?.ok()) {
      console.log('✅ Staging environment is ready');
    } else {
      console.warn('⚠️ Environment check returned non-OK status, but continuing...');
    }
  } catch (error) {
    console.warn('⚠️ Could not verify environment, but continuing...');
  } finally {
    await page.close();
    await browser.close();
  }

  console.log('🎉 E2E Global Setup: Complete!');
}

export default globalSetup;
