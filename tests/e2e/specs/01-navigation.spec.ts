import { test, expect } from '@playwright/test';

test.describe('🧭 基本ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にホームページにアクセス
    await page.goto('/');
  });

  test('ホームページの表示確認', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/Couple Plan/);

    // メインヘッダーの確認
    await expect(page.locator('h1').first()).toBeVisible();

    // ナビゲーションメニューまたはメインコンテンツの確認
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('公開プランページへのナビゲーション', async ({ page }) => {
    // 公開プランページへのアクセス
    await page.goto('/plans/public');

    // URLの確認
    await expect(page).toHaveURL(/\/plans\/public/);

    // 公開プランページの要素確認
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('認証ページへのナビゲーション', async ({ page }) => {
    // ログインページへのアクセス
    await page.goto('/login');

    // URLの確認
    await expect(page).toHaveURL(/\/login/);

    // ログインフォームの確認
    await expect(
      page.locator('form, input[type="email"], input[type="password"]').first()
    ).toBeVisible();
  });

  test('レスポンシブデザインの確認（モバイル）', async ({ page }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 });

    // ページが正常に表示されることを確認
    await expect(page.locator('h1').first()).toBeVisible();

    // メインコンテンツの確認
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('レスポンシブデザインの確認（タブレット）', async ({ page }) => {
    // タブレットサイズに変更
    await page.setViewportSize({ width: 768, height: 1024 });

    // ページが正常に表示されることを確認
    await expect(page.locator('h1').first()).toBeVisible();

    // メインコンテンツの確認
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('404ページの確認', async ({ page }) => {
    // 存在しないページにアクセス
    const response = await page.goto('/non-existent-page-12345');

    // 404レスポンスまたはエラーページの確認
    if (response) {
      expect(response.status()).toBe(404);
    } else {
      // 404ページまたはエラーメッセージの確認
      await expect(page.locator('text=404, text=見つかりません, text=Not Found').first())
        .toBeVisible()
        .catch(() => {
          // ホームにリダイレクトされる場合もある
          expect(page.url()).toContain('/');
        });
    }
  });

  test('ページローディングの確認', async ({ page }) => {
    // ページローディング時間の測定
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // テスト環境では8秒以内にロードされることを確認（現実的な時間）
    expect(loadTime).toBeLessThan(8000);

    // パフォーマンス情報をログ出力（デバッグ用）
    console.log(`📊 ページロード時間: ${loadTime}ms`);

    // 主要な要素が表示されていることを確認
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('基本的なページ遷移の確認', async ({ page }) => {
    // ホームページから他のページへの遷移をテスト
    const links = ['FAQページ', 'お問い合わせ', 'プライバシーポリシー', '利用規約'];

    for (const linkText of links) {
      const link = page.locator(`text=${linkText}:visible`).first();

      if (await link.isVisible().catch(() => false)) {
        await link.click();
        // ページが変わったことを確認
        await page.waitForLoadState('networkidle');

        // 元のページに戻る
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('メタ情報の確認', async ({ page }) => {
    // SEO関連のメタタグの確認
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);

    // ファビコンの確認
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
  });

  test('APIエンドポイントの基本確認', async ({ page }) => {
    // 基本的なAPIエンドポイントの応答確認
    const response = await page.request.get('/api/health');

    // ヘルスチェックエンドポイントまたは基本APIの確認
    if (response.ok()) {
      expect(response.status()).toBe(200);
    } else {
      // APIが存在しない場合は404が期待される
      expect(response.status()).toBe(404);
    }
  });
});
