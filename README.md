# Couple Plan

カップル向けのデートプラン共有アプリケーション

## プロジェクト構成

```
couple-plan/
├── prisma/                  # Prisma関連
│   ├── migrations/         # マイグレーションファイル
│   └── schema.prisma       # データベーススキーマ
├── public/                  # 静的ファイル
├── src/                     # アプリケーションコード
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # 認証関連ページ
│   │   │   ├── login/       # ログイン
│   │   │   ├── signup/      # サインアップ
│   │   │   └── verify-email/# メール確認
│   │   ├── (dashboard)/     # ダッシュボード
│   │   │   ├── profile/     # プロフィール
│   │   │   └── plans/       # プラン管理
│   │   │       ├── [id]/    # プラン詳細
│   │   │       │   └── edit/
│   │   │       ├── new/     # プラン作成
│   │   │       └── public/  # プラン公開
│   │   ├── api/             # APIルート
│   │   │   ├── actions/     
│   │   │   ├── auth/        # 認証API
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── reset-password/
│   │   │   ├── plans/       # プランAPI
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── likes/
│   │   │   │   │   └── publish/
│   │   │   │   ├── public/
│   │   │   │   └── route.ts
│   │   │   └── profile/     # プロフィールAPI
│   │   │       ├── [userId]/
│   │   │       └── route.ts
│   │   └── layout.tsx       # ルートレイアウト
│   ├── components/          # コンポーネント
│   │   ├── ui/             # 共通UI
│   │   └── features/       # 機能別
│   │       ├── auth/       # 認証関連
│   │       ├── plans/      # プラン関連
│   │       └── dashboard/  # ダッシュボード関連
│   ├── contexts/           # コンテキスト
│   │   └── AuthContext.tsx
│   ├── hooks/              # カスタムフック
│   │   ├── useRequireAuth.ts
│   │   └── usePlans.ts
│   ├── lib/                # ユーティリティ
│   │   ├── api.ts          # APIクライアント
│   │   ├── db.ts           # Prismaクライアント
│   │   ├── supabase-auth.ts# Supabase認証
│   │   └── utils.ts        # ユーティリティ
│   └── types/              # 型定義
│       ├── api.ts
│       ├── auth.ts
│       ├── database.ts
│       ├── plan.ts
│       └── profile.ts
├── tests/                   # 自動テストコード
│   ├── unit/                # ユニットテスト
│   │   ├── app/             # App Router、ページの単体テスト
│   │   ├── components/      # コンポーネントの単体テスト
│   │   ├── contexts/        # コンテキストのテスト
│   │   ├── hooks/           # カスタムフックのテスト
│   │   └── lib/             # ユーティリティ・APIクライアントのテスト
│   ├── integration/         # 統合テスト（APIエンドポイント等）
│   │   └── api/             # APIルートのテストケース
│   └── e2e/                 # エンドツーエンドテスト（Cypress/Playwrightなど）
├── .env                     # 環境変数
├── .eslintrc.json           # ESLint設定
├── .gitignore               # Git除外設定
├── next.config.js           # Next.js設定
├── package.json             # パッケージ設定
├── postcss.config.js        # PostCSS設定
├── tailwind.config.js       # Tailwind CSS設定
└── tsconfig.json            # TypeScript設定
```

## セットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/couple-plan.git
cd couple-plan
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 環境変数の設定
`.env`ファイルを作成:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"
```

4. データベースのセットアップ
```bash
npx prisma generate
npx prisma db push
```

5. 開発サーバーの起動
```bash
npm run dev
```