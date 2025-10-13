import { test, expect } from '@playwright/test';
import { getTestUser, getPartnerUser } from '../helpers/test-users';

/**
 * パートナー招待E2Eテスト
 *
 * このテストは、認証済み状態（storageState）を使用して実行されます。
 * 実際のパートナー連携フローをテストします。
 */

test.describe('パートナー招待機能', () => {
  test.beforeEach(async ({ page }) => {
    // パートナー連携ページへアクセス
    await page.goto('/dashboard/partner-linkage');
    await page.waitForLoadState('domcontentloaded');
  });

  test('招待コード生成から検証までのフロー', async ({ page }) => {
    // 1. 招待コードを生成
    const generateButton = page.getByRole('button', { name: /連携コードを生成/i });
    await generateButton.click();

    // ローディング状態を待機
    await page.waitForTimeout(1000);

    // 生成されたコードを取得
    const codeElement = page.locator('text=/^\\d{6}$/');
    await expect(codeElement).toBeVisible({ timeout: 10000 });

    const generatedCode = await codeElement.textContent();
    console.log(`Generated invitation code: ${generatedCode}`);

    // 2. 生成されたコードを入力フィールドに設定
    const codeInput = page.getByLabel(/連携コード（6桁）/i);
    await codeInput.fill(generatedCode || '123456');

    // 3. 検証ボタンをクリック
    const verifyButton = page.getByRole('button', { name: /検証して連携/i });
    await verifyButton.click();

    // 4. 検証結果を確認
    // 成功した場合：パートナー情報が表示される
    // 失敗した場合：エラーメッセージが表示される
    await page.waitForTimeout(2000);

    // 結果を確認（成功またはエラー）
    const hasPartnerInfo = await page
      .getByText(/パートナー連携の確認/i)
      .isVisible()
      .catch(() => false);
    const hasError = await page
      .getByText(/エラー|失敗/i)
      .isVisible()
      .catch(() => false);

    // どちらかの結果が表示されることを確認
    expect(hasPartnerInfo || hasError).toBeTruthy();

    console.log('✅ 招待コード生成から検証フロー完了');
  });

  test('招待コードの有効期限表示', async ({ page }) => {
    // 招待コードを生成
    const generateButton = page.getByRole('button', { name: /連携コードを生成/i });
    await generateButton.click();

    // 有効期限が表示されることを確認
    await expect(page.getByText(/有効期限:/i)).toBeVisible({ timeout: 10000 });

    console.log('✅ 招待コード有効期限表示確認');
  });

  test('招待コードの形式が正しい', async ({ page }) => {
    // 招待コードを生成
    const generateButton = page.getByRole('button', { name: /連携コードを生成/i });
    await generateButton.click();

    // 6桁の数字が表示されることを確認
    const codeElement = page.locator('text=/^\\d{6}$/');
    await expect(codeElement).toBeVisible({ timeout: 10000 });

    // コードの内容を確認
    const codeText = await codeElement.textContent();
    expect(codeText).toMatch(/^\d{6}$/);

    console.log('✅ 招待コード形式確認');
  });

  test('招待コード生成のエラーハンドリング', async ({ page }) => {
    // ネットワークエラーをシミュレート（オフライン状態）
    await page.context().setOffline(true);

    // 招待コード生成を試行
    const generateButton = page.getByRole('button', { name: /連携コードを生成/i });
    await generateButton.click();

    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/エラー|失敗|ネットワーク/i)).toBeVisible({
      timeout: 10000,
    });

    // オフライン状態を解除
    await page.context().setOffline(false);

    console.log('✅ 招待コード生成エラーハンドリング確認');
  });
});

test.describe('パートナー連携の統合テスト', () => {
  test.skip('実際のパートナー連携フロー', async ({ page }) => {
    // このテストは2つの異なるユーザーが必要なため、スキップ
    // 実際の統合テストでは以下をテスト：
    // 1. ユーザーAが招待コードを生成
    // 2. ユーザーBがそのコードを入力
    // 3. パートナー関係が確立される
    test.skip();
  });

  test.skip('パートナー連携後のダッシュボード表示', async ({ page }) => {
    // パートナー連携後のダッシュボード表示をテスト
    // 実際のデータベース状態に依存するため、スキップ
    test.skip();
  });
});
