# E2Eテスト実装ガイド（従来のPlaywright）

このガイドでは、CouplePlanアプリケーションの従来のPlaywrightを使用したE2Eテスト実装方法を説明します。

## 📁 ディレクトリ構造

```
tests/e2e/
├── README.md                   # E2Eテストの概要
├── E2E_TESTING_GUIDE.md       # このファイル
├── global-setup.ts            # グローバルセットアップ
├── global-teardown.ts         # グローバルティアダウン
├── seed.spec.ts               # シードテスト
├── auth/                      # 認証関連テスト
│   ├── login.spec.ts         # ログインテスト
│   ├── signup.spec.ts        # サインアップテスト
│   └── session.spec.ts       # セッション管理テスト（予定）
├── partner/                   # パートナー連携テスト（予定）
│   ├── invitation.spec.ts
│   └── couple.spec.ts
└── plans/                     # プラン関連テスト（予定）
    ├── create.spec.ts
    └── customize.spec.ts
```

## 🚀 テスト実行方法

### すべてのE2Eテストを実行

```bash
npx playwright test
```

### 特定のディレクトリのテストを実行

```bash
# 認証テストのみ
npx playwright test tests/e2e/auth/

# パートナー連携テストのみ
npx playwright test tests/e2e/partner/
```

### 特定のテストファイルを実行

```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### UIモードで実行（デバッグ用）

```bash
npx playwright test --ui
```

### ヘッドレスモードを無効化（ブラウザを表示）

```bash
npx playwright test --headed
```

### 特定のブラウザで実行

```bash
# Chromiumのみ
npx playwright test --project=chromium

# Firefoxのみ
npx playwright test --project=firefox

# WebKitのみ
npx playwright test --project=webkit
```

## 📝 テスト作成のベストプラクティス

### 1. ページオブジェクトパターンの使用

複雑なページの場合、ページオブジェクトパターンを使用して再利用性を高めます。

```typescript
// pages/LoginPage.ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/メールアドレス/i).fill(email);
    await this.page.getByLabel(/パスワード/i).fill(password);
    await this.page.getByRole('button', { name: /ログイン/i }).click();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(new RegExp(message, 'i'))).toBeVisible();
  }
}
```

### 2. テストデータの管理

環境変数を使用してテストデータを管理します。

```typescript
// テストユーザー情報
const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
const testPassword = process.env.TEST_USER_PASSWORD || 'password123';
```

### 3. セレクタの優先順位

Playwrightの推奨セレクタ優先順位：

1. **Role-based**: `page.getByRole('button', { name: 'ログイン' })`
2. **Label-based**: `page.getByLabel('メールアドレス')`
3. **Text-based**: `page.getByText('ログイン')`
4. **Test ID**: `page.getByTestId('login-button')`
5. **CSS Selector**: `page.locator('.login-button')` (最後の手段)

### 4. 待機の適切な使用

```typescript
// ❌ 固定時間待機は避ける
await page.waitForTimeout(3000);

// ✅ 要素の表示を待つ
await page.getByText('ログイン').waitFor({ state: 'visible' });

// ✅ ネットワークアイドルを待つ
await page.waitForLoadState('networkidle');

// ✅ URL変更を待つ
await page.waitForURL('**/dashboard');
```

### 5. アサーションの明確化

```typescript
// ✅ 明確なアサーション
await expect(page.getByRole('heading')).toHaveText('ダッシュボード');

// ✅ タイムアウト設定
await expect(page.getByText('成功')).toBeVisible({ timeout: 10000 });

// ✅ 否定形も使用可能
await expect(page.getByText('エラー')).not.toBeVisible();
```

### 6. beforeEach/afterEachの活用

```typescript
test.describe('ログイン機能', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にログインページへ
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // 各テスト後のクリーンアップ（必要に応じて）
    await page.context().clearCookies();
  });

  test('正常なログイン', async ({ page }) => {
    // テストコード
  });
});
```

### 7. test.skipの活用

未実装機能やフレーキーなテストは一時的にスキップします。

```typescript
test.skip('未実装の機能', async ({ page }) => {
  // 将来実装予定
});

// 条件付きスキップ
test('機能テスト', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKitでは未サポート');
  // テストコード
});
```

## 🔧 トラブルシューティング

### テストが失敗する場合

1. **スクリーンショットとビデオを確認**

   ```bash
   # 失敗時のスクリーンショット: test-results/
   # 失敗時のビデオ: test-results/
   ```

2. **デバッグモードで実行**

   ```bash
   npx playwright test --debug
   ```

3. **トレース記録を確認**
   ```bash
   npx playwright test --trace on
   npx playwright show-report
   ```

### セレクタが見つからない場合

1. **Playwright Inspectorで確認**

   ```bash
   npx playwright codegen https://coupleplan.vercel.app/
   ```

2. **より柔軟なセレクタを使用**

   ```typescript
   // ❌ 厳密すぎる
   page.getByRole('button', { name: 'ログイン' });

   // ✅ 正規表現で柔軟に
   page.getByRole('button', { name: /ログイン/i });
   ```

### タイムアウトエラーが発生する場合

1. **タイムアウト時間を延長**

   ```typescript
   await expect(page.getByText('成功')).toBeVisible({ timeout: 30000 });
   ```

2. **ネットワークアイドルを待つ**
   ```typescript
   await page.goto('/login');
   await page.waitForLoadState('networkidle');
   ```

## 🎯 Week 13の目標

- [ ] **ログインテスト**: 10テストケース
  - [x] ページ表示確認
  - [x] 正常ログイン
  - [x] 無効な認証情報
  - [x] 空フォーム送信
  - [x] 無効なメール形式
  - [x] キーボード操作
  - [x] ローディング状態
  - [x] セッション保持
  - [ ] パスワードリセットリンク
  - [ ] サインアップリンク

- [ ] **サインアップテスト**: 10テストケース
  - [x] ページ表示確認
  - [x] 空フォーム送信
  - [x] 無効なメール形式
  - [x] 短いパスワード
  - [x] パスワード不一致
  - [x] キーボード操作
  - [x] ローディング状態
  - [ ] 正常登録
  - [ ] 重複メール
  - [ ] 登録後の遷移

- [ ] **セッション管理テスト**: 5テストケース
  - [ ] ログアウト
  - [ ] セッション有効期限
  - [ ] 未認証アクセス制御
  - [ ] 複数タブでのセッション共有
  - [ ] セッション復元

**合計**: 約25テストケース

## 📚 参考資料

- [Playwright公式ドキュメント](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [CouplePlan作業計画](../../Docs/作業計画.md)
- [CouplePlanテスト計画](../../Docs/TEST_PLAN.md)

---

**最終更新**: 2025年10月13日  
**Week 13**: 認証フローE2Eテスト実装中
