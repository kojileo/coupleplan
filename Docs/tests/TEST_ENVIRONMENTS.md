# CouplePlan テスト環境設定ガイド

## ドキュメント情報

- **作成日**: 2025年10月11日
- **バージョン**: 1.0.0
- **親ドキュメント**: [TEST_PLAN.md](../TEST_PLAN.md)

---

## 目次

1. [環境概要](#1-環境概要)
2. [ローカル環境セットアップ](#2-ローカル環境セットアップ)
3. [CI環境セットアップ](#3-ci環境セットアップ)
4. [Staging環境セットアップ](#4-staging環境セットアップ)
5. [テストデータ管理](#5-テストデータ管理)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. 環境概要

### 1.1 環境一覧

| 環境           | 用途            | URL                                      | データベース        | CI/CD |
| -------------- | --------------- | ---------------------------------------- | ------------------- | ----- |
| **Local**      | 開発・デバッグ  | http://localhost:3000                    | Local Supabase      | -     |
| **CI**         | 自動テスト      | GitHub Actions                           | Test DB (ephemeral) | ✅    |
| **Staging**    | 統合・E2Eテスト | https://staging-coupleplan-xxx.a.run.app | Staging DB          | ✅    |
| **Production** | 本番環境        | https://coupleplan-xxx.a.run.app         | Production DB       | ✅    |

### 1.2 環境別の特徴

#### Local環境

**特徴**:

- 開発者のローカルマシンで実行
- 高速なフィードバックサイクル
- デバッグが容易
- オフラインでも動作可能

**用途**:

- 単体テスト
- 統合テスト（一部）
- 機能開発
- デバッグ

#### CI環境

**特徴**:

- GitHub Actionsで自動実行
- Ephemeralデータベース（テスト毎に作成・削除）
- 完全自動化
- PRごとに実行

**用途**:

- 全自動テスト（Unit, Integration, E2E）
- Lint / Type Check
- カバレッジレポート

#### Staging環境

**特徴**:

- 本番と同等の構成
- Vercel Preview Deployment
- 永続的なテストデータ
- 本番デプロイ前の最終検証

**用途**:

- E2Eテスト
- 統合テスト
- 手動探索的テスト
- UAT（ユーザー受け入れテスト）

#### Production環境

**特徴**:

- 実ユーザーが使用
- 高可用性
- モニタリング常時稼働

**テストポリシー**:

- ⚠️ 読み取り専用テストのみ
- ❌ データ変更を伴うテスト禁止
- ✅ モニタリング・ヘルスチェック

---

## 2. ローカル環境セットアップ

### 2.1 前提条件

- **Node.js**: v18.x以上
- **npm**: v9.x以上
- **Git**: v2.x以上
- **OS**: Windows / macOS / Linux

### 2.2 セットアップ手順

#### Step 1: リポジトリのクローン

```bash
git clone https://github.com/your-org/coupleplan.git
cd coupleplan
```

#### Step 2: 依存関係のインストール

```bash
npm install
```

#### Step 3: 環境変数の設定

```bash
# .env.localファイルを作成
cp .env.local.example .env.local
```

`.env.local`を編集:

```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini AI
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-2.5-flash-lite
AI_MAX_TOKENS=3000

# Test Environment
NODE_ENV=development
```

#### Step 4: Supabase設定

**Option A: Supabaseクラウドを使用**

1. [Supabase](https://supabase.com/)でプロジェクト作成
2. Project Settings → API → Project URL, anon key をコピー
3. `.env.local`に貼り付け

**Option B: Supabaseローカル（将来対応）**

```bash
# Supabase CLIインストール
npm install -g supabase

# ローカルSupabase起動
supabase start

# マイグレーション実行
supabase db push
```

#### Step 5: データベースマイグレーション

```bash
# Supabase SQL Editorで以下を実行:
# - supabase/migrations/create_date_plans.sql
# - supabase/migrations/create_couple_invitations.sql
# - supabase/migrations/create_subscription_system.sql
```

または、セットアップスクリプト使用:

```bash
npm run db:setup
```

#### Step 6: テストデータの投入

```bash
npm run seed:local
```

#### Step 7: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスして動作確認。

### 2.3 ローカルテスト実行

#### 単体テスト

```bash
# 全単体テスト実行
npm run test:unit

# ウォッチモード
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

#### 統合テスト

```bash
# 統合テスト実行
npm run test:integration

# MSWサーバーが自動起動
```

#### E2Eテスト（ローカル）

```bash
# Playwrightブラウザインストール（初回のみ）
npx playwright install --with-deps

# E2Eテスト実行
npm run test:e2e

# ヘッドレスモード解除（ブラウザ表示）
npm run test:e2e:headed

# デバッグモード
npm run test:e2e:debug

# UIモード（インタラクティブ）
npm run test:e2e:ui
```

### 2.4 ローカル環境のトラブルシューティング

#### 問題1: `npm install`が失敗する

**原因**: Node.jsバージョン不一致

**解決策**:

```bash
# Node.jsバージョン確認
node -v

# v18以上であることを確認
# nvmを使用している場合
nvm install 18
nvm use 18
```

#### 問題2: Supabase接続エラー

**原因**: 環境変数の設定ミス

**解決策**:

```bash
# .env.localの確認
cat .env.local

# URLとKeyが正しいか確認
# Supabase Project Settings → API で再確認
```

#### 問題3: テストがタイムアウトする

**原因**: ローカル環境のリソース不足

**解決策**:

```bash
# Jestタイムアウト延長
# jest.config.js
testTimeout: 20000, // 20秒に延長
```

---

## 3. CI環境セットアップ

### 3.1 GitHub Actionsワークフロー

#### ファイル構成

```
.github/
└── workflows/
    ├── pr-test.yml      # PRトリガー
    ├── main-test.yml    # mainマージトリガー
    └── nightly.yml      # 定期実行
```

#### PR Test ワークフロー

`.github/workflows/pr-test.yml`:

```yaml
name: PR Test

on:
  pull_request:
    branches: [main, develop]

env:
  NODE_ENV: test
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
  GEMINI_API_KEY: ${{ secrets.TEST_GEMINI_API_KEY }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npx tsc --noEmit

  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit
          fail_ci_if_error: false

  integration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration
```

#### Main Test ワークフロー

`.github/workflows/main-test.yml`:

```yaml
name: Main Test & Deploy

on:
  push:
    branches: [main]

env:
  NODE_ENV: test
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
  GEMINI_API_KEY: ${{ secrets.TEST_GEMINI_API_KEY }}
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: coupleplan-staging
  REGION: asia-northeast1

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run all tests
        run: |
          npm run lint
          npx tsc --noEmit
          npm run test:unit
          npm run test:integration

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  build-and-deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Configure Docker for GCR
        run: gcloud auth configure-docker

      - name: Build Docker image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_SUPABASE_URL=${{ secrets.STAGING_SUPABASE_URL }} \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.STAGING_SUPABASE_ANON_KEY }} \
            -t gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA \
            -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
            .

      - name: Push to Container Registry
        run: |
          docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA
          docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: ${{ env.SERVICE_NAME }}
          region: ${{ env.REGION }}
          image: gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
          flags: '--allow-unauthenticated --max-instances=10 --memory=512Mi --cpu=1'
          secrets: |
            SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest
            GEMINI_API_KEY=GEMINI_API_KEY:latest

      - name: Get Cloud Run URL
        run: |
          SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
          echo "Deployed to: $SERVICE_URL"
```

#### Nightly Test ワークフロー

`.github/workflows/nightly.yml`:

```yaml
name: Nightly Tests

on:
  schedule:
    - cron: '0 15 * * *' # 毎日0時JST（15時UTC）

env:
  NODE_ENV: test
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
  GEMINI_API_KEY: ${{ secrets.TEST_GEMINI_API_KEY }}

jobs:
  e2e-full:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: npm run test:e2e -- --project=${{ matrix.browser }} --shard=${{ matrix.shard }}/3

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.browser }}-${{ matrix.shard }}
          path: playwright-report/

  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging-coupleplan-xxx.a.run.app
            https://staging-coupleplan-xxx.a.run.app/dashboard
          uploadArtifacts: true
```

### 3.2 GitHub Secrets設定

GitHub Repository → Settings → Secrets and variables → Actions で以下を設定:

| Secret名                         | 説明                              |
| -------------------------------- | --------------------------------- |
| `TEST_SUPABASE_URL`              | テスト用SupabaseプロジェクトURL   |
| `TEST_SUPABASE_ANON_KEY`         | テスト用Supabase Anon Key         |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | テスト用Supabase Service Role Key |
| `TEST_GEMINI_API_KEY`            | テスト用Gemini API Key            |
| `GCP_SA_KEY`                     | GCPサービスアカウントキー（JSON） |
| `GCP_PROJECT_ID`                 | Google Cloud Project ID           |
| `STAGING_SUPABASE_URL`           | Staging用Supabase URL             |
| `STAGING_SUPABASE_ANON_KEY`      | Staging用Supabase Anon Key        |

### 3.3 CI環境のトラブルシューティング

#### 問題1: GitHub Actionsがタイムアウトする

**原因**: テスト実行時間が長すぎる

**解決策**:

```yaml
# タイムアウト延長
jobs:
  test:
    timeout-minutes: 30 # デフォルト: 360分
```

#### 問題2: E2Eテストがフレークする

**原因**: CI環境でのネットワーク遅延

**解決策**:

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  timeout: 30000,
});
```

---

## 4. Staging環境セットアップ

### 4.1 Google Cloud Run設定

#### プロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/)にログイン
2. 新規プロジェクト作成（既存プロジェクトを使用する場合はスキップ）
3. 必要なAPIを有効化:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

#### サービスアカウント作成

```bash
# サービスアカウント作成
gcloud iam service-accounts create coupleplan-deployer \
  --display-name="CouplePlan Deployer"

# 必要な権限を付与
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:coupleplan-deployer@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:coupleplan-deployer@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:coupleplan-deployer@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# キーを生成（JSON）
gcloud iam service-accounts keys create key.json \
  --iam-account=coupleplan-deployer@PROJECT_ID.iam.gserviceaccount.com

# GitHub Secretsに登録（key.jsonの内容をコピー）
```

#### Secret Managerで環境変数管理

```bash
# シークレット作成
echo -n "your_supabase_url" | gcloud secrets create SUPABASE_URL --data-file=-
echo -n "your_supabase_anon_key" | gcloud secrets create SUPABASE_ANON_KEY --data-file=-
echo -n "your_supabase_service_role_key" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
echo -n "your_gemini_api_key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# サービスアカウントにシークレットアクセス権限を付与
for secret in SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY GEMINI_API_KEY; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:coupleplan-deployer@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

#### Dockerfile設定

プロジェクトルートの`Dockerfile`を確認・更新:

```dockerfile
# Multi-stage build for optimized image size
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for build-time env vars
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Cloud Run デプロイ設定

```bash
# 手動デプロイ（初回）
gcloud run deploy coupleplan-staging \
  --image gcr.io/PROJECT_ID/coupleplan:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets="SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co,NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx,NODE_ENV=staging" \
  --max-instances=10 \
  --min-instances=0 \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300s \
  --concurrency=80
```

### 4.2 Staging Supabase設定

#### プロジェクト作成

1. Supabaseで新規プロジェクト作成（Staging用）
2. 本番と同じマイグレーションを実行
3. RLSポリシーを設定

#### データリセットスクリプト

`scripts/reset-staging.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.STAGING_SUPABASE_URL!,
  process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY!
);

async function resetStagingData() {
  console.log('🔄 Resetting staging data...');

  // テストデータ削除
  await supabase.from('date_plans').delete().neq('id', '');
  await supabase.from('plan_generation_usage').delete().neq('id', '');
  await supabase.from('user_subscriptions').delete().neq('id', '');

  // テストユーザー作成
  // ...

  console.log('✅ Staging data reset complete');
}

resetStagingData();
```

実行:

```bash
npm run staging:reset
```

#### Cron設定（毎日リセット）

GitHub Actions Cron:

```yaml
# .github/workflows/staging-reset.yml
name: Reset Staging Data

on:
  schedule:
    - cron: '0 15 * * *' # 毎日0時JST

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Reset staging data
        env:
          STAGING_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          STAGING_SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.STAGING_SUPABASE_SERVICE_ROLE_KEY }}
        run: npm run staging:reset
```

### 4.3 Staging E2Eテスト実行

```bash
# Staging環境に対してE2Eテスト実行
BASE_URL=https://staging-coupleplan-xxx.a.run.app npm run test:e2e
```

### 4.4 Cloud Run固有のテスト

#### コールドスタートテスト

```bash
# コールドスタートをシミュレート
gcloud run services update coupleplan-staging --region=asia-northeast1 --min-instances=0

# 待機（インスタンスがゼロになるまで）
sleep 60

# リクエスト送信して起動時間を測定
time curl https://staging-coupleplan-xxx.a.run.app/

# 目標: < 5秒
```

#### コンテナヘルスチェック

```bash
# ヘルスチェックエンドポイントテスト
curl https://staging-coupleplan-xxx.a.run.app/api/health

# 期待レスポンス
# { "status": "ok", "timestamp": "2025-10-11T..." }
```

#### スケーリングテスト

```bash
# 負荷テストでスケーリング確認
npx artillery quick --count 100 --num 10 https://staging-coupleplan-xxx.a.run.app/

# Cloud Consoleでインスタンス数の増減を確認
gcloud run services describe coupleplan-staging --region=asia-northeast1 --format="value(status.conditions)"
```

---

## 5. テストデータ管理

### 5.1 シードデータ

#### ユーザーデータ

`scripts/seed/users.ts`:

```typescript
import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';

export async function seedUsers(supabase: any) {
  const users = [
    {
      email: 'test@example.com',
      password: 'Test1234!',
      name: 'テストユーザー',
    },
    {
      email: 'premium@example.com',
      password: 'Premium1234!',
      name: 'プレミアムユーザー',
    },
  ];

  for (const user of users) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (!error) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name: user.name,
        email: user.email,
      });
    }
  }

  console.log(`✅ Seeded ${users.length} users`);
}
```

#### プランデータ

`scripts/seed/plans.ts`:

```typescript
export async function seedPlans(supabase: any, userId: string) {
  const plans = [
    {
      user_id: userId,
      title: '東京デートプラン',
      budget: 10000,
      area: 'tokyo',
      status: 'draft',
    },
    // ...
  ];

  const { data, error } = await supabase.from('date_plans').insert(plans);

  console.log(`✅ Seeded ${plans.length} plans`);
}
```

#### メインシードスクリプト

`scripts/seed.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { seedUsers } from './seed/users';
import { seedPlans } from './seed/plans';

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🌱 Starting seeding...');

  await seedUsers(supabase);
  // await seedPlans(supabase, userId);
  // await seedCouples(supabase);

  console.log('✅ Seeding complete!');
}

main();
```

### 5.2 テストデータ生成

#### Faker.jsによる動的生成

```typescript
// tests/helpers/generators.ts
import { faker } from '@faker-js/faker';

export function generateTestUser() {
  return {
    email: faker.internet.email(),
    password: 'Test1234!',
    name: faker.person.fullName(),
    birthday: faker.date.birthdate({ min: 18, max: 40, mode: 'age' }),
    location: faker.location.city(),
  };
}

export function generateTestPlan() {
  return {
    title: faker.lorem.words(3),
    budget: faker.number.int({ min: 3000, max: 20000 }),
    area: faker.helpers.arrayElement(['tokyo', 'osaka', 'kyoto', 'fukuoka']),
    preferences: faker.helpers.arrayElements(['restaurant', 'movie', 'cafe', 'park', 'museum'], {
      min: 1,
      max: 3,
    }),
  };
}
```

使用例:

```typescript
// tests/integration/plans.test.ts
import { generateTestUser, generateTestPlan } from '../helpers/generators';

describe('Plans API', () => {
  it('should create plan', async () => {
    const user = generateTestUser();
    const plan = generateTestPlan();

    // テストロジック
  });
});
```

### 5.3 データクリーンアップ

#### テスト後のクリーンアップ

```typescript
// tests/helpers/cleanup.ts
import { createClient } from '@supabase/supabase-js';

export async function cleanupTestData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // テストユーザーの削除
  await supabase.from('profiles').delete().like('email', '%@example.com');

  // テストプランの削除
  await supabase.from('date_plans').delete().like('title', 'Test%');

  console.log('✅ Test data cleaned up');
}
```

#### Jest Global Teardown

```typescript
// jest.teardown.ts
import { cleanupTestData } from './tests/helpers/cleanup';

export default async function globalTeardown() {
  await cleanupTestData();
}
```

```javascript
// jest.config.js
module.exports = {
  globalTeardown: './jest.teardown.ts',
};
```

---

## 6. トラブルシューティング

### 6.1 よくある問題と解決策

#### 問題1: Supabase接続エラー

**症状**:

```
Error: Invalid Supabase URL
```

**原因**: 環境変数の設定ミス

**解決策**:

```bash
# 環境変数を確認
echo $NEXT_PUBLIC_SUPABASE_URL

# .env.localを再確認
cat .env.local

# Supabase Project Settings → API で正しいURLを取得
```

#### 問題2: テストがランダムに失敗する（フレーク）

**症状**:

```
TimeoutError: waiting for selector ".plan-card" failed
```

**原因**: 明示的待機の不足

**解決策**:

```typescript
// ❌ Bad
await page.click('button');
await page.waitForTimeout(5000);

// ✅ Good
await page.click('button');
await page.waitForSelector('.result', { state: 'visible' });
```

#### 問題3: CI/CDでのみテストが失敗

**症状**: ローカルではPass、CIではFail

**原因**: 環境差異（タイムゾーン、リソース）

**解決策**:

```typescript
// タイムゾーンを明示
process.env.TZ = 'Asia/Tokyo';

// タイムアウト延長
jest.setTimeout(20000);
```

#### 問題4: E2Eテストが遅い

**症状**: 全E2Eテストで30分以上かかる

**解決策**:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: 5, // 並列実行
  fullyParallel: true,
});
```

```bash
# 選択的実行
npm run test:e2e -- --grep @smoke
```

#### 問題5: カバレッジレポートが生成されない

**症状**:

```
Coverage data not found
```

**原因**: カバレッジ設定の不備

**解決策**:

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
};
```

### 6.2 デバッグ手法

#### Jest デバッグ

```bash
# デバッグモード
node --inspect-brk node_modules/.bin/jest --runInBand

# VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

#### Playwright デバッグ

```bash
# デバッグモード
npm run test:e2e:debug

# または
npx playwright test --debug

# 特定のテストのみ
npx playwright test auth.spec.ts --debug
```

#### MSW デバッグ

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/*', ({ request }) => {
    console.log('MSW Intercepted:', request.url);
    return HttpResponse.json({ success: true });
  }),
];
```

### 6.3 ログとモニタリング

#### テスト実行ログ

```bash
# 詳細ログ付きで実行
DEBUG=* npm run test:e2e

# Jestの詳細出力
npm run test:unit -- --verbose
```

#### CI/CDログ

GitHub Actions → Actionsタブ → 該当ワークフロー → ログ確認

#### カバレッジレポート

```bash
# HTML形式でカバレッジレポート生成
npm run test:coverage

# レポートを開く
open coverage/index.html
```

---

## 付録

### A. 環境変数一覧

| 変数名                          | 必須 | 説明                      | デフォルト値          |
| ------------------------------- | ---- | ------------------------- | --------------------- |
| `NEXT_PUBLIC_APP_URL`           | ✅   | アプリケーションURL       | http://localhost:3000 |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅   | Supabase Project URL      | -                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅   | Supabase Anon Key         | -                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅   | Supabase Service Role Key | -                     |
| `GEMINI_API_KEY`                | ✅   | Gemini API Key            | -                     |
| `AI_PROVIDER`                   | ⚠️   | AIプロバイダー            | gemini                |
| `AI_MODEL`                      | ⚠️   | AIモデル                  | gemini-2.5-flash-lite |
| `AI_MAX_TOKENS`                 | ⚠️   | 最大トークン数            | 3000                  |
| `NODE_ENV`                      | ⚠️   | 実行環境                  | development           |

### B. よく使うコマンド

```bash
# セットアップ
npm install
npm run db:setup
npm run seed:local

# 開発
npm run dev
npm run build
npm run start

# テスト
npm run test:all
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage

# Lint/Format
npm run lint
npm run lint:fix
npm run format

# データ管理
npm run seed:local
npm run seed:staging
npm run staging:reset

# デプロイ
npm run build
vercel deploy
```

### C. 参考リンク

- [Next.js環境変数ドキュメント](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabaseドキュメント](https://supabase.com/docs)
- [Cloud Run公式ドキュメント](https://cloud.google.com/run/docs)
- [Cloud Run Deployment](https://cloud.google.com/run/docs/deploying)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Container Registry](https://cloud.google.com/container-registry/docs)
- [GitHub Actionsドキュメント](https://docs.github.com/actions)
- [Playwrightドキュメント](https://playwright.dev/docs/intro)
- [Docker公式ドキュメント](https://docs.docker.com/)

---

**最終更新**: 2025年10月11日  
**次回レビュー**: 2025年11月1日
