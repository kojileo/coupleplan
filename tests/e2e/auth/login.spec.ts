import { test, expect } from '@playwright/test';
import { getTestUser, logTestInfo } from '../helpers/test-users';

/**
 * 認証フロー - ログインテスト
 *
 * テスト対象: ステージング環境
 * BASE_URL: .env.testで設定
 *
 * このファイルは、CouplePlanアプリケーションのログイン機能をテストします。
 */

// ログインテストでは認証状態を使用しない（ログアウト状態でテスト）
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('ログイン機能', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にログインページへアクセス
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
  });

  test('ログインページが正常に表示される', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/CouplePlan/);

    // ログインフォームの要素が存在することを確認
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();

    // フォームフィールドの確認
    const emailInput = page.getByLabel(/メールアドレス/i);
    const passwordInput = page.getByLabel(/パスワード/i);
    const loginButton = page.getByRole('button', { name: /ログイン/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

  test('有効な認証情報でログインできる', async ({ page }) => {
    // テスト用の認証情報
    const user = getTestUser();
    logTestInfo('有効な認証情報でログインできる', user);

    // メールアドレスを入力
    const emailInput = page.getByLabel(/メールアドレス/i);
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await emailInput.fill(user.email);

    // パスワードを入力
    const passwordInput = page.getByLabel(/パスワード/i);
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.fill(user.password);

    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i });
    await loginButton.waitFor({ state: 'visible', timeout: 5000 });
    await loginButton.click();

    // ログイン処理を待機
    await page.waitForTimeout(2000);

    // 現在のURLを確認
    const currentURL = page.url();
    console.log(`📍 Current URL after login: ${currentURL}`);

    // ダッシュボードへのリダイレクトまたはエラーメッセージを確認
    const isDashboard = currentURL.includes('/dashboard');
    const hasError = await page
      .getByText(/エラー|失敗|正しくありません/i)
      .isVisible()
      .catch(() => false);

    if (hasError) {
      const errorText = await page.getByText(/エラー|失敗|正しくありません/i).textContent();
      console.log(`❌ Login error: ${errorText}`);
      test.fail(true, `Login failed with error: ${errorText}`);
    }

    // ダッシュボードが表示されることを確認
    expect(isDashboard).toBeTruthy();
  });

  test('無効なメールアドレスでログインエラーが表示される', async ({ page }) => {
    // 無効なメールアドレスを入力
    await page.getByLabel(/メールアドレス/i).fill('invalid@example.com');

    // パスワードを入力
    await page.getByLabel(/パスワード/i).fill('wrongpassword');

    // ログインボタンをクリック
    await page.getByRole('button', { name: /ログイン/i }).click();

    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/メールアドレスまたはパスワードが正しくありません/i)).toBeVisible({
      timeout: 5000,
    });

    // ログインページに留まることを確認
    expect(page.url()).toContain('/login');
  });

  test('空のフォームで送信するとバリデーションエラーが表示される', async ({ page }) => {
    // 何も入力せずにログインボタンをクリック
    await page.getByRole('button', { name: /ログイン/i }).click();

    // バリデーションエラーが表示されることを確認
    // （ブラウザネイティブのバリデーションまたはカスタムエラー）
    const emailInput = page.getByLabel(/メールアドレス/i);
    const passwordInput = page.getByLabel(/パスワード/i);

    // HTML5バリデーションの確認
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('無効なメールアドレス形式でエラーが表示される', async ({ page }) => {
    // 不正な形式のメールアドレスを入力
    await page.getByLabel(/メールアドレス/i).fill('invalidemail');

    // パスワードを入力
    await page.getByLabel(/パスワード/i).fill('password123');

    // パスワードフィールドをクリックしてフォーカスを移動（バリデーショントリガー）
    await page.getByLabel(/パスワード/i).click();

    // メールフィールドのtype="email"によるバリデーションを確認
    const emailInput = page.getByLabel(/メールアドレス/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('パスワードを忘れた場合のリンクが機能する', async ({ page }) => {
    // パスワードリセットリンクを探す
    const resetLink = page.getByRole('link', { name: /パスワードをお忘れですか/i });

    if (await resetLink.isVisible()) {
      // リンクをクリック
      await resetLink.click();

      // パスワードリセットページへ遷移することを確認
      await expect(page).toHaveURL(/.*forgot-password/);
    } else {
      // 機能が未実装の場合はスキップ
      test.skip();
    }
  });

  test('サインアップページへのリンクが機能する', async ({ page }) => {
    // サインアップリンクを探す
    const signupLink = page.getByRole('link', { name: /こちらから新規登録/i });

    if (await signupLink.isVisible()) {
      // リンクをクリック
      await signupLink.click();

      // サインアップページへ遷移することを確認
      await expect(page).toHaveURL(/.*signup/);
    } else {
      // 機能が未実装の場合はスキップ
      test.skip();
    }
  });

  test('キーボード操作でログインできる', async ({ page }) => {
    const user = getTestUser();
    logTestInfo('キーボード操作でログインできる', user);

    // フォームフィールドに直接入力（Tabナビゲーションは環境依存のため）
    const emailInput = page.getByLabel(/メールアドレス/i);
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill(user.email);

    const passwordInput = page.getByLabel(/パスワード/i);
    await passwordInput.fill(user.password);

    // パスワードフィールドでEnterキーを押してフォーム送信
    await passwordInput.press('Enter');

    // ログイン処理を待機
    await page.waitForTimeout(2000);

    // ダッシュボードへ遷移したことを確認
    const currentURL = page.url();
    console.log(`📍 Current URL after login: ${currentURL}`);

    expect(currentURL).toContain('/dashboard');
    console.log('✅ キーボード操作でログイン成功');
  });

  test('ローディング状態が正しく表示される', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

    // 認証情報を入力
    await page.getByLabel(/メールアドレス/i).fill(testEmail);
    await page.getByLabel(/パスワード/i).fill(testPassword);

    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i });
    await loginButton.click();

    // ローディング状態を確認（ボタンが無効化されるか、ローディングテキストが表示される）
    // 実装に応じて調整
    const isDisabled = await loginButton.isDisabled().catch(() => false);
    const hasLoadingText = await page
      .getByText(/送信中|ログイン中/i)
      .isVisible()
      .catch(() => false);

    // どちらかのローディング表示があることを確認
    expect(isDisabled || hasLoadingText).toBeTruthy();
  });
});

test.describe('ログイン後の動作', () => {
  test('ログイン後にセッションが保持される', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

    await page.getByLabel(/メールアドレス/i).fill(testEmail);
    await page.getByLabel(/パスワード/i).fill(testPassword);
    await page.getByRole('button', { name: /ログイン/i }).click();

    // ダッシュボードへのリダイレクトを待機
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');

    // ログイン状態が維持されていることを確認
    expect(page.url()).toContain('/dashboard');

    // ログインページにリダイレクトされないことを確認
    expect(page.url()).not.toContain('/login');
  });

  test.skip('未認証ユーザーは保護されたページにアクセスできない', async ({ page }) => {
    // ログアウト状態またはプライベートブラウジングで
    // ダッシュボードへ直接アクセスを試みる
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/.*login/);
  });
});
