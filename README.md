## プロジェクト構成

```
coupleplan/
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
├── .env.test.local          # テスト環境変数
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

## 環境設定

このアプリケーションを動作させるには、以下の環境変数の設定が必要です。

### 必須設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の変数を設定してください：

```bash
# OpenWeatherMap API設定（天気情報取得用）
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# データベース設定
DATABASE_URL=your_database_url_here
```

### OpenWeatherMap APIキーの取得

1. [OpenWeatherMap](https://openweathermap.org/api) にアクセス
2. 無料アカウントを作成
3. API Keysページで新しいキーを生成
4. 生成されたキーを `.env.local` の `NEXT_PUBLIC_OPENWEATHER_API_KEY` に設定

### 開発サーバーの起動

環境変数を設定後、開発サーバーを再起動してください：

```bash
npm run dev
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

## テスト環境のセットアップ

テスト実行時は専用のデータベースと環境変数を使用します。

1. `.env.test.local` ファイルを作成してテスト用の秘密情報を設定：

```
# テスト環境用の非公開環境変数（GitHubにコミットしない）

# Supabase テスト環境のキー
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# テスト用のデータベース接続情報（ローカルのPostgreSQLを使用）
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/couple_plan_test

# テスト用ユーザー情報
TEST_USER_ID=test-user-id-123
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123!

# テスト用トークン情報（実際の環境では使用されない）
TEST_ACCESS_TOKEN="test-secure-token-for-testing-only"
TEST_REFRESH_TOKEN="test-secure-refresh-token-for-testing-only"
```

2. テスト用データベースを作成：

```bash
# PostgreSQLに接続
psql -U postgres

# テスト用データベース作成（存在しない場合）
CREATE DATABASE couple_plan_test;

# 終了
\q
```

3. テスト用データベースにスキーマを適用：

```bash
# テスト環境用のスキーマを適用
npx prisma db push --schema=./prisma/schema.prisma
```

4. 環境変数が正しく設定されていることを確認するテストを実行：

```bash
# 環境変数設定テストのみ実行
npx jest tests/unit/env.test.ts

# または全てのテストを実行
npm test
```

### テスト用ユーティリティ

`tests/utils/` ディレクトリにはテストに便利なユーティリティが用意されています：

- `test-constants.ts`: 環境変数から読み込んだテスト用の定数
- `test-db.ts`: テスト用データベースを操作するためのヘルパー関数
- `setup-env.js`: テスト実行前に環境変数を読み込むスクリプト

テスト内でデータベースを初期化するには、以下のように使用します：

```typescript
import { initializeTestDatabase, createTestUserProfile } from '@tests/utils/test-db';
import { TEST_USER } from '@tests/utils/test-constants';

// テスト前にデータベースを初期化
beforeAll(async () => {
  await initializeTestDatabase();
});

// テスト用プロフィールを作成
test('プロフィールの作成', async () => {
  const profile = await createTestUserProfile(TEST_USER.ID);
  expect(profile).toBeDefined();
});
```

### 安全なトークン管理

テスト内でハードコードされたアクセストークン（例: `access_token: 'test-token'`）を使用すると、セキュリティ脆弱性としてフラグが立つ可能性があります。このプロジェクトでは、以下の方法でテスト用トークンを安全に管理しています：

1. 環境変数経由でのトークン提供

   - `.env.test.local` ファイルに `TEST_ACCESS_TOKEN` を設定
   - 実際の本番環境では使用されないテスト専用のトークン

2. 動的なトークン生成

   - `test-constants.ts` ファイルで `randomUUID()` を使用して毎回異なるトークンを生成
   - トークンの予測可能性を低減

3. セッション生成ヘルパー
   - `createMockSession()` 関数を使用して一貫したセッションオブジェクトを生成
   - テスト間で一貫性を保ちながらもセキュリティを確保

テストを書く際は、固定文字列のトークンを直接コードに書かず、常に定数ファイルから提供される値を使用してください：

```typescript
// 悪い例 ❌
const mockSession = { access_token: 'test-token', user: mockUser };

// 良い例 ✅
import { createMockSession } from '@tests/utils/test-constants';
const mockSession = createMockSession(mockUser.id);
```
