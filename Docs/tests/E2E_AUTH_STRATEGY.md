# E2Eテスト認証戦略

Supabase Authを使用する既存システムでのE2Eテスト認証戦略を説明します。

## ⚠️ 既存システムでの課題

### 1. **テストユーザー管理の問題**

**課題**:

- Supabaseはメール確認が必要
- テストユーザーを事前に作成する必要がある
- ステージング/本番環境では手動でのユーザー作成が必要

**影響**:

- テストユーザーが存在しないとテストが失敗
- メール確認が必要な場合、自動テストが困難
- テストデータのクリーンアップが複雑

### 2. **認証フローのパフォーマンス問題**

**課題**:

- 毎回ログインすると時間がかかる（10秒以上）
- レート制限の可能性
- ネットワーク遅延の影響

**影響**:

- E2Eテスト実行時間が長くなる
- テストの信頼性が低下
- CI/CDパイプラインが遅くなる

### 3. **環境による動作の違い**

**課題**:

- ローカル環境とステージング環境で認証フローが異なる
- メール確認の有無
- セキュリティ設定の違い

## ✅ 推奨される解決策

### 解決策1: Playwright `storageState`の使用（推奨）⭐

**概要**:
一度ログインした認証状態（Cookie、LocalStorage）を保存し、各テストで再利用します。

**メリット**:

- ✅ テスト実行時間の大幅短縮（10秒 → 1秒）
- ✅ レート制限の回避
- ✅ テストの信頼性向上
- ✅ メンテナンスが容易

**実装方法**:

#### Step 1: 認証セットアッププロジェクトの作成

`tests/e2e/auth.setup.ts`で一度だけログイン：

```typescript
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 認証状態を保存
  await page.context().storageState({ path: '.auth/user.json' });
});
```

#### Step 2: Playwright設定で依存関係を設定

`playwright.config.ts`:

```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: '.auth/user.json', // 保存した認証状態を使用
    },
    dependencies: ['setup'], // setupプロジェクトに依存
  },
];
```

#### Step 3: 各テストで認証状態を自動使用

すべてのテストが自動的に認証済み状態で開始されます！

```typescript
test('ダッシュボードにアクセス', async ({ page }) => {
  // 既にログイン済み！
  await page.goto('/dashboard');
  // テストコード...
});
```

### 解決策2: テストユーザーのプログラマティック作成

**概要**:
グローバルセットアップでSupabase APIを使用してテストユーザーを作成します。

**実装方法**:

```typescript
// tests/e2e/global-setup.ts
import { createClient } from '@supabase/supabase-js';

async function globalSetup() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 管理者キー
  );

  // テストユーザーを作成（既に存在する場合はスキップ）
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test@example.com',
    password: 'password123',
    email_confirm: true, // メール確認をスキップ
  });

  if (error && !error.message.includes('already exists')) {
    throw error;
  }

  console.log('✅ Test user created/verified');
}
```

**メリット**:

- ✅ テストユーザーを自動作成
- ✅ メール確認をスキップ可能
- ✅ テスト環境の完全自動化

**デメリット**:

- ❌ `SUPABASE_SERVICE_ROLE_KEY`が必要（セキュリティリスク）
- ❌ 本番環境では使用できない

### 解決策3: テスト専用Supabaseプロジェクトの使用

**概要**:
本番/ステージングとは別のテスト専用Supabaseプロジェクトを作成します。

**メリット**:

- ✅ 本番データに影響なし
- ✅ メール確認を無効化可能
- ✅ テストデータのクリーンアップが容易
- ✅ セキュリティリスクの低減

**デメリット**:

- ❌ 別のSupabaseプロジェクトが必要
- ❌ 設定の手間が増える

## 🎯 CouplePlanに最適な戦略

以下の組み合わせを推奨します：

### **ステップ1: テストユーザーの事前作成（手動 - 1回のみ）**

Supabaseダッシュボードで以下のテストユーザーを作成：

1. **テストユーザー**
   - Email: `e2e-test@example.com`（または専用ドメイン）
   - Password: `E2ETestPass123!`
   - メール確認: 完了させる

2. **パートナーユーザー**
   - Email: `e2e-partner@example.com`
   - Password: `E2ETestPass123!`
   - メール確認: 完了させる

### **ステップ2: `storageState`で認証状態を保存・再利用**

実装済みの`tests/e2e/auth.setup.ts`を使用：

```bash
# セットアップを実行（認証状態を保存）
npx playwright test tests/e2e/auth.setup.ts

# 保存された認証状態で他のテストを実行
npx playwright test tests/e2e/partner/ # 認証済み状態で実行
```

### **ステップ3: `.env.test`に専用ユーザー情報を設定**

```env
# E2E専用テストユーザー
TEST_USER_EMAIL=e2e-test@example.com
TEST_USER_PASSWORD=E2ETestPass123!

# E2E専用パートナーユーザー
TEST_PARTNER_EMAIL=e2e-partner@example.com
TEST_PARTNER_PASSWORD=E2ETestPass123!
```

## 📋 実装計画

### Phase 1: 認証セットアップの実装（すぐに実施）

- [x] `tests/e2e/auth.setup.ts` 作成 ✅
- [x] `tests/e2e/helpers/test-users.ts` 作成 ✅
- [ ] `.auth/` ディレクトリ作成
- [ ] `playwright.config.ts` のプロジェクト設定更新
- [ ] `.gitignore` に `.auth/` を追加

### Phase 2: テストユーザーの作成（手動）

- [ ] Supabaseダッシュボードでテストユーザー作成
- [ ] メール確認を完了
- [ ] `.env.test` に認証情報を記入

### Phase 3: 認証状態を使用したテストの実装

- [ ] 認証が必要なテストで `storageState` を使用
- [ ] 認証不要なテストは通常通り実行

## 💡 実装例

### 認証が必要なテスト

```typescript
// tests/e2e/partner/invitation.spec.ts
import { test, expect } from '@playwright/test';

// このテストは認証済み状態で実行される（storageStateを使用）
test.describe('招待コード生成', () => {
  test('招待コードを生成できる', async ({ page }) => {
    // 既にログイン済み！
    await page.goto('/dashboard/partner-linkage');

    // テストコード...
  });
});
```

### 認証が不要なテスト

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

// このテストは認証状態を使用しない
test.use({ storageState: { cookies: [], origins: [] } }); // 認証なし状態

test.describe('ログイン機能', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login');
    // テストコード...
  });
});
```

## 🔧 次のステップ

1. **今すぐ実施**: Supabaseダッシュボードでテストユーザーを作成
   - `e2e-test@example.com` / `E2ETestPass123!`
   - `e2e-partner@example.com` / `E2ETestPass123!`
   - メール確認を完了

2. **`.env.test`を更新**:

   ```env
   TEST_USER_EMAIL=e2e-test@example.com
   TEST_USER_PASSWORD=E2ETestPass123!
   TEST_PARTNER_EMAIL=e2e-partner@example.com
   TEST_PARTNER_PASSWORD=E2ETestPass123!
   ```

3. **認証セットアップを実行**:

   ```bash
   npx playwright test tests/e2e/auth.setup.ts
   ```

4. **テストを実行**（認証状態が再利用される）

この方式により、**毎回ログインせずに高速で信頼性の高いE2Eテストが実現**できます！

---

**参考資料**:

- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Playwright storageState](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
