# GitHub Secrets セットアップガイド

## ドキュメント情報

- **作成日**: 2025年10月11日
- **バージョン**: 1.0.0
- **対象**: GitHub Actionsワークフロー実行に必要なSecretsの設定

---

## 📋 必要なSecrets一覧

GitHub Repository → Settings → Secrets and variables → Actions

### Staging環境用（テスト実行にも使用）（9個）

| Secret名                            | 説明                     | 取得方法                 | 必須 |
| ----------------------------------- | ------------------------ | ------------------------ | ---- |
| `STAGING_SUPABASE_URL`              | Staging Supabase URL     | Supabase Staging Project | ✅   |
| `STAGING_SUPABASE_ANON_KEY`         | Staging Anon Key         | Supabase Staging Project | ✅   |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | Staging Service Role Key | Supabase Staging Project | ✅   |
| `STAGING_GEMINI_API_KEY`            | Staging Gemini API Key   | Google AI Studio         | ✅   |
| `STAGING_AI_PROVIDER`               | AIプロバイダー           | 手動設定（gemini）       | ✅   |
| `STAGING_AI_MODEL`                  | AIモデル名               | 手動設定                 | ✅   |
| `STAGING_AI_MAX_TOKENS`             | AI最大トークン数         | 手動設定                 | ✅   |
| `STAGING_AI_TEMPERATURE`            | AI Temperature設定       | 手動設定                 | ✅   |
| `STAGING_RESEND_API_KEY`            | Staging Resend API Key   | Resend                   | ✅   |

### 本番環境用（9個）

| Secret名                        | 説明                 | 取得方法            | 必須 |
| ------------------------------- | -------------------- | ------------------- | ---- |
| `NEXT_PUBLIC_SUPABASE_URL`      | 本番Supabase URL     | Supabase Production | ✅   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本番Anon Key         | Supabase Production | ✅   |
| `SUPABASE_SERVICE_ROLE_KEY`     | 本番Service Role Key | Supabase Production | ✅   |
| `GEMINI_API_KEY`                | 本番Gemini API Key   | Google AI Studio    | ✅   |
| `AI_PROVIDER`                   | AIプロバイダー       | 手動設定（gemini）  | ✅   |
| `AI_MODEL`                      | AIモデル名           | 手動設定            | ✅   |
| `AI_MAX_TOKENS`                 | AI最大トークン数     | 手動設定            | ✅   |
| `AI_TEMPERATURE`                | AI Temperature設定   | 手動設定            | ✅   |
| `RESEND_API_KEY`                | 本番Resend API Key   | Resend              | ✅   |

### 共通（4個）

| Secret名              | 説明                 | 取得方法            | 必須 |
| --------------------- | -------------------- | ------------------- | ---- |
| `ADMIN_EMAIL`         | 管理者メールアドレス | 任意設定            | ✅   |
| `FROM_EMAIL`          | 送信元メールアドレス | 任意設定            | ✅   |
| `WIF_PROVIDER`        | WIF Provider         | GCP設定（下記手順） | ✅   |
| `WIF_SERVICE_ACCOUNT` | WIF Service Account  | GCP設定（下記手順） | ✅   |

**✅ 必須**: 22個  
**合計**: 22個

**注**:

- テスト環境とStaging環境は同じSupabase/APIキーを使用します
- AI設定を環境ごとに分離することで、Stagingでは低コストモデル、本番では高品質モデルを使用できます
- WIF（Workload Identity Federation）は既に設定済みの前提です
- AdSense、OpenWeather、Google Site Verificationは不要になったため削除されました

---

## 🔧 セットアップ手順

### Step 1: Supabase Secrets

#### 1.1 Staging用Supabaseプロジェクト（テスト実行にも使用）

```bash
# 1. Supabaseで新規プロジェクト作成（Staging・テスト兼用）
# プロジェクト名: coupleplan-staging

# 2. Project Settings → API で以下を取得
```

**取得する値**:

- **Project URL**: `https://staging-xxxxx.supabase.co`
- **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（⚠️ 絶対に公開しない）

**GitHub Secretsに登録**:

```
STAGING_SUPABASE_URL = https://staging-xxxxx.supabase.co
STAGING_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STAGING_SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注**: このSupabaseプロジェクトは、Staging環境とテスト実行の両方で使用します。

#### 1.2 本番用Supabaseプロジェクト

```bash
# 1. Supabaseで新規プロジェクト作成（本番用）
# プロジェクト名: coupleplan-production

# 2. Project Settings → API で取得
```

**GitHub Secretsに登録**:

```
NEXT_PUBLIC_SUPABASE_URL = https://production-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 2: Gemini API Key & AI設定

```bash
# 1. Google AI Studio（https://aistudio.google.com/）にアクセス
# 2. Googleアカウントでログイン
# 3. 「Get API Key」をクリック
# 4. 新しいAPIキーを作成（Staging用と本番用の2つ推奨）
```

**GitHub Secretsに登録**:

```bash
# Staging環境（低コスト構成）
gh secret set STAGING_GEMINI_API_KEY
# APIキーを入力: AIzaSy...

echo "gemini" | gh secret set STAGING_AI_PROVIDER
echo "gemini-2.0-flash-lite" | gh secret set STAGING_AI_MODEL
echo "2000" | gh secret set STAGING_AI_MAX_TOKENS
echo "0.7" | gh secret set STAGING_AI_TEMPERATURE

# 本番環境（高品質構成）
gh secret set GEMINI_API_KEY
# APIキーを入力: AIzaSy...

echo "gemini" | gh secret set AI_PROVIDER
echo "gemini-2.0-flash-exp" | gh secret set AI_MODEL
echo "4000" | gh secret set AI_MAX_TOKENS
echo "0.7" | gh secret set AI_TEMPERATURE
```

**推奨AI設定**:

- **Staging**: `gemini-2.0-flash-lite`（低コスト、テスト用）
- **Production**: `gemini-2.0-flash-exp`（高品質、本番用）

---

### Step 3: GCP サービスアカウント

#### 3.1 Google Cloud プロジェクト作成

```bash
# 1. Google Cloud Console（https://console.cloud.google.com/）にアクセス
# 2. 新規プロジェクト作成
#    - プロジェクト名: coupleplan
#    - プロジェクトID: coupleplan-12345（自動生成、メモする）

# 3. プロジェクトIDを確認
gcloud projects list

# メモ: PROJECT_ID = coupleplan-12345
```

**GitHub Secretsに登録**:

```
GCP_PROJECT_ID = coupleplan-12345
```

#### 3.2 必要なAPIを有効化

```bash
# プロジェクトを選択
gcloud config set project coupleplan-12345

# 必要なAPIを有効化
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 確認
gcloud services list --enabled
```

#### 3.3 サービスアカウント作成

```bash
# サービスアカウント作成
gcloud iam service-accounts create coupleplan-deployer \
  --display-name="CouplePlan GitHub Actions Deployer" \
  --project=coupleplan-12345

# 確認
gcloud iam service-accounts list
```

#### 3.4 権限付与

```bash
# Cloud Run管理者
gcloud projects add-iam-policy-binding coupleplan-12345 \
  --member="serviceAccount:coupleplan-deployer@coupleplan-12345.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Storage管理者（Container Registry用）
gcloud projects add-iam-policy-binding coupleplan-12345 \
  --member="serviceAccount:coupleplan-deployer@coupleplan-12345.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# サービスアカウントユーザー
gcloud projects add-iam-policy-binding coupleplan-12345 \
  --member="serviceAccount:coupleplan-deployer@coupleplan-12345.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Secret Manager アクセサー
gcloud projects add-iam-policy-binding coupleplan-12345 \
  --member="serviceAccount:coupleplan-deployer@coupleplan-12345.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 権限確認
gcloud projects get-iam-policy coupleplan-12345 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:coupleplan-deployer@*"
```

#### 3.5 サービスアカウントキー作成

```bash
# キーを生成（JSON形式）
gcloud iam service-accounts keys create gcp-sa-key.json \
  --iam-account=coupleplan-deployer@coupleplan-12345.iam.gserviceaccount.com

# ファイルが作成されたことを確認
ls -lh gcp-sa-key.json

# ⚠️ 重要: このファイルは機密情報！
```

#### 3.6 GitHub Secretsに登録

```bash
# 方法1: GitHub Web UIで登録（推奨）
# 1. GitHubリポジトリ → Settings → Secrets and variables → Actions
# 2. 「New repository secret」をクリック
# 3. Name: GCP_SA_KEY
# 4. Secret: gcp-sa-key.jsonの全内容をコピー&ペースト
#    - ファイルをテキストエディタで開く
#    - 全内容を選択してコピー
#    - GitHubのSecret欄にペースト
# 5. 「Add secret」をクリック

# 方法2: GitHub CLI（ghコマンド）
gh secret set GCP_SA_KEY < gcp-sa-key.json

# 確認
gh secret list
```

#### 3.7 ローカルファイルの削除（重要！）

```bash
# セキュリティのため、ローカルのキーファイルを削除
rm gcp-sa-key.json

# 確認
ls gcp-sa-key.json
# → "No such file or directory" が表示されればOK
```

---

### Step 4: Secret Manager設定

```bash
# Supabase Service Role Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | \
  gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-

# Gemini API Key
echo -n "AIzaSy..." | \
  gcloud secrets create GEMINI_API_KEY --data-file=-

# Resend API Key（メール送信用、オプション）
echo -n "re_..." | \
  gcloud secrets create RESEND_API_KEY --data-file=-

# シークレット一覧確認
gcloud secrets list

# サービスアカウントにアクセス権限を付与
for secret in SUPABASE_SERVICE_ROLE_KEY GEMINI_API_KEY RESEND_API_KEY; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:coupleplan-deployer@coupleplan-12345.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

---

## ✅ セットアップ確認チェックリスト

### GitHub Secrets

- [ ] `TEST_SUPABASE_URL`
- [ ] `TEST_SUPABASE_ANON_KEY`
- [ ] `TEST_SUPABASE_SERVICE_ROLE_KEY`
- [ ] `TEST_GEMINI_API_KEY`
- [ ] `STAGING_SUPABASE_URL`
- [ ] `STAGING_SUPABASE_ANON_KEY`
- [ ] `GCP_SA_KEY`
- [ ] `GCP_PROJECT_ID`
- [ ] `STAGING_ADSENSE_CLIENT_ID`（オプション）
- [ ] `GOOGLE_SITE_VERIFICATION`（オプション）

### GCP設定

- [ ] Google Cloudプロジェクト作成
- [ ] 必要なAPI有効化
  - [ ] Cloud Run API
  - [ ] Container Registry API
  - [ ] Secret Manager API
  - [ ] Cloud Build API
- [ ] サービスアカウント作成
- [ ] 権限付与（4つのrole）
- [ ] サービスアカウントキー作成・登録
- [ ] ローカルキーファイル削除

### Secret Manager

- [ ] SUPABASE_SERVICE_ROLE_KEY作成
- [ ] GEMINI_API_KEY作成
- [ ] RESEND_API_KEY作成（オプション）
- [ ] アクセス権限設定

### GitHub Actions

- [ ] ワークフローファイル作成（5ファイル）
- [ ] Secrets設定確認

---

## 🧪 動作確認

### ローカルでのテスト

```bash
# 1. 環境変数が正しく読み込まれるか確認
cat .env.local

# 2. Dockerビルドテスト
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -t coupleplan:local \
  .

# 3. コンテナ起動テスト
docker run -d -p 8080:8080 \
  --env-file .env.local \
  --name test-app \
  coupleplan:local

# 4. ヘルスチェック
sleep 10
curl http://localhost:8080/api/health

# 5. クリーンアップ
docker stop test-app
docker rm test-app
```

### GitHub Actionsの動作確認

#### 方法1: Pull Requestを作成

```bash
# 1. 新しいブランチを作成
git checkout -b test/github-actions

# 2. ダミーファイルを追加
echo "# Test" > test.md
git add test.md
git commit -m "test: GitHub Actions動作確認"

# 3. Pushしてプルリクエスト作成
git push origin test/github-actions

# 4. GitHub Web UIでPull Request作成

# 5. Actionsタブで実行状況を確認
# https://github.com/your-org/coupleplan/actions
```

#### 方法2: 手動実行（workflow_dispatch）

```bash
# GitHub CLI使用
gh workflow run nightly.yml

# Web UIから実行
# Actions → Nightly Full Test → Run workflow
```

---

## ⚠️ トラブルシューティング

### エラー1: "Secret not found"

**症状**:

```
Error: Secret TEST_SUPABASE_URL not found
```

**解決策**:

1. Settings → Secrets and variables → Actions で設定を確認
2. Secret名のタイポをチェック
3. リポジトリのアクセス権限を確認（Forkの場合、Secretsは引き継がれない）

### エラー2: "GCP authentication failed"

**症状**:

```
ERROR: (gcloud.auth.activate-service-account) Invalid JSON content in credentials file
```

**解決策**:

1. `GCP_SA_KEY`の値が正しいJSON形式か確認
2. キーファイル全体をコピーしているか確認（先頭の`{`から末尾の`}`まで）
3. 余分なスペースや改行がないか確認

### エラー3: "Permission denied"

**症状**:

```
ERROR: (gcloud.run.deploy) Permission denied
```

**解決策**:

```bash
# サービスアカウントの権限を再確認
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:coupleplan-deployer@*"

# 必要な権限がない場合は再付与
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:coupleplan-deployer@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

### エラー4: "Trivy scan failed"

**症状**:

```
Critical vulnerabilities found
```

**解決策**:

1. Trivyレポートを確認
2. Dockerfileでベースイメージのバージョンアップ
3. 依存関係の更新（`npm update`）
4. 一時的に警告のみにする（`exit-code: '0'`）

---

## 📝 Secretsの管理

### セキュリティベストプラクティス

1. **定期的なローテーション**
   - サービスアカウントキー: 90日ごと
   - API Key: 180日ごと

2. **最小権限の原則**
   - 必要な権限のみ付与
   - 定期的に権限を見直し

3. **監査ログの確認**

   ```bash
   # GCPの監査ログ
   gcloud logging read "protoPayload.authenticationInfo.principalEmail=coupleplan-deployer@*" --limit 50
   ```

4. **Secretsの暗号化**
   - GitHub Secretsは自動的に暗号化される
   - ログに出力されない

### Secretsの更新

```bash
# GitHub CLI使用
gh secret set SECRET_NAME

# または、新しい値を直接指定
echo -n "new_value" | gh secret set SECRET_NAME

# Web UI: Settings → Secrets → 該当Secret → Update
```

---

## 🚀 初回デプロイ準備

### 全Secrets設定後の確認

```bash
# GitHub Secretsの一覧表示
gh secret list

# 期待される出力:
# GCP_PROJECT_ID
# GCP_SA_KEY
# GOOGLE_SITE_VERIFICATION
# STAGING_ADSENSE_CLIENT_ID
# STAGING_SUPABASE_ANON_KEY
# STAGING_SUPABASE_URL
# TEST_GEMINI_API_KEY
# TEST_SUPABASE_ANON_KEY
# TEST_SUPABASE_SERVICE_ROLE_KEY
# TEST_SUPABASE_URL
```

### 初回GitHub Actions実行

```bash
# 1. ブランチ作成
git checkout -b feature/initial-deploy

# 2. 変更をコミット（ワークフローファイルなど）
git add .github/workflows/
git commit -m "feat: Add GitHub Actions workflows for CI/CD"

# 3. Push
git push origin feature/initial-deploy

# 4. Pull Request作成
gh pr create --title "feat: Add CI/CD workflows" --body "Initial GitHub Actions setup"

# 5. Actionsタブで pr-test.yml の実行を確認
# https://github.com/your-org/coupleplan/actions

# 6. テスト成功を確認後、マージ
gh pr merge --merge

# 7. main-test.yml が自動実行され、Stagingにデプロイされる
```

---

## 📚 参考資料

- [GitHub Actions公式ドキュメント](https://docs.github.com/actions)
- [GitHub Secrets管理](https://docs.github.com/actions/security-guides/encrypted-secrets)
- [Cloud Run Deploy Action](https://github.com/google-github-actions/deploy-cloudrun)
- [Google Cloud Auth Action](https://github.com/google-github-actions/auth)
- [Trivy Action](https://github.com/aquasecurity/trivy-action)

---

## 📞 サポート

### よくある質問

**Q1: Secretsは何個まで登録できる？**
A: GitHub Free プランでは無制限。

**Q2: Secretsを複数リポジトリで共有できる？**
A: Organization Secretsを使用すれば可能。Settings → Secrets → New organization secret

**Q3: Secretsの値を確認する方法は？**
A: セキュリティ上、一度登録したSecretの値は確認できません。再登録が必要です。

**Q4: ローカルでGitHub Actionsをテストできる？**
A: `act`（https://github.com/nektos/act）を使用すれば可能。

```bash
brew install act
act pull_request -j unit-test
```

---

**最終更新**: 2025年10月11日  
**次回レビュー**: 初回デプロイ成功後
