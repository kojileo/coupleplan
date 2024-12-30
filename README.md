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

1. リポジトリのクローン
```bash
git clone <repository-url>
cd couple-plan
```

2. 依存関係のインストール
```bash
npm install
```

3. ローカルデータベースの準備
- PostgreSQLをインストール（未インストールの場合）
- データベースの作成
```sql
CREATE DATABASE coupleplan;
```

4. 環境変数の設定
`.env`ファイルを作成し、以下の環境変数を設定:


5. Prismaの設定
```bash
# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーションの実行
npx prisma migrate dev
```

6. Supabaseプロジェクトの設定
- Supabaseでプロジェクトを作成
- Authentication > Providersから「Email」を有効化
- プロジェクトのURLとAnon Keyを`.env`ファイルに設定

7. 開発サーバーの起動
```bash
npm run dev
```


## 動作確認手順

1. ユーザー登録・ログインの確認
- `/signup`にアクセスして新規ユーザーを作成
- 作成したアカウントで`/login`からログイン
- ダッシュボードにリダイレクトされることを確認

2. プラン管理機能の確認
- 「新規プラン作成」からプランを作成
- プラン一覧での表示を確認
- プラン詳細画面での表示・編集・削除を確認

3. プラン共有機能の確認
- プラン詳細画面から「共有」ボタンをクリック
- 共有したいユーザーのメールアドレスを入力
- 招待メールの送信を確認（開発環境では実際のメール送信は無効）

## トラブルシューティング

1. データベース接続エラー
- PostgreSQLサービスが起動していることを確認
- `.env`の接続情報が正しいことを確認
```bash
# PostgreSQLサービスの状態確認
sudo service postgresql status
```

2. Supabase認証エラー
- Supabaseプロジェクトの設定を確認
- `.env`のSupabase URLとAnon Keyが正しいことを確認
- ブラウザのコンソールでエラーメッセージを確認

3. Prismaエラー
```bash
# Prismaクライアントの再生成
npx prisma generate

# データベーススキーマの同期確認
npx prisma db push
```

## プロジェクト構成

```
src/
├── app/                # Next.js App Router
│   ├── page.tsx       # ランディングページ
│   ├── (auth)/        # 認証関連ページ
│   │   ├── login/     # ログインページ
│   │   │   └── page.tsx  # ログインフォーム
│   │   └── signup/    # サインアップページ
│   │       └── page.tsx  # サインアップフォーム
│   ├── (dashboard)/   # ダッシュボード関連ページ
│   │   ├── layout.tsx # ダッシュボードレイアウト
│   │   └── plans/     # プラン一覧・詳細
│   │       ├── page.tsx  # プラン一覧ページ
│   │       ├── [id]/    # プラン詳細ページ
│   │       │   ├── page.tsx
│   │       │   └── edit/  # プラン編集ページ
│   │       │       └── page.tsx
│   │       └── new/      # 新規プラン作成
│   │           └── page.tsx  # プラン作成フォーム
├── components/        # コンポーネント
│   ├── features/     # 機能別コンポーネント
│   │   ├── auth/     # 認証関連コンポーネント
│   │   └── plans/    # プラン関連コンポーネント
│   │       └── ShareDialog.tsx  # 共有ダイアログ
├── types/           # 型定義
│   ├── auth.ts      # 認証関連の型定義
│   ├── plan.ts      # プラン関連の型定義
│   └── share.ts     # 共有関連の型定義
├── components/        # コンポーネント
│   ├── ui/           # 共通UIコンポーネント
│   │   └── button.tsx  # ボタンコンポーネント
│   ├── features/     # 機能別コンポーネント
│   │   ├── auth/     # 認証関連コンポーネント
│   │   │   └── AuthGuard.tsx
│   │   └── dashboard/ # ダッシュボード関連コンポーネント
│   │       └── Navbar.tsx
│   └── ui/           # 共通UIコンポーネント
├── contexts/         # Reactコンテキスト
│   └── AuthContext.tsx  # 認証状態管理
├── hooks/            # カスタムフック
│   └── useRequireAuth.ts  # 認証要求フック
├── lib/              # ユーティリティ関数
│   ├── supabase.ts  # Supabase クライアント
│   └── utils.ts     # 汎用ユーティリティ関数
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
- 認証ガード
  - 保護されたルートの実装
  - ローディング状態の表示
  - 未認証時のリダイレクト
- ダッシュボード
  - 基本レイアウト
  - ログアウト機能
  - ユーザー情報の表示

### ダッシュボード
- ナビゲーションバー
  - レスポンシブデザイン
  - アプリケーションロゴ
  - メインナビゲーション（プラン一覧、新規プラン、設定）
  - ユーザー情報表示
  - ログアウト機能

### プラン管理機能
- プラン一覧表示
  - グリッドレイアウト
  - プランカードの表示（タイトル、説明、日付、予算、場所）
  - 新規プラン作成へのリンク
  - ローディング状態の表示
  - プラン未作成時の案内表示
  - レスポンシブデザイン
- プラン共有機能
  - メールアドレスによる共有招待
  - 共有ダイアログ
  - 招待状態の管理
