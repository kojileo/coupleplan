# 本番環境構築クイックリファレンス

本番環境構築の要点をまとめた1ページリファレンスです。

---

## 🚀 5ステップで本番稼働

### ステップ 1: Supabase プロジェクト作成（15分）

```
https://supabase.com/dashboard → New project

Name: coupleplan-production
Region: Northeast Asia (Tokyo)
Database Password: [強力なパスワード]

↓ 作成後、以下を取得:
- Project URL
- anon public key
- service_role key
```

### ステップ 2: データベースセットアップ（5分）

```sql
-- Supabase SQL Editor で実行
-- 統合ファイル1つで完了:

supabase/database_setup_complete.sql

-- 実行後、完了メッセージが表示されます
-- "CouplePlan データベースセットアップ完了"
```

### ステップ 3: GitHub Secrets 設定（20分）

```bash
# GitHub → Settings → Secrets and variables → Actions

# Supabase (3個)
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...
SUPABASE_SERVICE_ROLE_KEY = eyJhbG...

# AI (5個)
GEMINI_API_KEY = AIzaSy... (https://aistudio.google.com/)
AI_PROVIDER = gemini
AI_MODEL = gemini-2.0-flash-exp
AI_MAX_TOKENS = 4000
AI_TEMPERATURE = 0.7

# Email (1個)
RESEND_API_KEY = re_... (https://resend.com/)

# 共通 (4個) - 既存のものを確認
WIF_PROVIDER = projects/.../providers/...
WIF_SERVICE_ACCOUNT = github-actions@...
ADMIN_EMAIL = admin@yourdomain.com
FROM_EMAIL = noreply@yourdomain.com
```

### ステップ 4: デプロイ実行（10分）

```bash
# オプションA: PRでマージ（推奨）
GitHub → Pull Requests → Create PR
Base: main, Compare: [開発ブランチ]
→ Merge pull request

# オプションB: 直接マージ
git checkout main
git pull origin main
git merge [開発ブランチ]
git push origin main

# デプロイ自動開始
GitHub Actions → "Deploy to Cloud Run" を確認
```

### ステップ 5: 動作確認（15分）

```bash
# 1. ヘルスチェック
curl https://coupleplan-xxxxx-an.a.run.app/api/health

# 2. ブラウザでアクセス
https://coupleplan-xxxxx-an.a.run.app

# 3. アカウント作成・ログイン
/signup → /login

# 4. AIプラン生成テスト
/dashboard/plans/create

# 5. ログ確認
gcloud run services logs read coupleplan \
  --region=asia-northeast1 --limit=50
```

---

## 📊 必要なリソース一覧

### Supabase

- [ ] 本番プロジェクト（1個）
- [ ] API キー（3種類）

### Google AI Studio

- [ ] Gemini API キー（1個、本番用）

### Resend

- [ ] API キー（1個、本番用）

### Google Cloud

- [ ] Project ID: `serious-bearing-460203-r6`（既存）
- [ ] Artifact Registry: `coupleplan-repo`（既存）
- [ ] WIF設定（既存）

### GitHub

- [ ] Secrets（13個: 本番9個 + 共通4個）

---

## 💰 月間コスト見積もり

| サービス   | 無料枠 | 小規模    | 中規模      |
| ---------- | ------ | --------- | ----------- |
| Cloud Run  | $0     | $5-10     | $50-100     |
| Supabase   | $0     | $0        | $25         |
| Gemini API | $0     | $0        | $10-20      |
| Resend     | $0     | $0        | $5-10       |
| **合計**   | **$0** | **$5-10** | **$90-155** |

**想定**:

- 小規模: 月1万リクエスト、100ユーザー
- 中規模: 月10万リクエスト、1000ユーザー

---

## 🔧 コマンド チートシート

### GitHub Secrets 管理

```bash
# Secrets一覧表示
gh secret list

# Secret設定
gh secret set SECRET_NAME

# Secret削除
gh secret remove SECRET_NAME
```

### Cloud Run 管理

```bash
# サービス一覧
gcloud run services list

# サービス詳細
gcloud run services describe coupleplan --region=asia-northeast1

# ログ確認
gcloud run services logs read coupleplan --region=asia-northeast1

# URLを取得
gcloud run services describe coupleplan \
  --region=asia-northeast1 --format='value(status.url)'
```

### デプロイ確認

```bash
# GitHub Actions ワークフロー確認
gh run list --workflow="Deploy to Cloud Run"

# 最新の実行詳細
gh run view

# ログ表示
gh run view --log
```

---

## ⚠️ よくあるエラーと対処

### エラー: "supabaseKey is required"

**原因**: Secrets未設定  
**対処**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定

### エラー: "403 Forbidden" (Google Cloud)

**原因**: WIF認証失敗  
**対処**: `WIF_PROVIDER`と`WIF_SERVICE_ACCOUNT`を再確認

### エラー: "500 Internal Server Error"

**原因**: 環境変数不足 or DB接続失敗  
**対処**:

```bash
gcloud run services logs read coupleplan \
  --region=asia-northeast1 --limit=100
```

### AI生成が動作しない

**原因**: API キークォータ超過 or 設定ミス  
**対処**:

1. Google AI Studio でクォータ確認
2. `GEMINI_API_KEY`を再生成
3. `AI_MODEL`名が正しいか確認

---

## 📱 デプロイ後のチェックリスト

- [ ] ヘルスチェック成功（/api/health）
- [ ] トップページ表示
- [ ] ユーザー登録
- [ ] ログイン
- [ ] AIプラン生成
- [ ] メール送信
- [ ] パフォーマンステスト（< 5秒）
- [ ] Cloud Run ログ確認
- [ ] エラー監視設定
- [ ] チームに URL 共有

---

## 🔗 関連リンク

| リソース             | URL                                              |
| -------------------- | ------------------------------------------------ |
| Supabase Dashboard   | https://supabase.com/dashboard                   |
| Google Cloud Console | https://console.cloud.google.com/                |
| Google AI Studio     | https://aistudio.google.com/                     |
| Resend Dashboard     | https://resend.com/                              |
| GitHub Actions       | https://github.com/[your-org]/coupleplan/actions |
| Cloud Run サービス   | https://console.cloud.google.com/run             |

---

## 📞 サポート

**詳細ガイド**: [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)  
**トラブルシューティング**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)  
**Secrets一覧**: [tests/REQUIRED_SECRETS.md](./tests/REQUIRED_SECRETS.md)

**問題が発生した場合**:

1. ログを確認
2. ドキュメントを参照
3. GitHub Issue を作成

---

**最終更新**: 2025年10月12日
