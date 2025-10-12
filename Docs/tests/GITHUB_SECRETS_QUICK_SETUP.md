# 🚀 GitHub Secrets クイックセットアップ

**目的**: 失敗したGitHub Actionsワークフローを修正するためのSecrets設定

---

## 🔧 必須Secrets（22個）

### Step 1: Staging環境用（9個）

```bash
# Supabase Staging（テスト兼用）
gh secret set STAGING_SUPABASE_URL
# 値: https://staging-xxxxx.supabase.co

gh secret set STAGING_SUPABASE_ANON_KEY
# 値: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

gh secret set STAGING_SUPABASE_SERVICE_ROLE_KEY
# 値: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini API
gh secret set STAGING_GEMINI_API_KEY
# 値: AIzaSy...

# AI設定（Staging: 低コスト）
echo "gemini" | gh secret set STAGING_AI_PROVIDER
echo "gemini-2.0-flash-lite" | gh secret set STAGING_AI_MODEL
echo "2000" | gh secret set STAGING_AI_MAX_TOKENS
echo "0.7" | gh secret set STAGING_AI_TEMPERATURE

# Resend API
gh secret set STAGING_RESEND_API_KEY
# 値: re_...
```

### Step 2: 本番環境用（9個）

```bash
# Supabase Production
gh secret set NEXT_PUBLIC_SUPABASE_URL
# 値: https://production-xxxxx.supabase.co

gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY
# 値: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

gh secret set SUPABASE_SERVICE_ROLE_KEY
# 値: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini API
gh secret set GEMINI_API_KEY
# 値: AIzaSy...

# AI設定（本番: 高品質）
echo "gemini" | gh secret set AI_PROVIDER
echo "gemini-2.0-flash-exp" | gh secret set AI_MODEL
echo "4000" | gh secret set AI_MAX_TOKENS
echo "0.7" | gh secret set AI_TEMPERATURE

# Resend API
gh secret set RESEND_API_KEY
# 値: re_...
```

### Step 3: 共通（4個）

```bash
# メール設定
gh secret set ADMIN_EMAIL
# 値: admin@coupleplan.app

gh secret set FROM_EMAIL
# 値: noreply@coupleplan.app

# WIF（Workload Identity Federation）
# 注意: これらは既に設定済みの前提です
# gh secret set WIF_PROVIDER
# gh secret set WIF_SERVICE_ACCOUNT
```

### Step 4: 確認

```bash
# 設定したSecretsを確認
gh secret list

# 期待される出力（22個）:
# STAGING_SUPABASE_URL
# STAGING_SUPABASE_ANON_KEY
# STAGING_SUPABASE_SERVICE_ROLE_KEY
# STAGING_GEMINI_API_KEY
# STAGING_AI_PROVIDER
# STAGING_AI_MODEL
# STAGING_AI_MAX_TOKENS
# STAGING_AI_TEMPERATURE
# STAGING_RESEND_API_KEY
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# GEMINI_API_KEY
# AI_PROVIDER
# AI_MODEL
# AI_MAX_TOKENS
# AI_TEMPERATURE
# RESEND_API_KEY
# ADMIN_EMAIL
# FROM_EMAIL
# WIF_PROVIDER
# WIF_SERVICE_ACCOUNT
```

---

## 🔍 トラブルシューティング

### エラー: "Secret not found"

```bash
# 個別に確認
gh secret get STAGING_SUPABASE_URL

# 存在しない場合は再設定
gh secret set STAGING_SUPABASE_URL
```

### エラー: "Permission denied"

```bash
# GitHub CLI認証確認
gh auth status

# 再認証
gh auth login
```

### エラー: "Repository not found"

```bash
# 正しいリポジトリにいることを確認
pwd
git remote -v

# 必要に応じてリポジトリを設定
gh repo set-default your-org/coupleplan
```

---

## 🎯 設定後の確認

1. **GitHub Web UIで確認**
   - Repository → Settings → Secrets and variables → Actions
   - 22個のSecretsが表示されることを確認

2. **テストPR作成**

   ```bash
   # 新しいブランチで小さな変更
   git checkout -b fix/secrets-test
   echo "test" > test.txt
   git add test.txt
   git commit -m "test: verify secrets configuration"
   git push origin fix/secrets-test

   # GitHub Web UIでPR作成
   # → GitHub Actionsが実行されることを確認
   ```

3. **ワークフロー確認**
   - PR → Checks タブで以下が成功することを確認:
     - ✅ PR Test / Lint & Type Check
     - ✅ PR Test / Unit Tests
     - ✅ PR Test / Integration Tests
     - ✅ PR Test / Test Summary
     - ✅ Docker Build & Test / Docker Build & Security Test

---

## 🚨 緊急対応（テスト用ダミー値）

**注意**: 本番環境では実際の値を設定してください！

```bash
# テスト用ダミー値（緊急時のみ）
echo "https://test.supabase.co" | gh secret set STAGING_SUPABASE_URL
echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test" | gh secret set STAGING_SUPABASE_ANON_KEY
echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test" | gh secret set STAGING_SUPABASE_SERVICE_ROLE_KEY
echo "AIzaSyTEST123456789" | gh secret set STAGING_GEMINI_API_KEY
echo "re_test123456789" | gh secret set STAGING_RESEND_API_KEY

# 本番環境用も同様に設定
echo "https://prod.supabase.co" | gh secret set NEXT_PUBLIC_SUPABASE_URL
echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.prod" | gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY
echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.prod" | gh secret set SUPABASE_SERVICE_ROLE_KEY
echo "AIzaSyPROD123456789" | gh secret set GEMINI_API_KEY
echo "re_prod123456789" | gh secret set RESEND_API_KEY

# 共通
echo "admin@coupleplan.app" | gh secret set ADMIN_EMAIL
echo "noreply@coupleplan.app" | gh secret set FROM_EMAIL
```

---

## ✅ 完了確認

すべてのSecretsを設定した後：

1. ✅ `gh secret list` で22個表示される
2. ✅ 新しいPRでGitHub Actionsが成功する
3. ✅ すべてのワークフロー（Lint, Unit, Integration, Docker）が通る
4. ✅ Vercelデプロイが成功する

これで、失敗していたGitHub Actionsワークフローが正常に動作するはずです！

