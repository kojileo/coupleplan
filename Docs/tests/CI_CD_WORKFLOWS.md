# CouplePlan CI/CDワークフロー（Cloud Run対応）

## ドキュメント情報

- **作成日**: 2025年10月11日
- **バージョン**: 1.0.0
- **親ドキュメント**: [TEST_ENVIRONMENTS.md](./TEST_ENVIRONMENTS.md)

---

## 目次

1. [ワークフロー概要](#1-ワークフロー概要)
2. [PR Test ワークフロー](#2-pr-test-ワークフロー)
3. [Main Test & Deploy ワークフロー](#3-main-test--deploy-ワークフロー)
4. [Docker Test ワークフロー](#4-docker-test-ワークフロー)
5. [Security Scan ワークフロー](#5-security-scan-ワークフロー)
6. [Nightly Test ワークフロー](#6-nightly-test-ワークフロー)

---

## 1. ワークフロー概要

### 1.1 ワークフロー一覧

| ワークフロー       | ファイル            | トリガー        | 目的                      | 実行時間 |
| ------------------ | ------------------- | --------------- | ------------------------- | -------- |
| PR Test            | `pr-test.yml`       | Pull Request    | コード品質検証            | < 5分    |
| Main Test & Deploy | `main-test.yml`     | Push to main    | 全テスト + Staging Deploy | < 25分   |
| Docker Test        | `docker-test.yml`   | Dockerfile変更  | コンテナビルド検証        | < 10分   |
| Security Scan      | `security-scan.yml` | 週次（日曜0時） | 脆弱性スキャン            | < 10分   |
| Nightly Test       | `nightly.yml`       | 毎日0時JST      | フルテスト + 性能測定     | < 30分   |

### 1.2 フロー図

```
PR作成
  ↓
[PR Test] → Lint, Unit, Integration
  ↓
レビュー・承認
  ↓
Main にマージ
  ↓
[Main Test & Deploy]
  ├→ 全テスト実行
  ├→ Dockerビルド
  ├→ Container Registry Push
  └→ Cloud Run Deploy (Staging)
  ↓
Stagingで動作確認
  ↓
本番デプロイ（手動承認）
```

---

## 2. PR Test ワークフロー

### 2.1 目的

プルリクエスト作成時に自動的にテストを実行し、コード品質を検証します。

### 2.2 ファイル: `.github/workflows/pr-test.yml`

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
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
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
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
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
    name: Integration Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration
```

---

## 3. Main Test & Deploy ワークフロー

### 3.1 目的

mainブランチへのマージ時に全テストを実行し、成功した場合はCloud Run Stagingにデプロイします。

### 3.2 ファイル: `.github/workflows/main-test.yml`

```yaml
name: Main Test & Deploy to Staging

on:
  push:
    branches: [main]

env:
  NODE_ENV: test
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
  GEMINI_API_KEY: ${{ secrets.TEST_GEMINI_API_KEY }}

  # Cloud Run設定
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: coupleplan-staging
  REGION: asia-northeast1

jobs:
  test:
    name: Run All Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint & Type Check
        run: |
          npm run lint
          npx tsc --noEmit

      - name: Unit Tests
        run: npm run test:unit -- --coverage

      - name: Integration Tests
        run: npm run test:integration

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: E2E Tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/
            junit.xml
          retention-days: 7

  build-and-deploy:
    name: Build & Deploy to Cloud Run
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

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
            --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID=${{ secrets.STAGING_ADSENSE_CLIENT_ID }} \
            --build-arg GOOGLE_SITE_VERIFICATION=${{ secrets.GOOGLE_SITE_VERIFICATION }} \
            -t gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            -t gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest \
            .

      - name: Push to Container Registry
        run: |
          docker push gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
          docker push gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest

      - name: Deploy to Cloud Run
        id: deploy
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: ${{ env.SERVICE_NAME }}
          region: ${{ env.REGION }}
          image: gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
          flags: |
            --allow-unauthenticated
            --max-instances=10
            --min-instances=0
            --memory=512Mi
            --cpu=1
            --timeout=300s
            --concurrency=80
          secrets: |
            SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest
            GEMINI_API_KEY=GEMINI_API_KEY:latest
            RESEND_API_KEY=RESEND_API_KEY:latest
          env_vars: |
            NODE_ENV=staging

      - name: Get Cloud Run URL
        run: |
          SERVICE_URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region=${{ env.REGION }} \
            --format='value(status.url)')
          echo "🚀 Deployed to: $SERVICE_URL"
          echo "SERVICE_URL=$SERVICE_URL" >> $GITHUB_ENV

      - name: Test deployment
        run: |
          # ヘルスチェック
          curl -f ${{ env.SERVICE_URL }}/api/health || exit 1
          echo "✅ Health check passed"

      - name: Comment PR
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Deployed to Cloud Run Staging: ${{ env.SERVICE_URL }}`
            })
```

---

## 4. Docker Test ワークフロー

### 4.1 目的

Dockerfileやコンテナ関連ファイルの変更時に、ビルド・起動・セキュリティをテストします。

### 4.2 ファイル: `.github/workflows/docker-test.yml`

```yaml
name: Docker Build & Test

on:
  pull_request:
    paths:
      - 'Dockerfile'
      - '.dockerignore'
      - 'package*.json'
      - 'next.config.mjs'
  push:
    branches: [main]
    paths:
      - 'Dockerfile'

jobs:
  docker-test:
    name: Docker Build & Security Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Lint Dockerfile (Hadolint)
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile
          failure-threshold: error

      - name: Build Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: false
          tags: coupleplan:test-${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }}
          load: true

      - name: Check image size
        run: |
          SIZE=$(docker images coupleplan:test-${{ github.sha }} --format "{{.Size}}")
          echo "📦 Image size: $SIZE"

          # Extract numeric value (remove MB/GB)
          SIZE_NUM=$(echo $SIZE | sed 's/[A-Z]*$//')
          SIZE_UNIT=$(echo $SIZE | sed 's/^[0-9.]*//') 

          # Check if size > 500MB
          if [[ "$SIZE_UNIT" == "GB" ]]; then
            echo "❌ ERROR: Image size exceeds 500MB (actual: $SIZE)"
            exit 1
          elif [[ "$SIZE_UNIT" == "MB" ]] && (( $(echo "$SIZE_NUM > 500" | bc -l) )); then
            echo "❌ ERROR: Image size exceeds 500MB (actual: $SIZE)"
            exit 1
          fi

          echo "✅ Image size OK: $SIZE"

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: coupleplan:test-${{ github.sha }}
          format: 'table'
          exit-code: '0' # 警告のみ
          severity: 'CRITICAL,HIGH'

      - name: Fail on CRITICAL vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: coupleplan:test-${{ github.sha }}
          format: 'table'
          exit-code: '1' # Criticalでビルド失敗
          severity: 'CRITICAL'

      - name: Test container startup
        run: |
          echo "🐳 Starting container..."

          docker run -d -p 8080:8080 \
            -e NEXT_PUBLIC_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }} \
            -e NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }} \
            -e SUPABASE_SERVICE_ROLE_KEY=${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }} \
            -e GEMINI_API_KEY=${{ secrets.TEST_GEMINI_API_KEY }} \
            --name test-container \
            coupleplan:test-${{ github.sha }}

          echo "⏳ Waiting for container to be ready..."
          sleep 15

          echo "🔍 Testing health endpoint..."
          if curl -f http://localhost:8080/api/health; then
            echo "✅ Health check passed"
          else
            echo "❌ Health check failed"
            docker logs test-container
            exit 1
          fi

          echo "📊 Container logs:"
          docker logs test-container

          echo "🧹 Cleanup..."
          docker stop test-container
          docker rm test-container

      - name: Upload Trivy results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: trivy-results
          path: trivy-results.sarif
```

---

## 5. Security Scan ワークフロー

### 5.1 目的

週次でDockerイメージのセキュリティスキャンを実施し、脆弱性を早期発見します。

### 5.2 ファイル: `.github/workflows/security-scan.yml`

```yaml
name: Weekly Security Scan

on:
  schedule:
    - cron: '0 15 * * 0' # 毎週日曜0時JST（15時UTC）
  workflow_dispatch: # 手動実行も可能

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: coupleplan-staging
  REGION: asia-northeast1

jobs:
  security-scan:
    name: Trivy Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Pull latest image from GCR
        run: |
          gcloud auth configure-docker
          docker pull gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH,MEDIUM'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Generate detailed report
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest
          format: 'table'
          output: 'trivy-report.txt'

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: security-scan-report
          path: trivy-report.txt

      - name: Send notification (if vulnerabilities found)
        if: failure()
        run: |
          echo "⚠️ Security vulnerabilities detected!"
          echo "Please review the report in GitHub Security tab"
```

---

## 6. Nightly Test ワークフロー

### 6.1 目的

毎日深夜に全テストを実行し、クロスブラウザ互換性と性能を継続的に監視します。

### 6.2 ファイル: `.github/workflows/nightly.yml`

```yaml
name: Nightly Full Test

on:
  schedule:
    - cron: '0 15 * * *' # 毎日0時JST（15時UTC）
  workflow_dispatch:

env:
  NODE_ENV: test
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
  GEMINI_API_KEY: ${{ secrets.TEST_GEMINI_API_KEY }}

jobs:
  e2e-cross-browser:
    name: E2E Tests (${{ matrix.browser }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
        shard: [1, 2, 3]
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: npm run test:e2e -- --project=${{ matrix.browser }} --shard=${{ matrix.shard }}/3

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results-${{ matrix.browser }}-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 7

  performance-test:
    name: Performance Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging-coupleplan-xxx.a.run.app
            https://staging-coupleplan-xxx.a.run.app/dashboard
            https://staging-coupleplan-xxx.a.run.app/dashboard/plans/create
          uploadArtifacts: true
          temporaryPublicStorage: true

  cloud-run-health-check:
    name: Cloud Run Health Check
    runs-on: ubuntu-latest
    steps:
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Check service status
        run: |
          gcloud run services describe coupleplan-staging \
            --region=asia-northeast1 \
            --format="value(status.conditions)"

      - name: Get service metrics
        run: |
          echo "📊 Fetching Cloud Run metrics..."
          gcloud run services describe coupleplan-staging \
            --region=asia-northeast1 \
            --format="table(status.url, status.latestCreatedRevisionName, status.traffic)"
```

---

## 7. GitHub Secrets設定ガイド

### 7.1 必要なSecrets

GitHub Repository → Settings → Secrets and variables → Actions

#### テスト用

| Secret名                         | 説明                     | 取得方法                        |
| -------------------------------- | ------------------------ | ------------------------------- |
| `TEST_SUPABASE_URL`              | テスト用Supabase URL     | Supabase Project Settings → API |
| `TEST_SUPABASE_ANON_KEY`         | テスト用Anon Key         | Supabase Project Settings → API |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | テスト用Service Role Key | Supabase Project Settings → API |
| `TEST_GEMINI_API_KEY`            | テスト用Gemini API Key   | Google AI Studio                |

#### Staging用

| Secret名                    | 説明                     | 取得方法                     |
| --------------------------- | ------------------------ | ---------------------------- |
| `STAGING_SUPABASE_URL`      | Staging Supabase URL     | Supabase Staging Project     |
| `STAGING_SUPABASE_ANON_KEY` | Staging Anon Key         | Supabase Staging Project     |
| `STAGING_ADSENSE_CLIENT_ID` | Staging AdSense ID       | Google AdSense（オプション） |
| `GOOGLE_SITE_VERIFICATION`  | Google Site Verification | Google Search Console        |

#### Cloud Run用

| Secret名         | 説明                              | 取得方法                   |
| ---------------- | --------------------------------- | -------------------------- |
| `GCP_SA_KEY`     | GCPサービスアカウントキー（JSON） | GCP IAM → Service Accounts |
| `GCP_PROJECT_ID` | Google Cloud Project ID           | GCP Console                |

### 7.2 GCPサービスアカウントキーの作成

```bash
# 1. サービスアカウント作成
gcloud iam service-accounts create coupleplan-deployer \
  --display-name="CouplePlan GitHub Actions Deployer" \
  --project=YOUR_PROJECT_ID

# 2. 必要な権限を付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:coupleplan-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:coupleplan-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:coupleplan-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:coupleplan-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3. キーを生成
gcloud iam service-accounts keys create key.json \
  --iam-account=coupleplan-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com

# 4. key.jsonの内容をGitHub Secretsに登録
# GitHub → Settings → Secrets → New repository secret
# Name: GCP_SA_KEY
# Value: (key.jsonの全内容をコピー＆ペースト)

# 5. ローカルのkey.jsonを削除（セキュリティ）
rm key.json
```

---

## 8. トラブルシューティング

### 8.1 GitHub Actions失敗時

#### ビルドエラー

**症状**: Docker build failed

**確認事項**:

```bash
# ローカルでビルド再現
docker build -t coupleplan:test .

# ログ確認
docker build --progress=plain -t coupleplan:test .
```

#### デプロイエラー

**症状**: Cloud Run deployment failed

**確認事項**:

```bash
# サービスアカウント権限確認
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:coupleplan-deployer@*"

# 必要な権限:
# - roles/run.admin
# - roles/storage.admin
# - roles/secretmanager.secretAccessor
```

#### Secret Manager エラー

**症状**: Error: Secret not found

**確認事項**:

```bash
# シークレット一覧確認
gcloud secrets list --project=YOUR_PROJECT_ID

# シークレット作成
echo -n "your_secret_value" | gcloud secrets create SECRET_NAME --data-file=-

# 権限付与
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:coupleplan-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 8.2 テスト失敗時

#### E2Eフレーク

**対策**:

```yaml
# playwright.config.ts でリトライ設定
retries: process.env.CI ? 2 : 0
```

#### タイムアウト

**対策**:

```yaml
# GitHub Actionsタイムアウト延長
jobs:
  test:
    timeout-minutes: 30
```

---

## 付録

### A. よく使うGitHub CLIコマンド

```bash
# ワークフロー実行状況確認
gh run list

# 特定のワークフロー実行
gh workflow run main-test.yml

# ログ確認
gh run view RUN_ID --log

# Secretsの設定
gh secret set GCP_SA_KEY < key.json
gh secret set GCP_PROJECT_ID --body "your-project-id"
```

### B. デバッグ用コマンド

```bash
# ローカルでGitHub Actionsをエミュレート
# act（https://github.com/nektos/act）を使用
act pull_request -j unit-test

# 特定のジョブのみ実行
act -j docker-test
```

---

**最終更新**: 2025年10月11日  
**次回レビュー**: 2025年11月1日
