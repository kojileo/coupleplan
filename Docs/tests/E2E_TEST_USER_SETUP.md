# E2Eテストユーザーセットアップガイド

このガイドでは、CouplePlan E2Eテスト用のテストユーザーを作成する手順を説明します。

## ⚠️ 既存システムでのE2E課題

Supabase Authを使用する既存システムでは、以下の課題があります：

1. **テストユーザーが事前に存在する必要がある**
2. **メール確認が必要**
3. **毎回ログインすると時間がかかる**

## ✅ 解決策: storageStateによる認証状態の保存・再利用

Playwrightの`storageState`機能を使用して、一度ログインした認証状態を保存し、再利用します。

### メリット

- ⚡ テスト実行時間の短縮（10秒 → 1秒）
- 🔒 セキュリティ（認証状態をローカルに保存）
- 🚀 信頼性の向上（レート制限の回避）
- 🧹 メンテナンスが容易

## 📝 セットアップ手順

### Step 1: Supabaseダッシュボードでテストユーザーを作成

1. **Supabaseダッシュボードにアクセス**
   - https://supabase.com/dashboard
   - CouplePlanプロジェクトを選択

2. **Authentication → Users → Add user**をクリック

3. **テストユーザーを作成**:

   **ユーザー1（メインテストユーザー）**:
   - Email: `e2e-test@example.com`（または専用ドメイン）
   - Password: `E2ETestPass123!`
   - ✅ Auto Confirm User: **有効にする**（メール確認をスキップ）

   **ユーザー2（パートナーユーザー）**:
   - Email: `e2e-partner@example.com`
   - Password: `E2ETestPass123!`
   - ✅ Auto Confirm User: **有効にする**

4. **ユーザーが作成されたことを確認**
   - Users一覧に表示される
   - Status: Confirmed（メール確認済み）

### Step 2: プロフィールデータの作成（重要）

CouplePlanでは`profiles`テーブルがユーザーと紐づいています。

**オプションA: SQL Editorで直接作成**

Supabase Dashboard → SQL Editorで実行：

```sql
-- テストユーザーのプロフィール作成
INSERT INTO profiles (id, email, name, location, birthday, anniversary)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'e2e-test@example.com'),
  'e2e-test@example.com',
  'E2E Test User',
  '東京都',
  '1990-01-01',
  '2020-01-01'
) ON CONFLICT (id) DO NOTHING;

-- パートナーユーザーのプロフィール作成
INSERT INTO profiles (id, email, name, location, birthday, anniversary)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'e2e-partner@example.com'),
  'e2e-partner@example.com',
  'E2E Partner User',
  '東京都',
  '1990-01-01',
  '2020-01-01'
) ON CONFLICT (id) DO NOTHING;
```

**オプションB: アプリケーションで手動セットアップ**

1. ステージング環境にアクセス: https://coupleplan-staging-350595109373.asia-northeast1.run.app/
2. `e2e-test@example.com` / `E2ETestPass123!` でログイン
3. プロフィール設定画面で基本情報を入力
4. パートナーユーザーも同様にセットアップ

### Step 3: `.env.test`を更新

```env
# E2E専用テストユーザー（Supabaseで作成したユーザー）
TEST_USER_EMAIL=e2e-test@example.com
TEST_USER_PASSWORD=E2ETestPass123!

# E2E専用パートナーユーザー
TEST_PARTNER_EMAIL=e2e-partner@example.com
TEST_PARTNER_PASSWORD=E2ETestPass123!

# ステージング環境URL
BASE_URL=https://coupleplan-staging-350595109373.asia-northeast1.run.app
```

### Step 4: 認証セットアップを実行

認証状態を保存するためにセットアップを実行：

```bash
# 認証セットアップのみを実行
npx playwright test tests/e2e/auth.setup.ts --project=setup

# 成功すると、.auth/user.json と .auth/partner.json が作成される
```

**期待される出力**:

```
🔐 Setting up authentication for: e2e-test@example.com
📍 Current URL: https://coupleplan-staging...asia-northeast1.run.app/dashboard
✅ Authentication successful for: e2e-test@example.com
💾 Saved auth state to: .auth/user.json

🔐 Setting up authentication for partner: e2e-partner@example.com
✅ Authentication successful for partner: e2e-partner@example.com
💾 Saved partner auth state to: .auth/partner.json
```

### Step 5: 認証状態を使用したテストの実行

認証状態が保存されたら、他のテストで自動的に使用されます：

```bash
# 認証済み状態でパートナー連携テストを実行
npx playwright test tests/e2e/partner/
```

## 🔧 storageStateの仕組み

### 1. 認証セットアップ（auth.setup.ts）

```typescript
setup('authenticate', async ({ page }) => {
  // ログイン処理
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // 認証状態を保存
  await page.context().storageState({ path: '.auth/user.json' });
});
```

### 2. 保存される情報（.auth/user.json）

```json
{
  "cookies": [
    {
      "name": "sb-access-token",
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "domain": ".run.app",
      "path": "/",
      ...
    }
  ],
  "origins": [
    {
      "origin": "https://coupleplan-staging...",
      "localStorage": [
        {
          "name": "supabase.auth.token",
          "value": "{\"access_token\":\"...\",\"refresh_token\":\"...\"}"
        }
      ]
    }
  ]
}
```

### 3. テストで認証状態を使用

```typescript
// playwright.config.ts
{
  name: 'chromium',
  use: {
    storageState: '.auth/user.json', // 保存した認証状態を使用
  },
  dependencies: ['setup'], // setupプロジェクトに依存
}
```

## 📊 テスト戦略

### 認証が不要なテスト（例: ログインページのテスト）

```typescript
// 認証状態を使用しない
test.use({ storageState: { cookies: [], origins: [] } });

test('ログインページが表示される', async ({ page }) => {
  await page.goto('/login');
  // ...
});
```

### 認証が必要なテスト（例: パートナー連携）

```typescript
// デフォルトで認証済み状態（.auth/user.json）を使用
test('招待コードを生成できる', async ({ page }) => {
  // 既にログイン済み！
  await page.goto('/dashboard/partner-linkage');
  // ...
});
```

### 2ユーザーが必要なテスト（例: パートナー連携の確立）

```typescript
test('パートナー連携が確立される', async ({ browser }) => {
  // ユーザー1: テストユーザー
  const context1 = await browser.newContext({ storageState: '.auth/user.json' });
  const page1 = await context1.newPage();

  // ユーザー2: パートナーユーザー
  const context2 = await browser.newContext({ storageState: '.auth/partner.json' });
  const page2 = await context2.newPage();

  // 両方のユーザーで操作を実行
});
```

## 🚀 実装完了後のワークフロー

### 初回セットアップ（1回のみ）

```bash
# 1. Supabaseでテストユーザーを作成（手動）
# 2. .env.testを設定
# 3. 認証セットアップを実行
npx playwright test tests/e2e/auth.setup.ts --project=setup
```

### 日常のテスト実行

```bash
# すべてのE2Eテストを実行（認証済み状態で高速実行）
npx playwright test

# 特定のテストを実行
npx playwright test tests/e2e/partner/
```

### 認証状態の更新（必要に応じて）

```bash
# 認証状態を再生成
npx playwright test tests/e2e/auth.setup.ts --project=setup
```

## 📋 チェックリスト

### Supabaseでのテストユーザー作成

- [ ] `e2e-test@example.com` を作成
- [ ] `e2e-partner@example.com` を作成
- [ ] Auto Confirm Userを有効化（メール確認スキップ）
- [ ] プロフィールデータを作成（SQLまたは手動）

### 環境設定

- [ ] `.env.test`にテストユーザー情報を記入
- [ ] ステージング環境のURLを設定
- [ ] Supabase設定をコピー

### 認証セットアップ

- [ ] `npx playwright test tests/e2e/auth.setup.ts --project=setup` 実行
- [ ] `.auth/user.json` が作成されたことを確認
- [ ] `.auth/partner.json` が作成されたことを確認
- [ ] `.gitignore` に `.auth/` が追加されていることを確認

### テスト実行

- [ ] シードテストが成功する
- [ ] 認証済み状態でテストが実行される
- [ ] テスト実行時間が短縮されている

## 🛠️ トラブルシューティング

### 問題: 認証セットアップが失敗する

**原因**: テストユーザーが存在しない、またはパスワードが間違っている

**解決策**:

1. Supabaseダッシュボードでユーザーを確認
2. `.env.test`の認証情報を確認
3. 手動でログインして動作を確認

### 問題: .auth/user.jsonが作成されない

**原因**: 認証セットアップでエラーが発生している

**解決策**:

```bash
# デバッグモードで実行
npx playwright test tests/e2e/auth.setup.ts --project=setup --headed --debug
```

### 問題: 認証状態が有効期限切れ

**原因**: 保存した認証トークンが期限切れ

**解決策**:

```bash
# 認証状態を再生成
npx playwright test tests/e2e/auth.setup.ts --project=setup
```

---

**最終更新**: 2025年10月13日  
**関連ドキュメント**:

- [E2E認証戦略](./E2E_AUTH_STRATEGY.md)
- [E2E環境設定](./E2E_ENV_SETUP.md)
- [Playwright Authentication](https://playwright.dev/docs/auth)
