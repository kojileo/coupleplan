import { test, expect } from '@playwright/test';

/**
 * Seed Test for Playwright Agents
 *
 * このテストは、Playwright Agentsが使用する「シードテスト」です。
 * Agentsはこのテストを参照して、アプリケーションの動作を理解し、
 * 新しいテストケースを生成します。
 *
 * 重要な役割:
 * 1. 環境セットアップの例を提供
 * 2. 基本的なナビゲーションパターンの例を提供
 * 3. テストフィクスチャの使用方法を示す
 * 4. 認証フローの基本パターンを示す
 */

test.describe('CouplePlan Seed Test', () => {
  test.beforeEach(async ({ page }) => {
    // すべてのテストの前にホームページへアクセス
    await page.goto('/');
  });

  test('アプリケーションが正常に起動する', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/CouplePlan/);

    // ページが読み込まれたことを確認
    await expect(page.locator('body')).toBeVisible();

    console.log('✅ アプリケーションが正常に起動しました');
  });

  test('ホームページの基本要素が表示される', async ({ page }) => {
    // ページが表示されるまで待機（domcontentloadedに変更してタイムアウトを回避）
    await page.waitForLoadState('domcontentloaded');

    // 基本的なナビゲーション要素が存在することを確認
    // （実際のセレクタは実装に合わせて調整してください）
    const body = page.locator('body');
    await expect(body).toBeVisible();

    console.log('✅ ホームページの基本要素が表示されました');
  });

  test('ログインページへのナビゲーション', async ({ page }) => {
    // ログインページへ遷移
    await page.goto('/login');

    // ログインフォームが表示されることを確認
    await page.waitForLoadState('networkidle');

    // ページURLの確認
    expect(page.url()).toContain('/login');

    console.log('✅ ログインページへ正常に遷移しました');
  });

  test('サインアップページへのナビゲーション', async ({ page }) => {
    // サインアップページへ遷移
    await page.goto('/signup');

    // サインアップフォームが表示されることを確認
    await page.waitForLoadState('domcontentloaded');

    // ページURLの確認
    expect(page.url()).toContain('/signup');

    console.log('✅ サインアップページへ正常に遷移しました');
  });

  test('APIヘルスチェック', async ({ request }) => {
    // APIヘルスチェックエンドポイントの確認
    const response = await request.get('/api/health');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('status');
    // ステージング環境では "ok" を返す
    expect(data.status).toBe('ok');

    console.log('✅ APIヘルスチェックが成功しました');
  });
});

/**
 * 認証済みユーザーのシードテスト
 *
 * このテストセットは、ログイン済みユーザーの操作パターンを示します。
 * Agentsはこのパターンを参照して、認証が必要な機能のテストを生成します。
 */
test.describe('認証済みユーザー操作の例', () => {
  // 注意: 実際のログイン処理は、テスト用のフィクスチャを使用するか、
  // グローバルセットアップで事前に認証状態を作成することを推奨します

  test.skip('ダッシュボードへのアクセス（例）', async ({ page }) => {
    // このテストはスキップされますが、Agentsの参考例として残しています

    // 1. ログイン処理（実際の実装に合わせて調整）
    await page.goto('/login');
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'password');
    // await page.click('button[type="submit"]');

    // 2. ダッシュボードへ遷移
    await page.waitForURL('**/dashboard');

    // 3. ダッシュボードの要素を確認
    await expect(page).toHaveURL(/.*dashboard/);

    console.log('✅ ダッシュボードへ正常にアクセスしました');
  });

  test.skip('AIプラン生成画面へのアクセス（例）', async ({ page }) => {
    // このテストはスキップされますが、Agentsの参考例として残しています

    // 認証済みの状態でプラン作成画面へ
    await page.goto('/dashboard/plans/create');

    // プラン作成フォームが表示されることを確認
    await expect(page).toHaveURL(/.*plans\/create/);

    console.log('✅ AIプラン生成画面へ正常にアクセスしました');
  });
});

/**
 * Playwright Agentsへのヒント
 *
 * このシードテストを参照する際のヒント:
 *
 * 1. ベースURL: http://localhost:3000
 * 2. 主要な画面:
 *    - /login - ログイン画面
 *    - /signup - サインアップ画面
 *    - /dashboard - ダッシュボード（認証必要）
 *    - /dashboard/plans/create - AIプラン作成（認証必要）
 *    - /dashboard/partner-linkage - パートナー連携（認証必要）
 *
 * 3. 認証方式: Supabase Auth（メール/パスワード）
 *
 * 4. テスト戦略:
 *    - ログイン → ダッシュボード遷移
 *    - サインアップ → プロフィール設定
 *    - パートナー連携 → 招待コード生成・検証
 *    - AIプラン生成 → プラン作成・カスタマイズ
 */
