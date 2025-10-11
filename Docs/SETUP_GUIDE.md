# CouplePlan セットアップガイド

完全な環境構築とGemini API設定のガイドです。

---

## 📦 1. 環境構築

### 前提条件

- Node.js 18以降
- npm または yarn
- Supabaseアカウント

### 依存関係のインストール

```bash
npm install
```

---

## 🤖 2. Gemini API設定（推奨）

### 2.1 APIキーの取得

1. https://aistudio.google.com/ にアクセス
2. 「Get API Key」をクリック
3. APIキーをコピー

### 2.2 環境変数の設定

`.env.local` を作成：

```env
# AI Provider Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here

# AI Model Configuration（推奨設定）
AI_MODEL=gemini-2.5-flash-lite
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

### 2.3 推奨モデル

| モデル                    | トークン使用量 | 生成時間   | 推奨度     |
| ------------------------- | -------------- | ---------- | ---------- |
| **gemini-2.5-flash-lite** | **659-889**    | **5-10秒** | ⭐⭐⭐⭐⭐ |
| gemini-2.0-flash-exp      | 1000-1500      | 10-15秒    | ⭐⭐⭐⭐⭐ |
| gemini-2.0-flash-lite     | 800-1200       | 8-12秒     | ⭐⭐⭐⭐⭐ |

**トークン効率**: `gemini-2.5-flash-lite` が最も効率的（約78%削減）

### 2.4 無料枠

- **1分間**: 15リクエスト
- **1日**: 1,500リクエスト
- **月間**: 45,000リクエスト

**対応可能**: 15,000ユーザーまで無料枠で対応可能！

---

## 🗄️ 3. Supabase設定

### 3.1 プロジェクト作成

1. https://supabase.com/ でプロジェクト作成
2. Project Settings → API から以下を取得：
   - Project URL
   - Anon Public Key
   - Service Role Key

### 3.2 環境変数の設定

`.env.local` に追加：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3.3 データベースマイグレーション

Supabase SQL Editorで以下を実行：

1. `supabase/migrations/create_couple_invitations.sql`
2. `supabase/migrations/create_date_plans.sql`
3. `supabase/rls-policies.sql`（Row Level Security）

---

## 🚀 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

---

## 📊 5. 動作確認

### 5.1 認証のテスト

1. http://localhost:3000/signup
2. アカウント作成
3. メール認証（開発環境ではSupabaseダッシュボードで確認）

### 5.2 AIプラン生成のテスト

1. http://localhost:3000/dashboard/plans/create
2. 予算・時間・場所を入力
3. 「AIプランを生成」をクリック

**期待される結果**:

```
[Gemini API] リクエスト送信: gemini-2.5-flash-lite
[Gemini API] レスポンス受信: 200
[Gemini API] 使用トークン: 659-889
```

---

## 🎯 6. 本番環境デプロイ（Vercel）

### 6.1 Vercelプロジェクト作成

```bash
npm run build
vercel deploy
```

### 6.2 環境変数の設定

Vercelダッシュボードで以下を設定：

**必須**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**AI機能**:

- `AI_PROVIDER` = `gemini`
- `GEMINI_API_KEY` = (Google AI Studioで取得)
- `AI_MODEL` = `gemini-2.5-flash-lite`
- `AI_MAX_TOKENS` = `2000`
- `AI_TEMPERATURE` = `0.7`

---

## 💡 7. トークン最適化のポイント

### 7.1 思考トークンとは

**Gemini 2.5 Pro**: 思考トークン約2000を使用（非効率）

```
プロンプト: 95トークン
思考: 1999トークン  ← 無駄
出力: 900トークン
合計: 2994トークン
```

**Gemini 2.5 Flash-Lite**: 思考トークン0（効率的）

```
プロンプト: 201トークン
思考: 0トークン      ← なし！
出力: 688トークン
合計: 889トークン    ← 約70%削減
```

### 7.2 プロンプトの工夫

現在のプロンプト（最適化済み）:

- 簡潔な指示
- 具体的な店舗名を要求
- 住所・緯度経度を明示
- JSON形式の例を提示

**効果**: トークン使用量が最小限（659-889トークン）

---

## 🔐 8. セキュリティ設定

### 8.1 Row Level Security (RLS)

Supabaseで必ず有効化：

- `couples` テーブル
- `date_plans` テーブル
- `plan_items` テーブル

### 8.2 APIキーの管理

**重要**: APIキーは絶対にGitにコミットしない

```bash
# .gitignore に含まれることを確認
.env.local
.env*.local
```

---

## 📖 9. 追加設定（オプション）

### 9.1 OpenAI API

```env
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4
AI_MAX_TOKENS=2000
```

### 9.2 Anthropic Claude API

```env
AI_PROVIDER=anthropic
AI_API_KEY=your_anthropic_api_key
AI_MODEL=claude-3-sonnet-20240229
AI_MAX_TOKENS=2000
```

### 9.3 Mock（開発・テスト用）

```env
AI_PROVIDER=mock
# APIキー不要
```

---

## ✅ セットアップ完了チェックリスト

- [ ] Node.js 18以降がインストール済み
- [ ] `npm install` 完了
- [ ] `.env.local` 作成済み
- [ ] Supabaseプロジェクト作成済み
- [ ] Gemini APIキー取得済み
- [ ] 環境変数設定完了
- [ ] データベースマイグレーション実行済み
- [ ] 開発サーバーが起動できる
- [ ] AIプラン生成が動作する

---

## 🆘 問題が発生した場合

[TROUBLESHOOTING.md](./TROUBLESHOOTING.md) を参照してください。

---

**最終更新**: 2025年10月10日  
**バージョン**: v1.0.0
