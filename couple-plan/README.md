## プロジェクト構成

```
couple-plan/
├── .github/                 # GitHub関連設定
│   └── workflows/          # GitHub Actions
│       └── ci.yml          # CI設定
├── .next/                   # Next.jsのビルド出力
├── coverage/                # テストカバレッジレポート
├── prisma/                  # Prisma関連
│   ├── migrations/         # マイグレーションファイル
│   └── schema.prisma       # データベーススキーマ
├── public/                  # 静的ファイル
├── src/                     # アプリケーションコード
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # 認証関連ページ
│   │   │   ├── forgot-password/       # パスワードお忘れですか
│   │   │   ├── reset-password/      # パスワードリセット
│   │   │   ├── login/       # ログイン
│   │   │   ├── signup/      # サインアップ
│   │   │   └── verify-email/# メール確認
│   │   ├── (dashboard)/     # ダッシュボード
│   │   │   ├── layout.tsx   # ダッシュボードレイアウト
│   │   │   ├── profile/     # プロフィール
│   │   │   └── plans/       # プラン管理
│   │   │       ├── page.tsx # プラン一覧
│   │   │       ├── [id]/    # プラン詳細
│   │   │       │   └── edit/# プラン編集
│   │   │       ├── new/     # プラン作成
│   │   │       └── public/  # 公開プラン
│   │   ├── api/             # APIルート
│   │   │   ├── account/     # アカウント管理API
│   │   │   ├── auth/        # 認証API
│   │   │   │   ├── login/
│   │   │   │   ├── reset-password/
│   │   │   │   └── signup/
│   │   │   ├── plans/       # プランAPI
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── likes/
│   │   │   │   │   └── publish/
│   │   │   │   ├── public/
│   │   │   │   └── route.ts
│   │   │   └── profile/     # プロフィールAPI
│   │   │       ├── [userId]/
│   │   │       └── route.ts
│   │   ├── globals.css      # グローバルCSS
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # ホームページ
│   ├── components/          # コンポーネント
│   │   ├── ui/             # 共通UI
│   │   │   └── button.tsx  # ボタンコンポーネント
│   │   └── features/       # 機能別
│   │       ├── auth/       # 認証関連コンポーネント
│   │       ├── dashboard/  # ダッシュボード関連コンポーネント
│   │       └── plans/      # プラン関連コンポーネント
│   ├── contexts/           # コンテキスト
│   │   └── AuthContext.tsx # 認証コンテキスト
│   ├── hooks/              # カスタムフック
│   │   ├── useProfile.ts   # プロフィール関連フック
│   │   └── useRequireAuth.ts # 認証要求フック
│   ├── lib/                # ユーティリティ
│   │   ├── api/            # API関連モジュール
│   │   │   └── profile.ts  # プロフィールAPI
│   │   ├── api.ts          # APIクライアント
│   │   ├── db.ts           # Prismaクライアント
│   │   ├── supabase-auth.ts# Supabase認証
│   │   └── utils.ts        # ユーティリティ関数
│   └── types/              # 型定義
│       ├── api.ts          # API関連の型
│       ├── auth.ts         # 認証関連の型
│       ├── database.ts     # データベース関連の型
│       ├── plan.ts         # プラン関連の型
│       └── profile.ts      # プロフィール関連の型
├── tests/                   # 自動テストコード
│   ├── unit/                # ユニットテスト
│   │   ├── app/             # App Router、ページの単体テスト
│   │   ├── components/      # コンポーネントの単体テスト
│   │   ├── contexts/        # コンテキストのテスト
│   │   ├── hooks/           # カスタムフックのテスト
│   │   └── lib/             # ユーティリティ・APIクライアントのテスト
│   ├── integration/         # 統合テスト（APIエンドポイント等）
│   └── e2e/                 # エンドツーエンドテスト
├── .env                     # 環境変数
├── .env.local               # ローカル環境変数
├── .eslintrc.json           # ESLint設定
├── .gitignore               # Git除外設定
├── jest.config.js           # Jest設定
├── jest.setup.js            # Jestセットアップ
├── next.config.ts           # Next.js設定
├── package.json             # パッケージ設定
├── postcss.config.mjs       # PostCSS設定
├── tailwind.config.ts       # Tailwind CSS設定
└── tsconfig.json            # TypeScript設定
```

## テストとカバレッジ

プロジェクトには自動テストが組み込まれており、以下のコマンドで実行できます：

```bash
# 通常のテスト実行
npm test

# ウォッチモードでテスト実行（ファイル変更時に自動実行）
npm run test:watch

# カバレッジレポート付きでテスト実行
npm run test:coverage

# CI環境用のテスト実行（GitHub Actions用）
npm run test:ci
```

### 自動テスト実行

このプロジェクトでは以下のタイミングで自動的にテストが実行されます：

1. **プルリクエスト作成時**：GitHub Actionsによりテストが実行され、カバレッジレポートが生成されます
2. **Vercelへのデプロイ時**：ビルドプロセスの一部としてテストが実行されます

テストカバレッジレポートは `coverage/` ディレクトリに生成され、GitHub Actionsの実行結果からも確認できます。 