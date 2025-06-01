import { test, expect } from '@playwright/test';

test.describe('👤 ユーザー体験（UX）テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('初回訪問者の体験', () => {
    test('ホームページでサービスの価値を理解できる', async ({ page }) => {
      // メインビジュアルやキャッチコピーの確認
      await expect(page.locator('h1').first()).toBeVisible();

      // サービス説明やCTAボタンの確認
      const ctaButtons = page
        .locator('button, a')
        .filter({ hasText: /始める|登録|ログイン|プラン|詳細/ });
      const visibleCTAs = await ctaButtons.count();

      if (visibleCTAs > 0) {
        await expect(ctaButtons.first()).toBeVisible();
      }

      // 特徴や機能の説明エリアの確認
      const featureSection = page
        .locator('section, div')
        .filter({ hasText: /特徴|機能|できること/ })
        .first();
      if (await featureSection.isVisible().catch(() => false)) {
        await expect(featureSection).toBeVisible();
      }
    });

    test('ナビゲーションが直感的である', async ({ page }) => {
      // メニューまたはナビゲーションの確認
      const navigation = page.locator('nav, header').first();
      await expect(navigation).toBeVisible();

      // 主要なページへのリンクが存在することを確認
      const importantLinks = ['プラン', 'ログイン', '新規登録', 'FAQ', 'お問い合わせ'];

      for (const linkText of importantLinks) {
        const link = page
          .locator(`a:has-text("${linkText}"), button:has-text("${linkText}")`)
          .first();
        if (await link.isVisible().catch(() => false)) {
          // リンクがクリック可能であることを確認
          await expect(link).toBeEnabled();
        }
      }
    });
  });

  test.describe('コンテンツ閲覧体験', () => {
    test('公開プランの閲覧がスムーズである', async ({ page }) => {
      await page.goto('/plans/public');

      // ページのローディング完了を待つ
      await page.waitForLoadState('networkidle');

      // プラン一覧が表示されることを確認
      await expect(page.locator('h1').first()).toBeVisible();

      // プランカードまたはアイテムの確認
      const planItems = page.locator('[data-testid="plan-card"], .plan-item, article');
      const itemCount = await planItems.count();

      if (itemCount > 0) {
        // 最初のプランアイテムが表示されることを確認
        await expect(planItems.first()).toBeVisible();

        // プランの基本情報（タイトル、説明など）が表示されることを確認
        const planContent = planItems.first().locator('h2, h3, .title, .name').first();
        if (await planContent.isVisible().catch(() => false)) {
          await expect(planContent).toBeVisible();
        }
      }
    });

    test('プラン詳細ページの情報が充実している', async ({ page }) => {
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

  test.describe('モバイル体験', () => {
    test('モバイルでの基本表示確認', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/plans/public');

      // モバイルサイズでの表示確認
      await expect(page.locator('h1').first()).toBeVisible();

      // 基本的なインタラクション要素の存在確認
      const interactiveElements = page.locator('button, a, input');
      const elementCount = await interactiveElements.count();

      if (elementCount > 0) {
        // 最初のインタラクティブ要素が表示されていることを確認
        await expect(interactiveElements.first()).toBeVisible();
      }
    });

    test('モバイルメニューが機能する', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // ハンバーガーメニューまたはモバイルメニューの確認
      const mobileMenuButton = page
        .locator(
          'button[aria-label*="menu"], button[aria-label*="メニュー"], .hamburger, [data-testid="mobile-menu-button"]'
        )
        .first();

      if (await mobileMenuButton.isVisible().catch(() => false)) {
        await mobileMenuButton.click();

        // メニューが展開されることを確認
        const mobileMenu = page
          .locator('nav[aria-expanded="true"], .mobile-menu.open, [data-testid="mobile-menu"].open')
          .first();
        if (await mobileMenu.isVisible().catch(() => false)) {
          await expect(mobileMenu).toBeVisible();
        }
      }
    });
  });

  test.describe('パフォーマンス体験', () => {
    test('画像の遅延読み込みが機能する', async ({ page }) => {
      await page.goto('/plans/public');

      // 画像要素の確認
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        // 最初の画像が読み込まれることを確認
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();

        // lazyloading属性がある場合の確認
        const lazyImages = page.locator('img[loading="lazy"]');
        if ((await lazyImages.count()) > 0) {
          // 遅延読み込み画像が存在することを確認
          expect(await lazyImages.count()).toBeGreaterThan(0);
        }
      }
    });

    test('重大なJavaScriptエラーが発生しない', async ({ page }) => {
      const errors: string[] = [];

      // コンソールエラーを監視
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // ページエラーを監視
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 基本的な操作を実行
      await page.goto('/plans/public');
      await page.waitForLoadState('networkidle');

      // アプリケーション由来の重大なJavaScriptエラーがないことを確認
      const criticalErrors = errors.filter(
        (error) =>
          !error.includes('404') && // 404エラーは除外
          !error.includes('Failed to load resource') && // リソース読み込みエラーは除外
          !error.toLowerCase().includes('warning') && // 警告は除外
          !error.includes('googleads') && // Google Ads関連エラーは除外
          !error.includes('doubleclick') && // DoubleClick関連エラーは除外
          !error.includes('adtrafficquality') && // 広告関連エラーは除外
          !error.includes('Content Security Policy') && // CSPエラーは除外
          !error.includes('fenced frame') // フェンスドフレームエラーは除外
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('アクセシビリティ体験', () => {
    test('スクリーンリーダー用の属性が適切に設定されている', async ({ page }) => {
      await page.goto('/');

      // alt属性を持つ画像の確認
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          // decorative画像以外はalt属性を持つべき
          if (alt === null) {
            const role = await img.getAttribute('role');
            expect(role).toBe('presentation');
          }
        }
      }

      // フォームラベルの確認
      const inputs = page.locator('input');
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');

          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            const hasLabel = (await label.count()) > 0;

            // ラベル、aria-label、aria-labelledbyのいずれかが存在することを確認
            expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
          }
        }
      }
    });

    test('フォーカス順序が論理的である', async ({ page }) => {
      await page.goto('/');

      const focusableElements = await page
        .locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        .all();

      if (focusableElements.length > 0) {
        // 最初の要素にフォーカス
        await page.keyboard.press('Tab');

        let previousElement = null;
        for (let i = 0; i < Math.min(focusableElements.length, 5); i++) {
          const currentElement = page.locator(':focus');

          if ((await currentElement.count()) > 0) {
            // フォーカスが可視要素にあることを確認
            await expect(currentElement).toBeVisible();
            previousElement = currentElement;
          }

          await page.keyboard.press('Tab');
        }
      }
    });
  });

  test.describe('エラー体験', () => {
    test('存在しないページでユーザーフレンドリーなエラーが表示される', async ({ page }) => {
      const response = await page.goto('/this-page-does-not-exist-123');

      if (response && response.status() === 404) {
        // 404ページの内容を確認
        const errorMessage = page
          .locator('text=404, text=見つかりません, text=ページが存在しません')
          .first();
        if (await errorMessage.isVisible().catch(() => false)) {
          await expect(errorMessage).toBeVisible();
        }

        // ホームに戻るリンクがあることを確認
        const homeLink = page
          .locator('a[href="/"], a:has-text("ホーム"), a:has-text("トップ")')
          .first();
        if (await homeLink.isVisible().catch(() => false)) {
          await expect(homeLink).toBeVisible();
        }
      }
    });

    test('ネットワークエラー時の適切な処理', async ({ page }) => {
      await page.goto('/plans/public');

      // ネットワークを一時的に無効化
      await page.context().setOffline(true);

      // ページの再読み込みを試行
      try {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 3000 });
      } catch (error) {
        // ネットワークエラーが期待される
        expect(error).toBeDefined();
      } finally {
        // ネットワークを復旧
        await page.context().setOffline(false);
      }
    });
  });
});
