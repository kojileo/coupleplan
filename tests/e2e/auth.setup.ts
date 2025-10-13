import { test as setup, expect } from '@playwright/test';
import { getTestUser, getPartnerUser } from './helpers/test-users';

/**
 * 認証セットアップ
 *
 * このファイルは、E2Eテスト実行前にテストユーザーでログインし、
 * 認証状態（Cookie、LocalStorage）を保存します。
 *
 * これにより、各テストでログインを繰り返す必要がなくなります。
 */

const authFile = '.auth/user.json';
const partnerAuthFile = '.auth/partner.json';

// テストユーザーの認証セットアップ
setup('authenticate as test user', async ({ page }) => {
  const user = getTestUser();
  console.log(`\n🔐 Setting up authentication for: ${user.email}`);

  // ログインページへ移動
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // メールアドレスを入力
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(user.email);

  // パスワードを入力
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(user.password);

  // ログインボタンをクリック
  const loginButton = page.locator('button[type="submit"], button:has-text("ログイン")').first();
  await loginButton.click();

  // ログイン成功を待機
  // ダッシュボードへのリダイレクトまたはエラーがないことを確認
  await page.waitForTimeout(3000);

  const currentURL = page.url();
  console.log(`📍 Current URL: ${currentURL}`);

  // エラーがないことを確認
  const hasError = await page
    .getByText(/エラー|失敗|正しくありません/i)
    .isVisible()
    .catch(() => false);

  if (hasError) {
    const errorText = await page.getByText(/エラー|失敗|正しくありません/i).textContent();
    console.error(`❌ Login failed: ${errorText}`);
    throw new Error(`Authentication setup failed: ${errorText}`);
  }

  // ダッシュボードまたはホームページにいることを確認
  const isAuthenticated =
    currentURL.includes('/dashboard') ||
    !currentURL.includes('/login');

  if (!isAuthenticated) {
    console.warn(`⚠️ Authentication may have failed. Current URL: ${currentURL}`);
  } else {
    console.log(`✅ Authentication successful for: ${user.email}`);
  }

  // 認証状態を保存
  await page.context().storageState({ path: authFile });
  console.log(`💾 Saved auth state to: ${authFile}`);
});

// パートナーユーザーの認証セットアップ
setup('authenticate as partner user', async ({ page }) => {
  const partner = getPartnerUser();
  console.log(`\n🔐 Setting up authentication for partner: ${partner.email}`);

  // ログインページへ移動
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // メールアドレスを入力
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(partner.email);

  // パスワードを入力
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(partner.password);

  // ログインボタンをクリック
  const loginButton = page.locator('button[type="submit"], button:has-text("ログイン")').first();
  await loginButton.click();

  // ログイン成功を待機
  await page.waitForTimeout(3000);

  const currentURL = page.url();
  console.log(`📍 Current URL: ${currentURL}`);

  // エラーがないことを確認
  const hasError = await page
    .getByText(/エラー|失敗|正しくありません/i)
    .isVisible()
    .catch(() => false);

  if (hasError) {
    const errorText = await page.getByText(/エラー|失敗|正しくありません/i).textContent();
    console.error(`❌ Partner login failed: ${errorText}`);
    throw new Error(`Partner authentication setup failed: ${errorText}`);
  }

  console.log(`✅ Authentication successful for partner: ${partner.email}`);

  // 認証状態を保存
  await page.context().storageState({ path: partnerAuthFile });
  console.log(`💾 Saved partner auth state to: ${partnerAuthFile}`);
});
