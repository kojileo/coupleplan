import { Page, expect } from '@playwright/test';

// テスト用パスワードを環境変数または動的生成で取得
const getTestPassword = () => process.env.E2E_TEST_PASSWORD || `Test${Date.now()}!`;

/**
 * テストユーザー情報
 */
export const TEST_USER = {
  email: 'e2e-test@example.com',
  password: getTestPassword(),
  name: 'E2Eテストユーザー',
};

/**
 * ユーザーログイン処理
 */
export async function loginUser(
  page: Page,
  email: string = TEST_USER.email,
  password: string = TEST_USER.password
) {
  console.log(`🔐 ユーザーログイン: ${email}`);

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // ログインフォームに入力
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ログイン成功をダッシュボードの表示で確認
  await expect(page).toHaveURL(/\/plans/);
  console.log('✅ ログイン完了');
}

/**
 * ユーザーログアウト処理
 */
export async function logoutUser(page: Page) {
  console.log('🚪 ユーザーログアウト');

  // ナビゲーションメニューからログアウト
  await page.click('[data-testid="user-menu"]').catch(() => {
    // メニューが見つからない場合は直接ログアウトページへ
    return page.goto('/logout');
  });

  await page.click('text=ログアウト').catch(() => {
    // テキストが見つからない場合は代替手段
    return page.goto('/logout');
  });

  // ホームページに戻ることを確認
  await expect(page).toHaveURL('/');
  console.log('✅ ログアウト完了');
}

/**
 * テストプランデータの作成
 */
export async function createTestPlan(page: Page, planData?: Partial<TestPlanData>) {
  const defaultPlan: TestPlanData = {
    title: 'E2Eテストプラン',
    description: '自動テストで作成されたプラン',
    date: '2024-12-31',
    budget: '10000',
    locations: ['https://example.com'],
    region: 'tokyo',
    ...planData,
  };

  console.log(`📝 テストプラン作成: ${defaultPlan.title}`);

  await page.goto('/plans/new');
  await page.waitForLoadState('networkidle');

  // プラン情報入力
  await page.fill('input[name="title"]', defaultPlan.title);
  await page.fill('textarea[name="description"]', defaultPlan.description);
  await page.fill('input[type="date"]', defaultPlan.date);
  await page.fill('input[type="number"]', defaultPlan.budget);

  // 場所URL追加
  if (defaultPlan.locations.length > 0) {
    await page.fill('input[type="url"]', defaultPlan.locations[0]);
  }

  // 地域選択
  await page.selectOption('select[name="region"]', defaultPlan.region);

  // 保存
  await page.click('button[type="submit"]');

  // 作成成功を確認
  await expect(page).toHaveURL(/\/plans\/[^\/]+$/);
  console.log('✅ テストプラン作成完了');

  return defaultPlan;
}

/**
 * 要素が表示されるまで待機
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 10000) {
  await page.waitForSelector(selector, { timeout });
}

/**
 * テキストが表示されるまで待機
 */
export async function waitForText(page: Page, text: string, timeout: number = 10000) {
  await page.waitForFunction((text) => document.body.innerText.includes(text), text, { timeout });
}

/**
 * スクリーンショット撮影（デバッグ用）
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * エラーメッセージの確認
 */
export async function expectErrorMessage(page: Page, message: string) {
  await expect(page.locator('.error, .alert-error, [role="alert"]')).toContainText(message);
}

/**
 * 成功メッセージの確認
 */
export async function expectSuccessMessage(page: Page, message: string) {
  await expect(page.locator('.success, .alert-success, [role="status"]')).toContainText(message);
}

/**
 * テストプランデータの型定義
 */
interface TestPlanData {
  title: string;
  description: string;
  date: string;
  budget: string;
  locations: readonly string[] | string[];
  region: string;
}
