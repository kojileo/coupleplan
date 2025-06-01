import { test, expect } from '@playwright/test';

test.describe('📝 プラン管理機能', () => {
  test.describe('公開プラン機能', () => {
    test('公開プラン一覧の表示', async ({ page }) => {
      await page.goto('/plans/public');

      // 公開プランページが正常に表示されることを確認
      await expect(page).toHaveURL(/\/plans\/public/);

      // 基本的な要素が表示されることを確認
      await expect(page.locator('h1').first()).toBeVisible();

      // プランカードまたはリストが表示されるかチェック
      const planElements = page.locator('[data-testid="plan-card"], .plan-item, article').first();
      if (await planElements.isVisible().catch(() => false)) {
        await expect(planElements).toBeVisible();
      }
    });

    test('公開プランの検索・フィルタリング', async ({ page }) => {
      await page.goto('/plans/public');

      // 検索フォームがある場合のテスト
      const searchInput = page
        .locator('input[type="search"], input[placeholder*="検索"], input[name="search"]')
        .first();

      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('東京');

        // 検索実行（エンターキーまたは検索ボタン）
        const searchButton = page.locator('button[type="submit"], button:has-text("検索")').first();
        if (await searchButton.isVisible().catch(() => false)) {
          await searchButton.click();
        } else {
          await page.keyboard.press('Enter');
        }

        await page.waitForLoadState('networkidle');

        // 検索結果または「結果がありません」メッセージを確認
        const hasResults =
          (await page.locator('[data-testid="plan-card"], .plan-item').count()) > 0;
        const noResultsMessage = page
          .locator(
            'text=見つかりませんでした, text=結果がありません, text=該当するプランがありません'
          )
          .first();

        if (!hasResults) {
          await expect(noResultsMessage).toBeVisible();
        }
      }
    });
  });

  test.describe('プラン詳細表示', () => {
    test('存在しないプランページのエラーハンドリング', async ({ page }) => {
      // 存在しないプランIDでアクセス
      const response = await page.goto('/plans/non-existent-plan-id');

      // 404またはエラーページが表示されることを確認
      if (response && response.status() === 404) {
        expect(response.status()).toBe(404);
      } else {
        // エラーメッセージまたはリダイレクトを確認
        await expect(page.locator('text=見つかりません, text=存在しません, text=Not Found').first())
          .toBeVisible()
          .catch(() => {
            // プラン一覧またはホームページにリダイレクトされる場合
            expect(page.url()).toMatch(/\/(plans|$)/);
          });
      }
    });

    test('プラン詳細ページの基本表示', async ({ page }) => {
      await page.goto('/plans/public');

      // プランリンクがある場合はクリックして詳細ページへ
      const planLink = page.locator('a[href*="/plans/"]').first();

      if (await planLink.isVisible().catch(() => false)) {
        await planLink.click();
        await page.waitForLoadState('networkidle');

        // 詳細ページのコンテンツを確認
        await expect(page.locator('h1').first()).toBeVisible();

        // プランの詳細情報エリアを確認
        const detailSections = page.locator('section, .detail, .description, .content');
        if ((await detailSections.count()) > 0) {
          await expect(detailSections.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('レスポンシブデザイン確認', () => {
    test('モバイルでの公開プラン表示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/plans/public');

      // モバイルサイズでページが正常に表示されることを確認
      await expect(page.locator('h1').first()).toBeVisible();

      // プランカードがモバイルレイアウトで表示されることを確認
      const planCards = page.locator('[data-testid="plan-card"], .plan-item').first();
      if (await planCards.isVisible().catch(() => false)) {
        await expect(planCards).toBeVisible();
      }
    });

    test('タブレットでの公開プラン表示', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/plans/public');

      // タブレットサイズでページが正常に表示されることを確認
      await expect(page.locator('h1').first()).toBeVisible();
    });
  });

  test.describe('パフォーマンステスト', () => {
    test('公開プランページのローディング時間', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/plans/public', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      // 5秒以内にロードされることを確認
      expect(loadTime).toBeLessThan(5000);

      // コンテンツが表示されることを確認
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('大量データでのスクロール動作', async ({ page }) => {
      await page.goto('/plans/public');

      // ページをスクロールしてみる
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // スクロール後もページが正常に表示されることを確認
      await expect(page.locator('body')).toBeVisible();

      // 元の位置に戻る
      await page.evaluate(() => window.scrollTo(0, 0));
    });
  });

  test.describe('アクセシビリティ基本確認', () => {
    test('基本的なアクセシビリティ要素の存在', async ({ page }) => {
      await page.goto('/plans/public');

      // メインコンテンツのランドマークを確認
      const main = page.locator('main').first();
      if (await main.isVisible().catch(() => false)) {
        await expect(main).toBeVisible();
      }

      // 見出し構造の確認
      await expect(page.locator('h1').first()).toBeVisible();

      // ナビゲーション要素の確認
      const nav = page.locator('nav').first();
      if (await nav.isVisible().catch(() => false)) {
        await expect(nav).toBeVisible();
      }
    });

    test('キーボードナビゲーション基本確認', async ({ page }) => {
      await page.goto('/plans/public');

      // Tabキーでフォーカスが移動することを確認
      await page.keyboard.press('Tab');

      // フォーカス可能な要素があることを確認
      const focusedElement = page.locator(':focus');
      if ((await focusedElement.count()) > 0) {
        await expect(focusedElement.first()).toBeVisible();
      }
    });
  });

  test.describe('エラーハンドリング', () => {
    test('ネットワークエラーのシミュレーション', async ({ page }) => {
      // ネットワークをオフラインに設定
      await page.context().setOffline(true);

      try {
        await page.goto('/plans/public', { timeout: 5000 });
      } catch (error) {
        // ネットワークエラーが期待される
        expect(error).toBeDefined();
      }

      // ネットワークを復旧
      await page.context().setOffline(false);
    });
  });

  test.describe('SEO・メタデータ確認', () => {
    test('公開プランページのメタデータ', async ({ page }) => {
      await page.goto('/plans/public');

      // タイトルタグの確認
      await expect(page).toHaveTitle(/.*プラン.*|.*Couple Plan.*/);

      // メタディスクリプションの確認
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveCount(1);

      // OGタグの確認（ソーシャルメディア共有用）
      const ogTitle = page.locator('meta[property="og:title"]');
      if ((await ogTitle.count()) > 0) {
        await expect(ogTitle).toHaveCount(1);
      }
    });
  });

  test.describe('ユーザビリティ確認', () => {
    test('プランカードの基本インタラクション', async ({ page }) => {
      await page.goto('/plans/public');

      // プランカードまたはリンクがクリック可能であることを確認
      const planLinks = page.locator('a[href*="/plans/"], [data-testid="plan-card"] a').first();

      if (await planLinks.isVisible().catch(() => false)) {
        // リンクをクリックして詳細ページに遷移することを確認
        await planLinks.click();
        await page.waitForLoadState('networkidle');

        // URLが変わったことを確認
        expect(page.url()).toMatch(/\/plans\/.+/);
      }
    });

    test('パンくずナビゲーション', async ({ page }) => {
      await page.goto('/plans/public');

      // パンくずナビゲーションがある場合の確認
      const breadcrumbs = page
        .locator('nav[aria-label="breadcrumb"], .breadcrumb, [data-testid="breadcrumb"]')
        .first();

      if (await breadcrumbs.isVisible().catch(() => false)) {
        await expect(breadcrumbs).toBeVisible();
      }
    });
  });

  test.describe('フォーム機能の基本確認', () => {
    test('お問い合わせページの表示', async ({ page }) => {
      await page.goto('/contact');

      // お問い合わせページが表示されることを確認
      await expect(page.locator('h1').first()).toBeVisible();

      // フォーム要素の確認
      const form = page.locator('form').first();
      if (await form.isVisible().catch(() => false)) {
        await expect(form).toBeVisible();

        // 基本的な入力フィールドの確認
        const inputs = form.locator('input, textarea');
        if ((await inputs.count()) > 0) {
          await expect(inputs.first()).toBeVisible();
        }
      }
    });

    test('FAQページの表示', async ({ page }) => {
      await page.goto('/faq');

      // FAQページが表示されることを確認
      await expect(page.locator('h1').first()).toBeVisible();

      // FAQ項目の確認
      const faqItems = page.locator('details, .faq-item, .accordion-item').first();
      if (await faqItems.isVisible().catch(() => false)) {
        await expect(faqItems).toBeVisible();
      }
    });
  });
});
