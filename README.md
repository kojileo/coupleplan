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
├── app/                 # Next.js 13 App Router
│   ├── (auth)/         # 認証関連ページ
│   ├── (dashboard)/    # ダッシュボード関連ページ
│   ├── api/            # APIルート
│   └── layout.tsx      # ルートレイアウト
├── components/         # Reactコンポーネント
│   ├── ui/            # 共通UIコンポーネント
│   └── features/      # 機能別コンポーネント
├── lib/               # ユーティリティ関数
├── hooks/             # カスタムフック
├── prisma/            # Prismaスキーマ・マイグレーション
└── types/             # TypeScript型定義
```

## コントリビューション

1. タスクの作成
2. ブランチの作成 (`feature/xx` or `fix/xx`)
3. 変更の実装
4. テストの実行
5. プルリクエストの作成
