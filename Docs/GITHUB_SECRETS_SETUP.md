# GitHub Actions シークレット設定ガイド

## 🔐 E2Eテスト用シークレット設定

GitHub リポジトリの **Settings > Secrets and variables > Actions** で以下のシークレットを設定してください：

### Repository secrets

```bash
# E2Eテスト用ユーザー認証情報
TEST_USER_EMAIL=e2e-test@example.com
TEST_USER_PASSWORD=E2ETestPass123!
TEST_PARTNER_EMAIL=e2e-partner@example.com
TEST_PARTNER_PASSWORD=E2ETestPass123!

# テスト環境URL
E2E_BASE_URL=https://coupleplan-staging-350595109373.asia-northeast1.run.app

# Supabase設定（既存）
STAGING_SUPABASE_URL=your_staging_supabase_url
STAGING_SUPABASE_ANON_KEY=your_staging_anon_key
STAGING_SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key

# 本番用（必要に応じて）
PROD_TEST_USER_EMAIL=prod-e2e-test@example.com
PROD_TEST_USER_PASSWORD=ProdE2ETestPass123!
PROD_TEST_PARTNER_EMAIL=prod-e2e-partner@example.com
PROD_TEST_PARTNER_PASSWORD=ProdE2ETestPass123!
E2E_PROD_BASE_URL=https://coupleplan.vercel.app
```

## 🚨 セキュリティ重要事項

### ❌ 絶対にやってはいけないこと

- `.env.test`ファイルをGitにコミット
- 本番環境の認証情報をテストで使用
- テスト用パスワードを簡単なものにする

### ✅ 推奨事項

- テスト専用のSupabaseプロジェクトを使用
- 強力なパスワードを設定
- 定期的なパスワードローテーション
- テスト用ユーザーの権限を最小限に制限

## 📋 設定手順

1. **GitHub リポジトリにアクセス**

   ```
   https://github.com/your-username/coupleplan/settings/secrets/actions
   ```

2. **"New repository secret"をクリック**

3. **各シークレットを個別に追加**
   - Name: `TEST_USER_EMAIL`
   - Secret: `e2e-test@example.com`
   - "Add secret"をクリック

4. **すべてのシークレットについて繰り返し**

## 🔄 ワークフローでの使用例

```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  BASE_URL: ${{ secrets.E2E_BASE_URL }}
```

## 🧪 テスト用Supabaseユーザー作成

テスト用ユーザーは事前にSupabaseで作成しておく必要があります：

```sql
-- Supabase SQL Editorで実行
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'e2e-test@example.com',
  crypt('E2ETestPass123!', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- パートナーユーザーも同様に作成
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'e2e-partner@example.com',
  crypt('E2ETestPass123!', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

## 🔍 設定確認

シークレットが正しく設定されているか確認：

```yaml
# .github/workflows/test-secrets.yml
name: Test Secrets
on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check secrets
        run: |
          echo "TEST_USER_EMAIL is set: ${{ secrets.TEST_USER_EMAIL != '' }}"
          echo "BASE_URL is set: ${{ secrets.E2E_BASE_URL != '' }}"
          # 実際の値は表示しない（セキュリティ）
```
