# 必要なGitHub Secrets一覧

## ドキュメント情報

- **作成日**: 2025年10月11日
- **バージョン**: 1.0.0
- **対象**: CouplePlan GitHub Actionsワークフロー

---

## 📋 Secrets一覧（環境別）

**注**: テスト実行とStaging環境は同じSupabase/APIキーを使用します。

### 🟡 Staging環境用（テスト兼用）（9個）

| Secret名                            | 使用箇所                                              | 説明                     | 必須 |
| ----------------------------------- | ----------------------------------------------------- | ------------------------ | ---- |
| `STAGING_SUPABASE_URL`              | deploy.yml, pr-test.yml, docker-test.yml, nightly.yml | Staging Supabase URL     | ✅   |
| `STAGING_SUPABASE_ANON_KEY`         | deploy.yml, pr-test.yml, docker-test.yml, nightly.yml | Staging Anon Key         | ✅   |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | deploy.yml, pr-test.yml, docker-test.yml, nightly.yml | Staging Service Role Key | ✅   |
| `STAGING_GEMINI_API_KEY`            | deploy.yml, pr-test.yml, docker-test.yml, nightly.yml | Staging Gemini API Key   | ✅   |
| `STAGING_AI_PROVIDER`               | deploy.yml, pr-test.yml, docker-test.yml, nightly.yml | AIプロバイダー (gemini)  | ✅   |
| `STAGING_AI_MODEL`                  | deploy.yml, pr-test.yml, docker-test.yml, nightly.yml | AIモデル名               | ✅   |
| `STAGING_AI_MAX_TOKENS`             | deploy.yml, pr-test.yml, docker-test.yml, nightly.yml | AI最大トークン数         | ✅   |
| `STAGING_AI_TEMPERATURE`            | deploy.yml, pr-test.yml, docker-test.yml, nightly.yml | AI Temperature設定       | ✅   |
| `STAGING_RESEND_API_KEY`            | deploy.yml                                            | Staging Resend API Key   | ✅   |

### 🔴 本番環境用（9個）

| Secret名                        | 使用箇所          | 説明                    | 必須 |
| ------------------------------- | ----------------- | ----------------------- | ---- |
| `NEXT_PUBLIC_SUPABASE_URL`      | deploy.yml (main) | 本番Supabase URL        | ✅   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | deploy.yml (main) | 本番Anon Key            | ✅   |
| `SUPABASE_SERVICE_ROLE_KEY`     | deploy.yml (main) | 本番Service Role Key    | ✅   |
| `GEMINI_API_KEY`                | deploy.yml (main) | 本番Gemini API Key      | ✅   |
| `AI_PROVIDER`                   | deploy.yml (main) | AIプロバイダー (gemini) | ✅   |
| `AI_MODEL`                      | deploy.yml (main) | AIモデル名              | ✅   |
| `AI_MAX_TOKENS`                 | deploy.yml (main) | AI最大トークン数        | ✅   |
| `AI_TEMPERATURE`                | deploy.yml (main) | AI Temperature設定      | ✅   |
| `RESEND_API_KEY`                | deploy.yml (main) | 本番Resend API Key      | ✅   |

### 🌐 共通（4個）

| Secret名              | 使用箇所   | 説明                              | 必須 |
| --------------------- | ---------- | --------------------------------- | ---- |
| `WIF_PROVIDER`        | deploy.yml | Workload Identity Provider        | ✅   |
| `WIF_SERVICE_ACCOUNT` | deploy.yml | Workload Identity Service Account | ✅   |
| `ADMIN_EMAIL`         | deploy.yml | 管理者メールアドレス              | ✅   |
| `FROM_EMAIL`          | deploy.yml | 送信元メールアドレス              | ✅   |

---

## 📊 集計

- **必須Secrets**: 22個
- **合計**: 22個

**内訳**:

- Staging環境（テスト兼用）: 9個
- 本番環境: 9個
- 共通: 4個

---

## 🔐 セキュリティレベル別

### Critical（絶対に漏洩させてはいけない）

- `SUPABASE_SERVICE_ROLE_KEY`
- `STAGING_SUPABASE_SERVICE_ROLE_KEY`
- `TEST_SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `STAGING_GEMINI_API_KEY`
- `TEST_GEMINI_API_KEY`
- `RESEND_API_KEY`
- `STAGING_RESEND_API_KEY`
- `WIF_SERVICE_ACCOUNT`

### High（公開すべきでない）

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`（公開可能だが推奨しない）
- `STAGING_SUPABASE_ANON_KEY`
- `TEST_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`
- `STAGING_OPENWEATHER_API_KEY`

### Medium（公開しても影響小）

- `NEXT_PUBLIC_SUPABASE_URL`
- `STAGING_SUPABASE_URL`
- `TEST_SUPABASE_URL`
- `ADMIN_EMAIL`
- `FROM_EMAIL`
- `GOOGLE_SITE_VERIFICATION`

---

## 🚀 クイック設定ガイド

### 1. Supabase Secrets（2環境 × 3個 = 6個）

```bash
# Staging環境（テスト実行にも使用）
STAGING_SUPABASE_URL = https://staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY = eyJ...（Staging Project Anon Key）
STAGING_SUPABASE_SERVICE_ROLE_KEY = eyJ...（Staging Project Service Role）

# 本番環境
NEXT_PUBLIC_SUPABASE_URL = https://production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...（Production Project Anon Key）
SUPABASE_SERVICE_ROLE_KEY = eyJ...（Production Project Service Role）
```

**注**: テスト実行（pr-test.yml等）もStagingのSupabaseを使用します。

### 2. AI API Keys & 設定（2環境 × 5個 = 10個）

```bash
# Google AI Studioで2つのAPIキーを作成
STAGING_GEMINI_API_KEY = AIzaSy...（Staging・テスト用）
GEMINI_API_KEY = AIzaSy...（本番用）

# AI設定（Staging: 低コスト構成）
STAGING_AI_PROVIDER = gemini
STAGING_AI_MODEL = gemini-2.0-flash-lite
STAGING_AI_MAX_TOKENS = 2000
STAGING_AI_TEMPERATURE = 0.7

# AI設定（本番: 高品質構成）
AI_PROVIDER = gemini
AI_MODEL = gemini-2.0-flash-exp
AI_MAX_TOKENS = 4000
AI_TEMPERATURE = 0.7
```

**推奨モデル**:

- **Staging**: `gemini-2.0-flash-lite` - 低コスト、テスト用に最適
- **Production**: `gemini-2.0-flash-exp` - 高品質、本番環境向け

### 3. メール送信（Resend）（2環境 × 1個 = 2個）

```bash
# Resendで2つのAPIキーを作成
# https://resend.com/

STAGING_RESEND_API_KEY = re_...（Staging用）
RESEND_API_KEY = re_...（本番用）
```

### 4. 共通設定（2個）

```bash
ADMIN_EMAIL = admin@coupleplan.app
FROM_EMAIL = noreply@coupleplan.app
```

### 5. Workload Identity Federation（2個）

```bash
WIF_PROVIDER = projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider
WIF_SERVICE_ACCOUNT = github-actions@serious-bearing-460203-r6.iam.gserviceaccount.com
```

---

## 💰 低コスト運用の設定

### Staging環境（開発・テスト用）

```yaml
flags: |
  --allow-unauthenticated
  --min-instances=0        # アイドル時のコスト: $0/月
  --max-instances=3        # 最大3インスタンス（コスト制御）
  --memory=512Mi          # メモリ最小構成（低コスト）
  --cpu=1                 # CPU 1コア
  --timeout=300s          # 5分（AI生成に対応）
  --concurrency=80        # 1インスタンスあたり80リクエスト
```

**月間コスト見積もり**:

- アイドル時: **$0/月**（min-instances=0）
- 月100リクエスト: **$0.05-0.10/月**（ほぼ無料）
- 月1,000リクエスト: **$0.50-1.00/月**

### 本番環境（実運用）

```yaml
flags: |
  --allow-unauthenticated
  --min-instances=0        # アイドル時のコスト: $0/月
  --max-instances=10       # 最大10インスタンス（トラフィック対応）
  --memory=1Gi            # メモリ1GB（AI処理に最適）
  --cpu=1                 # CPU 1コア
  --timeout=300s          # 5分
  --concurrency=80        # 1インスタンスあたり80リクエスト
```

**月間コスト見積もり**:

- アイドル時: **$0/月**（min-instances=0）
- 月10,000リクエスト: **$5-10/月**
- 月100,000リクエスト: **$50-100/月**

**コスト削減のポイント**:

1. ✅ `min-instances=0`: アイドル時のコストゼロ
2. ✅ `max-instances`制限: コスト上限設定
3. ✅ `memory`最小化: Stagingは512Mi、本番は1Gi
4. ✅ `concurrency=80`: インスタンス数を抑制
5. ✅ 無料枠活用: 月200万リクエストまで無料

---

## 📝 設定手順

### GitHub Web UIでの設定

1. リポジトリページに移動

   ```
   https://github.com/your-org/coupleplan
   ```

2. Settings → Secrets and variables → Actions

3. 「New repository secret」をクリック

4. Name と Secret を入力

5. 「Add secret」をクリック

6. 全15個のSecretsを登録

### GitHub CLIでの設定（一括）

```bash
# GitHub CLIインストール確認
gh --version

# リポジトリディレクトリに移動
cd coupleplan

# Secretsを一括設定（インタラクティブ）
gh secret set STAGING_SUPABASE_URL
# → プロンプトが表示されるので値を入力

# または、ファイルから読み込み
echo "https://staging-project.supabase.co" | gh secret set STAGING_SUPABASE_URL

# 全Secretsを設定後、確認
gh secret list
```

---

## ⚠️ 重要な注意事項

### 環境変数 vs ビルド引数

#### ビルド時に必要（`--build-arg`）

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`

理由: Next.jsのビルド時にクライアント側コードに埋め込まれる

#### ランタイムに必要（`env_vars`）

- `NODE_ENV`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `FROM_EMAIL`

理由: サーバーサイドでのみ使用、動的に変更可能

### 現在の実装

**現状**: すべてをビルド引数として渡している（deploy.yml 旧版）  
**問題**: ランタイムシークレットもビルド時に埋め込まれてしまう  
**改善**: NEXT*PUBLIC*\*のみビルド引数、それ以外はenv_varsで渡す ✅

---

## 🔄 マイグレーションガイド

### 旧deploy.ymlからの変更点

#### Before（旧版）

```yaml
- すべての環境変数をビルド引数として渡す
- mainブランチのみデプロイ
- テストなし
- 環境分離なし
```

#### After（新版）✅

```yaml
- NEXT_PUBLIC_*のみビルド引数
- ランタイムシークレットはenv_vars
- develop→Staging、main→Production
- デプロイ前にテスト実行
- 低コスト設定（min-instances=0）
```

### 必要な追加Secrets

#### Staging環境用（新規追加）

- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_SERVICE_ROLE_KEY`
- `STAGING_GEMINI_API_KEY`
- `STAGING_RESEND_API_KEY`
- `STAGING_ADSENSE_CLIENT_ID`（オプション）
- `STAGING_OPENWEATHER_API_KEY`（オプション）

#### テスト環境用（新規追加）

- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_SUPABASE_SERVICE_ROLE_KEY`
- `TEST_GEMINI_API_KEY`

---

## 📞 サポート

### よくある質問

**Q1: なぜ環境ごとに別々のAPIキーが必要？**

A: セキュリティとコスト管理のため。本番のAPIキーが漏洩しても、テスト環境は影響を受けません。

**Q2: Staging環境のSupabaseプロジェクトは別に作る？**

A: はい。本番データと分離するため、別プロジェクトを推奨します。

**Q3: WIF_PROVIDERとは？**

A: Workload Identity Federation。GitHubからGCPへの安全な認証方法です。サービスアカウントキーより安全です。

**Q4: min-instances=0で本番運用は大丈夫？**

A: はい。コールドスタート（5秒以内）は許容範囲です。トラフィックが増えたら`min-instances=1`に変更できます。

---

## 🎯 設定チェックリスト

### Staging環境（テスト兼用）

- [ ] STAGING_SUPABASE_URL
- [ ] STAGING_SUPABASE_ANON_KEY
- [ ] STAGING_SUPABASE_SERVICE_ROLE_KEY
- [ ] STAGING_GEMINI_API_KEY
- [ ] STAGING_AI_PROVIDER
- [ ] STAGING_AI_MODEL
- [ ] STAGING_AI_MAX_TOKENS
- [ ] STAGING_AI_TEMPERATURE
- [ ] STAGING_RESEND_API_KEY

### 本番環境

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] GEMINI_API_KEY
- [ ] AI_PROVIDER
- [ ] AI_MODEL
- [ ] AI_MAX_TOKENS
- [ ] AI_TEMPERATURE
- [ ] RESEND_API_KEY

### 共通

- [ ] WIF_PROVIDER
- [ ] WIF_SERVICE_ACCOUNT
- [ ] ADMIN_EMAIL
- [ ] FROM_EMAIL
- [ ] GOOGLE_SITE_VERIFICATION（オプション）

### 確認

```bash
# GitHub CLIで確認
gh secret list

# 期待される出力: 23個のSecretsが表示される
```

---

**最終更新**: 2025年10月11日  
**次回レビュー**: 全Secrets設定完了後
