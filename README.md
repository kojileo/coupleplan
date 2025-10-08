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
- ✅ AI生成機能（モック実装）
- ✅ プラン提案画面（複数候補から選択）
- ✅ プラン詳細表示
- ✅ **カスタマイズビュー** - プラン編集機能
  - プラン基本情報の編集
  - プランアイテムの追加・編集・削除
  - 予算・時間の自動計算
  - プラン確定機能（ステータス管理）
- ✅ プラン一覧・検索
- ✅ カップル専用プラン管理

#### 5. **UI/UX**

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
- 🚧 **実AI API連携** - OpenAI/Anthropic Claude

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

### AI/ML

- **Mock AI Service** - 現在はモック実装
- **OpenAI API** - 将来的に統合予定
- **Anthropic Claude API** - 将来的に統合予定

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

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

以下の環境変数を設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_database_url

# AI (Optional - 現在はモック)
AI_PROVIDER=mock
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 4. データベースマイグレーション

Supabase Studioで以下のSQLファイルを実行：

1. `supabase/migrations/create_couple_invitations.sql`
2. `supabase/migrations/create_date_plans.sql`

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

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

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

## 📁 プロジェクト構造

```
coupleplan/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── account/       # アカウント管理
│   │   │   ├── partner/       # パートナー連携
│   │   │   └── plans/         # デートプラン管理
│   │   ├── auth/              # 認証ページ
│   │   ├── dashboard/         # ダッシュボード
│   │   │   ├── plans/         # プラン管理
│   │   │   │   └── [id]/
│   │   │   │       └── customize/  # カスタマイズビュー
│   │   │   ├── profile/       # プロフィール
│   │   │   └── partner-linkage/   # パートナー連携
│   │   ├── login/             # ログイン
│   │   └── signup/            # サインアップ
│   ├── components/            # Reactコンポーネント
│   │   ├── layout/            # レイアウト（Navbar等）
│   │   └── ui/                # UIコンポーネント
│   ├── contexts/              # Reactコンテキスト
│   ├── lib/                   # ユーティリティ
│   │   ├── supabase/          # Supabaseクライアント
│   │   ├── ai-service.ts      # AI統合
│   │   ├── validation.ts      # バリデーション
│   │   └── plan-validation.ts # プランバリデーション
│   └── types/                 # TypeScript型定義
├── supabase/
│   └── migrations/            # データベースマイグレーション
├── Docs/                      # ドキュメント
│   ├── 開発計画.md
│   ├── UC-001_AIデートプラン提案・生成_詳細ユースケース.md
│   └── AI_DATE_PLAN_IMPLEMENTATION.md
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
