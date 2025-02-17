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
│   │   └── useRequireAuth.ts
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
├── jest.config.js           # Next.js 用の Jest 設定
├── jest.setup.js            # Jest の設定
├── babel.config.js          # Babel の設定
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

## 統合テストの実装

本プロジェクトでは、以下の２種類の統合テストを想定しています。

### 1. API 統合テスト（サーバーサイド）
- **目的:** API エンドポイントが意図通りのレスポンスを返すか検証する  
- **推奨ツール:** [supertest](https://github.com/visionmedia/supertest)  
- **手順:**
  1. **環境設定:** テスト実行用に専用の環境変数ファイル（例：`.env.test`）を用意し、テスト用データベースや Supabase の設定を行う。
  2. **パッケージインストール:**  
     ```bash
     npm install --save-dev supertest
     ```
  3. **テストディレクトリ:** `tests/integration/api/` 以下に各 API の統合テストを作成する。
  4. **テスト例:**  
     以下は、Next.js の API ルートに対して Supertest を使ってテストを行う例です。
  
     ```typescript
     // tests/integration/api/auth-login.test.ts
     import request from 'supertest'
     import { createServer } from 'http'
     import next from 'next'

     const dev = process.env.NODE_ENV !== 'production'
     const app = next({ dev })
     const handle = app.getRequestHandler()

     let server: any

     beforeAll(async () => {
       await app.prepare()
       server = createServer((req, res) => handle(req, res)).listen(3001)
     })

     afterAll(() => {
       server.close()
     })

     describe('POST /api/auth/login', () => {
       it('正しい認証情報なら 200 を返す', async () => {
         const response = await request(server)
           .post('/api/auth/login')
           .send({ email: 'test@example.com', password: 'password123' })
         expect(response.status).toBe(200)
         // 必要に応じて response.body の内容も検証
       })
     })
     ```

### 2. E2E/UI 統合テスト（フロントエンド）
- **目的:** 実際のブラウザ上でアプリの画面遷移・操作が期待通りに動作するか検証する  
- **推奨ツール:** [Cypress](https://www.cypress.io/)  
- **手順:**
  1. **パッケージインストール:**
     ```bash
     npm install --save-dev cypress
     ```
  2. **ディレクトリ構成:** `cypress/` 以下にテストを配置（例：`cypress/integration/`）  
  3. **設定ファイル:** プロジェクトルートに `cypress.config.js` を作成し、baseUrl 等の共通設定を行う。
  
     ```javascript
     // cypress.config.js
     module.exports = {
       e2e: {
         baseUrl: 'http://localhost:3000',
         specPattern: 'cypress/integration/**/*.spec.{js,jsx,ts,tsx}',
       },
     }
     ```
  
  4. **テスト例:**  
     ログインフローを検証するサンプルテストです。
  
     ```javascript
     // cypress/integration/auth.spec.js
     describe('ログインフロー', () => {
       it('ログインするとマイプラン一覧ページへ遷移する', () => {
         cy.visit('/login')
         cy.get('input[name="email"]').type('test@example.com')
         cy.get('input[name="password"]').type('password123')
         cy.get('button').contains('ログイン').click()
         cy.url().should('include', '/plans')
         cy.contains('ログアウト')
       })
     })
     ```

## テスト実行方法

### ローカルでの実行
- **API 統合テスト:**  
  実行例（パッケージに Jest の設定などが済んでいれば）
  ```bash
  npm run integration:test
  ```
  
- **Cypress を利用した UI テスト:**  
  UI で確認する場合は:
  ```bash
  npm run cypress:open
  ```
  ヘッドレス実行する場合は:
  ```bash
  npm run cypress:run
  ```

### CI/CD での実行例
GitHub Actions などの CI 環境では、テスト実行前にテスト環境のセットアップ（マイグレーション、シード実行など）を行い、次のようなジョブを設定します。

```yaml
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 16
      - name: Install dependencies
        run: npm ci
      - name: Reset test database
        run: npx prisma migrate reset --force --schema=prisma/schema.prisma
      - name: Build application
        run: npm run build
      - name: Start application
        run: npm start &
      - name: Run Cypress tests
        run: npm run cypress:run
```

## まとめ

- **環境分離:** テスト専用の環境変数とデータベース設定を用意し、本番環境と影響が出ないようにします。  
- **ツール選定:** API 統合テストには Supertest、UI テストには Cypress を利用。  
- **ディレクトリ区分:** 統合テスト用のファイルは `tests/integration/` や `cypress/` に分けます。  
- **CI/CD の組み込み:** テスト実行前に適切な環境セットアップを実施し、自動テストのジョブを構成します。

以上の手順に従い、Couple Plan プロジェクトの統合テストを実現してください。