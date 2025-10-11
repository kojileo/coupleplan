# 💑 CouplePlan - カップル向けデートプラン統合プラットフォーム

カップルの絆を深める、AI駆動のデートプラン提案・管理統合プラットフォーム

## ✨ 主な機能

### 🚀 実装済み機能

#### 1. **認証システム**

- ✅ ユーザー登録・ログイン
- ✅ メール認証
- ✅ パスワードリセット
- ✅ セッション管理

#### 2. **プロフィール管理**

- ✅ プロフィール編集（名前、メール、居住地、誕生日、記念日）
- ✅ アカウント削除
- ✅ パスワード変更
- ✅ プライバシー設定

#### 3. **パートナー連携**

- ✅ 招待コード生成（6桁、24時間有効）
- ✅ 招待コード検証
- ✅ カップル関係の確立
- ✅ パートナー情報の表示

#### 4. **AIデートプラン提案（UC-001）** ⭐ NEW

- ✅ デートプラン作成画面
- ✅ **AI生成機能** - 本格的なAI統合完了 🎉
  - Google Gemini 2.0 Flash統合（**最推奨モデル - 思考トークン0**）
  - **トークン最適化**: 1プラン約1000-1500トークン（60-75%削減）
  - **高速生成**: 10-15秒（従来比30-40%短縮）
  - OpenAI API統合
  - Anthropic Claude API統合
  - レート制限管理（キューイング、リトライ）
  - 多重リクエスト防止機構
- ✅ プラン提案画面
- ✅ プラン詳細表示
- ✅ **カスタマイズビュー** - プラン編集機能
  - プラン基本情報の編集
  - プランアイテムの追加・編集・削除
  - 予算・時間の自動計算
  - プラン確定機能（ステータス管理）
- ✅ プラン一覧・検索
- ✅ カップル専用プラン管理

#### 5. **マネタイズ機能（UC-007）** 💰 NEW

- ✅ **サブスクリプションシステム** - 段階的マネタイズ
  - **Freeプラン**: 日次3回、月次10回、プラン保存5件
  - **Premiumプラン**: 無制限（¥480/月、将来実装）
- ✅ **使用制限機能**
  - AIプラン生成の回数制限（日次・月次）
  - 使用履歴の記録と管理
  - リアルタイム残り回数表示
  - 制限到達時のユーザーフィードバック
- ✅ **サブスクリプション管理画面**
  - 現在のプラン表示
  - 使用状況の可視化
  - Premium案内
- ✅ **データベース設計**
  - `subscription_plans` - プラン定義
  - `user_subscriptions` - ユーザーのサブスク状態
  - `plan_generation_usage` - 使用履歴
  - 自動プラン割り当てトリガー

#### 6. **UI/UX**

- ✅ レスポンシブデザイン（デスクトップ・タブレット・モバイル対応）
- ✅ グローバルナビゲーションバー
- ✅ モダンなデザイン（Tailwind CSS）
- ✅ ローディング状態表示
- ✅ エラーハンドリング

### 🔮 近日公開予定

- 🚧 **共同編集機能（UC-002）** - リアルタイム共同編集
- 🚧 **AI喧嘩仲裁・関係修復（UC-004）** - AI仲裁機能
- 🚧 **Date Canvas（UC-005）** - 思い出記録キャンバス
- 🚧 **ポータル統合（UC-003）** - デート情報ポータル

## 🛠️ 技術スタック

### フロントエンド

- **Next.js 15** - React フレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **React Hooks** - 状態管理

### バックエンド

- **Next.js API Routes** - サーバーサイドAPI
- **Supabase** - 認証・データベース・ストレージ
  - PostgreSQL
  - Row Level Security (RLS)
  - Auth

### データベース

- **Supabase PostgreSQL**
  - `profiles` - ユーザープロフィール
  - `couples` - カップル関係
  - `couple_invitations` - 招待コード
  - `date_plans` - デートプラン
  - `plan_items` - プランアイテム
  - `plan_feedback` - フィードバック
  - `plan_templates` - テンプレート
  - **`subscription_plans`** 💰 - サブスクリプションプラン定義
  - **`user_subscriptions`** 💰 - ユーザーのサブスク状態
  - **`plan_generation_usage`** 💰 - AIプラン生成使用履歴

### AI/ML

- **Google Gemini API** ⭐ 推奨 - 無料利用枠あり
  - **Gemini 2.0 Flash** - 最推奨（思考トークン0、トークン60-75%削減）
  - 1分間15リクエスト、1日1,500リクエスト無料
  - 生成時間10-15秒（高速）
  - レート制限管理・キューイングシステム実装済み
- **OpenAI API** - 統合済み（オプション）
- **Anthropic Claude API** - 統合済み（オプション）
- **Mock AI Service** - 開発・テスト用

## 📦 セットアップ

### 前提条件

- Node.js 18以降
- npm または yarn
- Supabaseアカウント

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/coupleplan.git
cd coupleplan
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成：

```bash
touch .env.local
```

以下の環境変数を設定：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider Configuration (推奨: Gemini)
AI_PROVIDER=gemini

# Google Gemini API (推奨 - 無料利用枠あり)
# APIキーの取得: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# AI Model Configuration（最推奨設定）
AI_MODEL=gemini-2.0-flash-exp
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7

# オプション: OpenAI API
# AI_PROVIDER=openai
# AI_API_KEY=your_openai_api_key

# オプション: Anthropic Claude API
# AI_PROVIDER=anthropic
# AI_API_KEY=your_anthropic_api_key

# オプション: モック（開発・テスト用）
# AI_PROVIDER=mock
```

**Gemini APIキーの取得方法** については、[Docs/GEMINI_API_SETUP.md](Docs/GEMINI_API_SETUP.md) を参照してください。

### 4. データベースマイグレーション

Supabase Studioで以下のSQLファイルを順番に実行：

1. `supabase/migrations/create_couple_invitations.sql` - パートナー連携機能
2. `supabase/migrations/create_date_plans.sql` - デートプラン機能
3. **`supabase/migrations/create_subscription_system.sql`** 💰 - マネタイズ機能（NEW）

**重要**: マイグレーションは順番通りに実行してください。

#### マイグレーション実行手順

**エラーが出ている場合は、必ずマイグレーションを実行してください！**

```bash
# 1. Supabaseダッシュボードにアクセス
# https://supabase.com/dashboard/project/[your-project-id]

# 2. SQL Editor → New query

# 3. マイグレーションファイルの内容をコピー&ペースト
# supabase/migrations/create_subscription_system.sql

# 4. Run をクリック
```

詳細な手順とトラブルシューティング:

- **[Docs/SUBSCRIPTION_SETUP.md](Docs/SUBSCRIPTION_SETUP.md)** 🔥 セットアップガイド（5分で完了）
- [Docs/MONETIZATION_IMPLEMENTATION_GUIDE.md](Docs/MONETIZATION_IMPLEMENTATION_GUIDE.md) - 実装ガイド

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 🚀 デプロイ

### Vercel（推奨）

```bash
npm run build
vercel deploy
```

### 環境変数の設定

Vercelダッシュボードで以下を設定：

**必須:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**AI機能（推奨: Gemini）:**

- `AI_PROVIDER` = `gemini`
- `GEMINI_API_KEY` = (Google AI Studioで取得)
- `AI_MODEL` = `gemini-2.0-flash-exp` ← **最推奨**（思考トークン0）
- `AI_MAX_TOKENS` = `2000` ← トークン60-75%削減
- `AI_TEMPERATURE` = `0.7`

## 📖 使い方

### 1. アカウント作成

1. サインアップページでアカウントを作成
2. メール認証を完了
3. プロフィール情報を入力

### 2. パートナー連携

1. ダッシュボードから「パートナー連携」を選択
2. 招待コードを生成してパートナーに共有
3. パートナーがコードを入力して連携完了

### 3. デートプラン作成

1. 「AIデートプラン提案」→「プランを作成」
2. 予算、時間、場所、好みを入力
3. AIが複数のプランを生成
4. お好みのプランを選択

### 4. プランカスタマイズ

1. プラン詳細画面から「カスタマイズ」
2. プラン基本情報を編集
3. アイテムを追加・編集・削除
4. 予算と時間を自動計算で確認
5. 「プランを確定」で完了

### 5. サブスクリプション管理 💰

1. ダッシュボードで使用状況を確認
   - 今日の残り: X / 3回
   - 今月の残り: Y / 10回
2. 制限到達時は翌日または来月まで待つ
3. 「💎 無制限で使う」からPremium案内を確認（近日公開予定）

## 📁 プロジェクト構造

```
coupleplan/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── account/       # アカウント管理
│   │   │   ├── partner/       # パートナー連携
│   │   │   ├── plans/         # デートプラン管理
│   │   │   └── subscription/  💰 # サブスクリプション管理（NEW）
│   │   │       ├── check-limit/
│   │   │       ├── usage/
│   │   │       └── current/
│   │   ├── auth/              # 認証ページ
│   │   ├── dashboard/         # ダッシュボード
│   │   │   ├── plans/         # プラン管理
│   │   │   │   └── [id]/
│   │   │   │       └── customize/  # カスタマイズビュー
│   │   │   ├── profile/       # プロフィール
│   │   │   ├── partner-linkage/   # パートナー連携
│   │   │   └── subscription/  💰 # サブスク管理画面（NEW）
│   │   ├── login/             # ログイン
│   │   └── signup/            # サインアップ
│   ├── components/            # Reactコンポーネント
│   │   ├── layout/            # レイアウト（Navbar等）
│   │   ├── subscription/      💰 # サブスク関連（NEW）
│   │   │   ├── UsageLimitDisplay.tsx
│   │   │   └── LimitReachedModal.tsx
│   │   └── ui/                # UIコンポーネント
│   ├── contexts/              # Reactコンテキスト
│   ├── lib/                   # ユーティリティ
│   │   ├── supabase/          # Supabaseクライアント
│   │   ├── ai-service.ts      # AI統合（Gemini/OpenAI/Claude）
│   │   ├── rate-limiter.ts    # レート制限管理
│   │   ├── validation.ts      # バリデーション
│   │   └── plan-validation.ts # プランバリデーション
│   └── types/                 # TypeScript型定義
│       ├── subscription.ts    💰 # サブスク型定義（NEW）
│       └── database.ts        # データベース型定義
├── supabase/
│   └── migrations/            # データベースマイグレーション
│       ├── create_couple_invitations.sql
│       ├── create_date_plans.sql
│       └── create_subscription_system.sql 💰 # NEW
├── Docs/                      # ドキュメント
│   ├── 開発計画.md
│   ├── ビジネス要件定義書.md
│   ├── MONETIZATION_IMPLEMENTATION_GUIDE.md 💰 # NEW
│   ├── GEMINI_API_SETUP.md
│   ├── AI_DATE_PLAN_IMPLEMENTATION.md
│   └── UC-001_AIデートプラン提案・生成_詳細ユースケース.md
└── public/                    # 静的ファイル
```

## 🧪 テスト

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# Linting
npm run lint
```

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずIssueを開いて変更内容を議論してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

## 🎉 謝辞

このプロジェクトは以下の素晴らしいオープンソースプロジェクトを使用しています：

- Next.js
- React
- Supabase
- Tailwind CSS
- TypeScript

---

**CouplePlan** - カップルの絆を深める、新しいデート体験を 💑
