# 本番環境構築ガイド

このガイドでは、CouplePlan の本番環境を構築するための完全な手順を説明します。

**所要時間**: 約 60-90 分  
**前提条件**: Staging 環境が既に動作していること

---

## 📋 構築の全体像

```
1. Supabase本番プロジェクト作成 (15分)
   ↓
2. データベーススキーマ設定 (10分)
   ↓
3. Google Cloud Run設定確認 (5分)
   ↓
4. GitHub Secrets設定 (20分)
   ↓
5. 本番デプロイ実行 (10分)
   ↓
6. 動作確認・テスト (15分)
   ↓
7. カスタムドメイン設定 (オプション) (15分)
```

---

## ステップ 1: Supabase 本番プロジェクト作成

### 1.1 新規プロジェクト作成

1. **Supabase ダッシュボードにアクセス**

   ```
   https://supabase.com/dashboard
   ```

2. **「New project」をクリック**

3. **プロジェクト情報を入力**

   ```
   Name: coupleplan-production
   Database Password: （強力なパスワードを生成・保存）
   Region: Northeast Asia (Tokyo) - asia-northeast1
   Pricing Plan: Free（または Pro）
   ```

4. **「Create new project」をクリック**
   - プロジェクト作成に 2-3 分かかります

### 1.2 API キーの取得

プロジェクト作成完了後：

1. **Settings → API** に移動

2. **以下の情報をコピー・保存**

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **⚠️ 重要**: `service_role key` は絶対に公開しないでください！

### 1.3 認証設定

1. **Authentication → Providers** に移動

2. **Email Provider を有効化**

   ```
   Enable Email Provider: ON
   Confirm email: ON (推奨)
   ```

3. **Email Templates のカスタマイズ（オプション）**
   - Authentication → Email Templates
   - Confirm signup、Reset password などをカスタマイズ

---

## ステップ 2: データベーススキーマ設定

### 2.1 データベースセットアップ（統合版）

**ファイル**: `supabase/database_setup_complete.sql`

この1つのファイルで完全なデータベースセットアップが可能です：

```sql
-- Supabase SQL Editorを開く
-- 左サイドバー → SQL Editor → New query

-- 統合ファイルの内容をコピー&ペースト
-- 実行: Ctrl+Enter または Run ボタン

-- 完了メッセージが表示されます：
-- "CouplePlan データベースセットアップ完了"
```

**含まれる内容**:

- ✅ 全テーブル作成（10テーブル）
- ✅ インデックス作成
- ✅ トリガー設定
- ✅ RLSポリシー設定
- ✅ 初期データ投入
- ✅ ヘルパー関数

### 2.2 動作確認

1. **Table Editor** で作成されたテーブルを確認

   ```
   ✓ profiles (ユーザープロフィール)
   ✓ couples (カップル関係)
   ✓ couple_invitations (パートナー招待)
   ✓ date_plans (デートプラン)
   ✓ plan_items (プランアイテム)
   ✓ plan_templates (プランテンプレート)
   ✓ plan_feedback (プランフィードバック)
   ✓ subscription_plans (サブスクリプションプラン)
   ✓ user_subscriptions (ユーザーサブスクリプション)
   ✓ plan_generation_usage (使用履歴)
   ```

2. **RLS の確認**
   - 各テーブルで「RLS enabled」が表示されていることを確認

3. **初期データの確認**
   - `subscription_plans`テーブルにFree/Premiumプランが登録されているか確認

---

## ステップ 3: Google Cloud Run 設定確認

### 3.1 既存設定の確認

現在の設定（`deploy.yml` より）:

```yaml
Project ID: serious-bearing-460203-r6
Region: asia-northeast1
Service Name: coupleplan（本番）
Repository: coupleplan-repo
```

### 3.2 Artifact Registry の確認

1. **Google Cloud Console にアクセス**

   ```
   https://console.cloud.google.com/
   ```

2. **Artifact Registry** に移動

3. **リポジトリの確認**

   ```
   名前: coupleplan-repo
   場所: asia-northeast1
   形式: Docker
   ```

   作成されていない場合:

   ```bash
   gcloud artifacts repositories create coupleplan-repo \
     --repository-format=docker \
     --location=asia-northeast1 \
     --description="CouplePlan Docker images"
   ```

### 3.3 Workload Identity Federation の確認

既に設定済みの場合はスキップ。未設定の場合：

**詳細手順**: `Docs/tests/GITHUB_SECRETS_SETUP.md` を参照

---

## ステップ 4: GitHub Secrets 設定

### 4.1 本番環境用 Secrets（9個）

GitHub リポジトリの **Settings → Secrets and variables → Actions** で設定：

#### Supabase 関連（3個）

| Secret 名                       | 値                          | 取得元                                   |
| ------------------------------- | --------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxxxx.supabase.co` | Supabase → Settings → API                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...`                | Supabase → Settings → API (anon public)  |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJhbGc...`                | Supabase → Settings → API (service_role) |

#### AI 関連（5個）

| Secret 名        | 値                     | 説明                    |
| ---------------- | ---------------------- | ----------------------- |
| `GEMINI_API_KEY` | `AIzaSy...`            | Google AI Studio で取得 |
| `AI_PROVIDER`    | `gemini`               | 固定値                  |
| `AI_MODEL`       | `gemini-2.0-flash-exp` | 本番推奨モデル          |
| `AI_MAX_TOKENS`  | `4000`                 | トークン上限            |
| `AI_TEMPERATURE` | `0.7`                  | 生成の多様性            |

**AI API キーの取得方法**:

1. https://aistudio.google.com/ にアクセス
2. 「Get API Key」をクリック
3. 新しいキーを作成（本番用として命名）
4. キーをコピー

#### メール関連（1個）

| Secret 名        | 値       | 取得元                      |
| ---------------- | -------- | --------------------------- |
| `RESEND_API_KEY` | `re_...` | https://resend.com/api-keys |

**Resend API キーの取得方法**:

1. https://resend.com/ にログイン
2. API Keys → Create API Key
3. Name: `CouplePlan Production`
4. Permission: Sending access
5. キーをコピー

### 4.2 共通 Secrets（4個）※既に設定済みの場合はスキップ

| Secret 名             | 値                                          | 説明                       |
| --------------------- | ------------------------------------------- | -------------------------- |
| `WIF_PROVIDER`        | `projects/.../providers/...`                | Workload Identity Provider |
| `WIF_SERVICE_ACCOUNT` | `github-actions@...iam.gserviceaccount.com` | Service Account            |
| `ADMIN_EMAIL`         | `admin@yourdomain.com`                      | 管理者メール               |
| `FROM_EMAIL`          | `noreply@yourdomain.com`                    | 送信元メール               |

### 4.3 設定の確認

**GitHub CLI で確認**:

```bash
gh secret list
```

**必要な Secrets（本番環境分）**:

- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ GEMINI_API_KEY
- ✅ AI_PROVIDER
- ✅ AI_MODEL
- ✅ AI_MAX_TOKENS
- ✅ AI_TEMPERATURE
- ✅ RESEND_API_KEY

**共通 Secrets**:

- ✅ WIF_PROVIDER
- ✅ WIF_SERVICE_ACCOUNT
- ✅ ADMIN_EMAIL
- ✅ FROM_EMAIL

---

## ステップ 5: 本番デプロイ実行

### 5.1 デプロイ前チェック

```bash
# ローカルで確認
cd coupleplan

# ブランチ確認
git branch
# → * koji ma/2025/1011 など

# 最新の変更を取得
git pull origin kojima/2025/1011

# main ブランチの状態確認
git log main --oneline -5
```

### 5.2 main ブランチへマージ

**オプション A: PR経由でマージ（推奨）**

1. **GitHub で PR 作成**

   ```
   Base: main
   Compare: kojima/2025/1011（または現在の開発ブランチ）
   ```

2. **PR をマージ**
   - pr-test.yml が自動実行される
   - すべてのテストが通過することを確認
   - 「Merge pull request」をクリック

3. **デプロイワークフロー自動実行**
   - main へのマージで `deploy.yml` が自動実行
   - `deploy-production` ジョブが起動

**オプション B: 直接マージ（非推奨だが可能）**

```bash
# main ブランチに切り替え
git checkout main

# 最新を取得
git pull origin main

# 開発ブランチをマージ
git merge kojima/2025/1011

# プッシュ
git push origin main
```

### 5.3 デプロイ進行状況の確認

1. **GitHub Actions タブを開く**

   ```
   https://github.com/your-org/coupleplan/actions
   ```

2. **「Deploy to Cloud Run」ワークフローを確認**
   - `deploy-production` ジョブが実行中

3. **各ステップの進行確認**
   ```
   ✓ Checkout code
   ✓ Google Auth
   ✓ Set up Cloud SDK
   ✓ Authorize Docker push
   ⏳ Build Docker image (3-5分)
   ⏳ Push to Artifact Registry
   ⏳ Deploy to Cloud Run (2-3分)
   ⏳ Test deployment
   ✓ Deployment summary
   ```

### 5.4 デプロイ完了の確認

**成功時の出力例**:

```
## 🚀 Production Deployment

- **Environment**: Production
- **Service**: coupleplan
- **Region**: asia-northeast1
- **URL**: https://coupleplan-xxxxx-an.a.run.app

💰 **Cost Optimization**:
- Min instances: 0 (no idle cost)
- Max instances: 10 (scale for traffic)
- Memory: 1Gi (optimized for AI workload)

✅ Deployment successful!
```

**URL をコピー**: `https://coupleplan-xxxxx-an.a.run.app`

---

## ステップ 6: 動作確認・テスト

### 6.1 基本動作確認

1. **ヘルスチェック**

   ```bash
   curl https://coupleplan-xxxxx-an.a.run.app/api/health
   ```

   期待される応答:

   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-12T12:00:00.000Z"
   }
   ```

2. **トップページアクセス**
   ```
   https://coupleplan-xxxxx-an.a.run.app
   ```

### 6.2 認証機能のテスト

1. **新規アカウント作成**

   ```
   /signup にアクセス
   テストユーザーを作成
   ```

2. **メール確認**
   - Supabase ダッシュボードで確認メールを確認
   - または実際のメールアドレスで確認

3. **ログイン**
   ```
   /login にアクセス
   作成したアカウントでログイン
   ```

### 6.3 AI 機能のテスト

1. **ダッシュボードにアクセス**

   ```
   /dashboard
   ```

2. **AIプラン生成を試す**

   ```
   /dashboard/plans/create

   入力例:
   - 予算: 10,000円
   - 時間: 3時間
   - 場所: 東京
   - 好み: カフェ、美術館
   ```

3. **コンソールログ確認**

   ```bash
   # Cloud Run のログを確認
   gcloud run services logs read coupleplan \
     --region=asia-northeast1 \
     --limit=50
   ```

   期待されるログ:

   ```
   [Gemini API] リクエスト送信: gemini-2.0-flash-exp
   [Gemini API] レスポンス受信: 200
   [Gemini API] 使用トークン: 1234
   ```

### 6.4 パフォーマンステスト

**コールドスタート（初回アクセス）**:

```bash
time curl https://coupleplan-xxxxx-an.a.run.app/api/health
```

期待: 5秒以内

**ウォームアクセス（2回目以降）**:

```bash
time curl https://coupleplan-xxxxx-an.a.run.app/api/health
```

期待: 1秒以内

---

## ステップ 7: カスタムドメイン設定（オプション）

### 7.1 ドメインの準備

**前提**: 独自ドメインを所有している（例: `coupleplan.app`）

### 7.2 Cloud Run でドメインをマッピング

1. **Cloud Run コンソール**

   ```
   https://console.cloud.google.com/run
   ```

2. **サービス「coupleplan」を選択**

3. **「MANAGE CUSTOM DOMAINS」をクリック**

4. **「ADD MAPPING」**

   ```
   Service: coupleplan
   Domain: coupleplan.app または app.coupleplan.com
   ```

5. **DNS レコードの設定**

   表示された値を DNS プロバイダーで設定:

   ```
   Type: A
   Name: @ (または app)
   Value: xxx.xxx.xxx.xxx (Cloud Runから提供)

   Type: AAAA
   Name: @ (または app)
   Value: xxxx:xxxx:... (Cloud Runから提供)
   ```

6. **SSL 証明書の自動発行を待つ**
   - 15分〜1時間程度

### 7.3 Supabase の URL 設定更新

1. **Supabase Dashboard → Authentication → URL Configuration**

2. **Site URL を更新**

   ```
   https://coupleplan.app (または https://app.coupleplan.com)
   ```

3. **Redirect URLs に追加**
   ```
   https://coupleplan.app/**
   https://app.coupleplan.com/**
   ```

---

## 🎯 チェックリスト

### 事前準備

- [ ] Staging 環境が正常に動作している
- [ ] Google Cloud Project ID を確認済み
- [ ] GitHub リポジトリへのアクセス権限がある

### Supabase 設定

- [ ] 本番プロジェクト作成完了
- [ ] API キー取得・保存完了
- [ ] データベーススキーマ設定完了
- [ ] RLS ポリシー適用完了
- [ ] 認証設定完了

### GitHub Secrets 設定

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] GEMINI_API_KEY
- [ ] AI_PROVIDER / MODEL / MAX_TOKENS / TEMPERATURE
- [ ] RESEND_API_KEY
- [ ] WIF_PROVIDER / WIF_SERVICE_ACCOUNT (既存確認)
- [ ] ADMIN_EMAIL / FROM_EMAIL (既存確認)

### デプロイ

- [ ] main ブランチへマージ完了
- [ ] deploy.yml ワークフロー成功
- [ ] Cloud Run にデプロイ完了
- [ ] デプロイ URL 取得

### 動作確認

- [ ] ヘルスチェック成功
- [ ] トップページ表示
- [ ] 新規ユーザー登録
- [ ] ログイン
- [ ] AI プラン生成テスト
- [ ] メール送信テスト

### オプション

- [ ] カスタムドメイン設定
- [ ] SSL 証明書発行
- [ ] 監視・アラート設定

---

## 💰 コスト見積もり

### 本番環境（月間）

**Cloud Run**:

- アイドル時: $0/月 (min-instances=0)
- 月 10,000 リクエスト: $5-10/月
- 月 100,000 リクエスト: $50-100/月

**Supabase**:

- Free プラン: $0/月 (500MB DB, 無制限認証)
- Pro プラン: $25/月 (8GB DB, 優先サポート)

**Gemini API**:

- 無料枠: 月45,000リクエスト
- 超過時: 約$0.001/リクエスト

**Resend**:

- 無料枠: 月3,000通
- 超過時: $0.001/通

**合計（小規模運用）**: $0-10/月  
**合計（中規模運用）**: $30-100/月

---

## 🆘 トラブルシューティング

### デプロイが失敗する

**症状**: `deploy-production` ジョブがエラー

**原因と対策**:

1. **Secrets 未設定**

   ```bash
   # GitHub CLI で確認
   gh secret list

   # 不足している Secret を追加
   gh secret set GEMINI_API_KEY
   ```

2. **Docker ビルドエラー**

   ```
   エラーログを確認:
   - Module not found → .dockerignore を確認
   - supabaseKey required → 環境変数を確認
   ```

3. **WIF 認証エラー**
   ```
   WIF_PROVIDER と WIF_SERVICE_ACCOUNT を再確認
   ```

### ヘルスチェックが失敗する

**症状**: `/api/health` が 500 エラー

**対策**:

```bash
# Cloud Run ログを確認
gcloud run services logs read coupleplan \
  --region=asia-northeast1 \
  --limit=100
```

### AI 生成が動作しない

**症状**: プラン生成でエラー

**確認項目**:

1. `GEMINI_API_KEY` が正しく設定されているか
2. API キーのクォータが残っているか
3. Cloud Run のログでエラー詳細を確認

---

## 📚 関連ドキュメント

- [REQUIRED_SECRETS.md](./tests/REQUIRED_SECRETS.md) - Secrets 一覧
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 開発環境セットアップ
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - トラブルシューティング
- [ワークフロー README](./.github/workflows/README.md) - CI/CD 詳細

---

## 🎉 完了！

本番環境の構築が完了しました！

**次のステップ**:

1. 本番 URL をチームに共有
2. 監視・アラート設定（Google Cloud Monitoring）
3. バックアップ戦略の確立（Supabase 自動バックアップ確認）
4. ドキュメントの更新

**サポート**: 問題が発生した場合は Issue を作成してください。

---

**最終更新**: 2025年10月12日  
**バージョン**: 1.0.0
