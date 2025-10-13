import { Page } from '@playwright/test';

/**
 * パートナー連携テスト用ヘルパー関数
 */

export interface PartnerInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  connectedAt: string;
}

export interface InvitationInfo {
  invitationCode: string;
  expiresAt: string;
}

/**
 * パートナー連携ページにアクセス
 */
export async function navigateToPartnerLinkage(page: Page): Promise<void> {
  await page.goto('/dashboard/partner-linkage');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 招待コードを生成
 */
export async function generateInvitationCode(page: Page): Promise<string> {
  const generateButton = page.getByRole('button', { name: /連携コードを生成/i });
  await generateButton.click();

  // ローディング状態を待機
  await page.waitForTimeout(1000);

  // 生成されたコードを取得
  const codeElement = page.locator('text=/^\\d{6}$/');
  await expect(codeElement).toBeVisible({ timeout: 10000 });

  const generatedCode = await codeElement.textContent();
  if (!generatedCode) {
    throw new Error('招待コードの生成に失敗しました');
  }

  return generatedCode;
}

/**
 * 招待コードを入力
 */
export async function inputInvitationCode(page: Page, code: string): Promise<void> {
  const codeInput = page.getByLabel(/連携コード（6桁）/i);
  await codeInput.fill(code);
}

/**
 * 招待コードを検証
 */
export async function verifyInvitationCode(page: Page): Promise<void> {
  const verifyButton = page.getByRole('button', { name: /検証して連携/i });
  await verifyButton.click();

  // 検証結果を待機
  await page.waitForTimeout(2000);
}

/**
 * パートナー情報が表示されているかチェック
 */
export async function checkPartnerInfoDisplay(page: Page): Promise<boolean> {
  try {
    await page.getByText(/連携済みパートナー/i).waitFor({ timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * 招待検証結果が表示されているかチェック
 */
export async function checkInvitationVerification(page: Page): Promise<boolean> {
  try {
    await page.getByText(/パートナー連携の確認/i).waitFor({ timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * エラーメッセージが表示されているかチェック
 */
export async function checkErrorMessage(page: Page): Promise<boolean> {
  try {
    await page.getByText(/エラー|失敗/i).waitFor({ timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * パートナー連携の完了を確認
 */
export async function confirmPartnerConnection(page: Page): Promise<void> {
  const connectButton = page.getByRole('button', { name: /連携する/i });
  await connectButton.click();

  // アラートの処理
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('パートナーとの連携が完了しました');
    await dialog.accept();
  });

  // ダッシュボードへのリダイレクトを待機
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
}

/**
 * パートナー連携をキャンセル
 */
export async function cancelPartnerConnection(page: Page): Promise<void> {
  const cancelButton = page.getByRole('button', { name: /キャンセル/i });
  await cancelButton.click();
}

/**
 * 招待コードの有効期限を取得
 */
export async function getInvitationExpiry(page: Page): Promise<string> {
  const expiryElement = page.getByText(/有効期限:/i);
  await expect(expiryElement).toBeVisible({ timeout: 10000 });

  const expiryText = await expiryElement.textContent();
  return expiryText || '';
}

/**
 * パートナー情報を取得
 */
export async function getPartnerInfo(page: Page): Promise<PartnerInfo | null> {
  try {
    const partnerName = await page.getByText(/連携済みパートナー/i).textContent();
    const partnerEmail = await page.getByText(/@/).textContent();

    if (partnerName && partnerEmail) {
      return {
        id: 'partner-id',
        name: partnerName,
        email: partnerEmail,
        connectedAt: new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * ネットワークエラーをシミュレート
 */
export async function simulateNetworkError(page: Page): Promise<void> {
  await page.context().setOffline(true);
}

/**
 * ネットワークエラーを解除
 */
export async function clearNetworkError(page: Page): Promise<void> {
  await page.context().setOffline(false);
}

/**
 * パートナー連携ページの状態を確認
 */
export async function checkPartnerLinkagePageState(page: Page): Promise<{
  hasGenerateSection: boolean;
  hasInputSection: boolean;
  hasPartnerInfo: boolean;
  hasInvitationVerification: boolean;
  hasError: boolean;
}> {
  return {
    hasGenerateSection: await page
      .getByText(/連携コードを生成/i)
      .isVisible()
      .catch(() => false),
    hasInputSection: await page
      .getByText(/連携コードで接続/i)
      .isVisible()
      .catch(() => false),
    hasPartnerInfo: await page
      .getByText(/連携済みパートナー/i)
      .isVisible()
      .catch(() => false),
    hasInvitationVerification: await page
      .getByText(/パートナー連携の確認/i)
      .isVisible()
      .catch(() => false),
    hasError: await page
      .getByText(/エラー|失敗/i)
      .isVisible()
      .catch(() => false),
  };
}
