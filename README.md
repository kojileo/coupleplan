# Couple Plan - カップル向けデートプラン管理アプリ

## 概要

Couple Planは、カップルのためのデートプラン管理アプリケーションです。行きたい場所の作成・保存・管理と予算管理を行うことができます。

## 主な機能

- 👥 カップルのための共同アカウント作成・管理
- 📍 行きたい場所の作成・保存・管理
- 💰 予算管理

## 技術スタック

- **フロントエンド**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - React Hook Form
  - Zod

- **バックエンド**
  - Supabase (認証・データベース)
  - Prisma (ORM)
  - PostgreSQL

- **インフラ**
  - Vercel (ホスティング)

## 開発環境のセットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
`.env.local`ファイルを作成し、必要な環境変数を設定:
```
DATABASE_URL="your-database-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

3. データベースのマイグレーション
```bash
npx prisma migrate dev
```

4. 開発サーバーの起動
```bash
npm run dev
```

## プロジェクト構成

```
src/
├── app/                # Next.js App Router
│   ├── (auth)/        # 認証関連ページ
│   │   ├── login/     # ログインページ
│   │   │   └── page.tsx  # ログインフォーム
│   │   └── signup/    # サインアップページ
│   │       └── page.tsx  # サインアップフォーム
│   ├── (dashboard)/   # ダッシュボード関連ページ
│   │   ├── plans/     # プラン一覧・詳細
│   │   └── settings/  # 設定ページ
│   ├── api/          # APIエンドポイント
│   └── layout.tsx    # ルートレイアウト
├── components/        # コンポーネント
│   ├── ui/           # 共通UIコンポーネント
│   │   └── button.tsx  # ボタンコンポーネント
│   └── features/     # 機能別コンポーネント
├── contexts/         # Reactコンテキスト
│   └── AuthContext.tsx  # 認証状態管理
├── hooks/            # カスタムフック
│   └── useRequireAuth.ts  # 認証要求フック
├── lib/              # ユーティリティ関数
│   ├── supabase.ts  # Supabase クライアント
│   └── utils.ts     # 汎用ユーティリティ関数
├── types/           # 型定義
│   └── auth.ts      # 認証関連の型定義
└── styles/          # グローバルスタイル
```

## セットアップ手順

1. プロジェクトの作成
```bash
npx create-next-app@latest couple-plan --typescript --tailwind --eslint
cd couple-plan
```

2. 必要なパッケージのインストール
```bash
npm install @prisma/client @supabase/supabase-js @hookform/resolvers zod
npm install -D prisma @types/node
```

3. 環境変数の設定
`.env.local`ファイルを作成:
```
DATABASE_URL="your-database-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## 開発ガイドライン

### コーディング規約
- コンポーネントは機能単位で分割
- TypeScriptの型定義を徹底
- Tailwind CSSによるスタイリング
- モバイルファーストアプローチ

### ブランチ戦略
- main: プロダクション用
- develop: 開発用メインブランチ
- feature/*: 機能開発用
- fix/*: バグ修正用

## コントリビューション

1. タスクの作成
2. ブランチの作成 (`feature/xx` or `fix/xx`)
3. 変更の実装
4. テストの実行
5. プルリクエストの作成

## 実装済み機能

### 共通機能
- ユーティリティ関数
  - `cn`: Tailwind CSSのクラス名を結合するヘルパー関数

### 認証機能
- Supabaseを使用した認証クライアントの設定
- ログインページの実装
  - メールアドレス/パスワードによるログイン
  - レスポンシブデザイン対応
- サインアップページの実装
  - 名前、メールアドレス、パスワードによる新規登録
  - 確認メール送信機能
  - ログインページへのリンク
- 認証状態管理
  - グローバルな認証状態の管理（AuthContext）
  - 認証状態の永続化
  - 認証要求フック（useRequireAuth）
- 共通UIコンポーネント
  - Button: バリアント（primary/secondary/outline）とサイズ（sm/md/lg）に対応
