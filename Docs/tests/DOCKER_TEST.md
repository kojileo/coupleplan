# CouplePlan Dockerテスト戦略（Cloud Run対応）

## ドキュメント情報

- **作成日**: 2025年10月11日
- **バージョン**: 1.0.0
- **親ドキュメント**: [TEST_PLAN.md](../TEST_PLAN.md)

---

## 目次

1. [概要](#1-概要)
2. [Dockerfileテスト](#2-dockerfileテスト)
3. [コンテナビルドテスト](#3-コンテナビルドテスト)
4. [コンテナ実行テスト](#4-コンテナ実行テスト)
5. [セキュリティテスト](#5-セキュリティテスト)
6. [性能最適化テスト](#6-性能最適化テスト)
7. [Cloud Run統合テスト](#7-cloud-run統合テスト)

---

## 1. 概要

### 1.1 目的

Cloud Runへのデプロイを前提としたDockerコンテナの品質を保証し、以下を達成します：

- **正常性**: コンテナが期待通りに動作する
- **セキュリティ**: 脆弱性のないイメージ
- **性能**: 軽量で高速なコンテナ
- **信頼性**: 本番環境での安定稼働

### 1.2 テスト対象

- `Dockerfile`: マルチステージビルド定義
- コンテナイメージ: サイズ、レイヤー構成
- 実行時動作: 起動、ヘルスチェック、環境変数
- Cloud Run統合: デプロイ、スケーリング、シークレット

### 1.3 品質目標

| メトリクス         | 目標値  | 測定方法             |
| ------------------ | ------- | -------------------- |
| イメージサイズ     | < 500MB | `docker images`      |
| ビルド時間         | < 5分   | GitHub Actions Timer |
| コールドスタート   | < 5秒   | Cloud Run Metrics    |
| ウォームスタート   | < 1秒   | Cloud Run Metrics    |
| 脆弱性（Critical） | 0件     | Trivy Scan           |
| 脆弱性（High）     | < 5件   | Trivy Scan           |

---

## 2. Dockerfileテスト

### 2.1 Dockerfileの検証

#### ベストプラクティスチェック

```bash
# Hadolint（Dockerfileリンター）でチェック
docker run --rm -i hadolint/hadolint < Dockerfile

# 目標: エラー0件、警告 < 5件
```

**チェック項目**:

- ✅ マルチステージビルド使用
- ✅ Alpineベースイメージ使用
- ✅ 非rootユーザーで実行
- ✅ 明示的なバージョン指定
- ✅ レイヤーキャッシュの最適化
- ✅ 不要ファイルの除外（.dockerignore）

#### .dockerignoreファイル

```.dockerignore
# 必須項目
node_modules
.next
.git
.github
*.md
*.log
coverage
playwright-report
test-results

# 開発専用
.env.local
.env*.local
*.test.ts
*.test.tsx
tests/

# OS固有
.DS_Store
Thumbs.db
```

### 2.2 Dockerfile構成

#### 推奨構成（マルチステージビルド）

```dockerfile
# =====================
# Stage 1: Base
# =====================
FROM node:18-alpine AS base

# =====================
# Stage 2: Dependencies
# =====================
FROM base AS deps

WORKDIR /app

# package.jsonとpackage-lock.jsonのみコピー（キャッシュ最適化）
COPY package*.json ./

# 本番依存関係のみインストール
RUN npm ci --omit=dev

# =====================
# Stage 3: Builder
# =====================
FROM base AS builder

WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ビルド時環境変数（引数として受け取る）
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js Standalone出力を有効化
# next.config.mjs に output: 'standalone' を設定

# ビルド実行
RUN npm run build

# =====================
# Stage 4: Runner
# =====================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 非rootユーザー作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 必要なファイルのみコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ユーザー切り替え
USER nextjs

# Cloud Runのデフォルトポート
EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# ヘルスチェック（オプション）
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 起動コマンド
CMD ["node", "server.js"]
```

### 2.3 next.config.mjsの設定

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Docker用に必須

  // 画像最適化（Cloud Run対応）
  images: {
    domains: ['*.supabase.co'],
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 3. コンテナビルドテスト

### 3.1 ローカルビルドテスト

```bash
# イメージビルド
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  -t coupleplan:test \
  .

# ビルド成功確認
echo $?  # 0であればSuccess

# イメージサイズ確認
docker images coupleplan:test --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# レイヤー構成確認
docker history coupleplan:test
```

### 3.2 ビルドキャッシュ検証

```bash
# 1回目: フルビルド
time docker build -t coupleplan:test .

# 2回目: キャッシュ利用
time docker build -t coupleplan:test .

# 目標:
# - 1回目: < 5分
# - 2回目: < 30秒（キャッシュヒット）
```

### 3.3 CI/CDビルドテスト

**GitHub Actionsでの自動ビルド**:

```yaml
# .github/workflows/docker-test.yml
name: Docker Build Test

on:
  pull_request:
    paths:
      - 'Dockerfile'
      - 'package*.json'
      - 'next.config.mjs'

jobs:
  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: false
          tags: coupleplan:test
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }}

      - name: Test container startup
        run: |
          docker run -d -p 8080:8080 \
            -e NEXT_PUBLIC_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }} \
            -e NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }} \
            --name test-container \
            coupleplan:test

          # 起動待機
          sleep 10

          # ヘルスチェック
          curl -f http://localhost:8080/api/health || exit 1

          # クリーンアップ
          docker stop test-container
          docker rm test-container
```

---

## 4. コンテナ実行テスト

### 4.1 起動テスト

```bash
# コンテナ起動
docker run -d -p 8080:8080 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  -e SUPABASE_SERVICE_ROLE_KEY=xxx \
  -e GEMINI_API_KEY=xxx \
  --name coupleplan-test \
  coupleplan:test

# ログ確認
docker logs -f coupleplan-test

# 期待ログ:
# ✓ Ready in Xms
# ✓ Local: http://0.0.0.0:8080
```

### 4.2 ヘルスチェックテスト

#### ヘルスチェックエンドポイント作成

`src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'coupleplan',
    version: process.env.npm_package_version || '0.1.0',
  });
}
```

#### テスト実行

```bash
# ヘルスチェック
curl http://localhost:8080/api/health

# 期待レスポンス
{
  "status": "ok",
  "timestamp": "2025-10-11T12:00:00.000Z",
  "service": "coupleplan",
  "version": "0.1.0"
}

# ステータスコード確認
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:8080/api/health
# 期待: 200
```

### 4.3 環境変数テスト

```bash
# 環境変数の注入
docker run -d -p 8080:8080 \
  -e NEXT_PUBLIC_SUPABASE_URL=test_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=test_key \
  coupleplan:test

# コンテナ内で確認
docker exec coupleplan-test env | grep NEXT_PUBLIC

# 期待出力:
# NEXT_PUBLIC_SUPABASE_URL=test_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=test_key
```

### 4.4 ログ出力テスト

```bash
# ログレベル確認
docker logs coupleplan-test 2>&1 | grep -i error

# 期待:
# - エラーログがない（正常起動時）
# - シークレットがログに含まれない
```

---

## 5. セキュリティテスト

### 5.1 脆弱性スキャン（Trivy）

#### インストール

```bash
# macOS
brew install aquasecurity/trivy/trivy

# Linux
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

#### スキャン実行

```bash
# イメージスキャン
trivy image coupleplan:test

# 詳細レポート（JSON）
trivy image --format json --output trivy-report.json coupleplan:test

# 重大度別フィルター
trivy image --severity CRITICAL,HIGH coupleplan:test

# CI/CD自動化
trivy image --exit-code 1 --severity CRITICAL coupleplan:test
```

#### 合格基準

- **Critical脆弱性**: 0件
- **High脆弱性**: < 5件
- **Medium脆弱性**: < 20件

#### CI/CD統合

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # 毎週日曜0時

jobs:
  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build image
        run: docker build -t coupleplan:${{ github.sha }} .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: coupleplan:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Fail on Critical vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: coupleplan:${{ github.sha }}
          exit-code: '1'
          severity: 'CRITICAL'
```

### 5.2 ベースイメージの検証

```bash
# ベースイメージのスキャン
trivy image node:18-alpine

# 公式イメージの最新版使用を確認
docker pull node:18-alpine
```

### 5.3 実行ユーザーの確認

```bash
# rootユーザーで実行されていないことを確認
docker run --rm coupleplan:test whoami
# 期待出力: nextjs

# ユーザーIDの確認
docker run --rm coupleplan:test id
# 期待出力: uid=1001(nextjs) gid=1001(nodejs)
```

---

## 6. 性能最適化テスト

### 6.1 イメージサイズ最適化

#### サイズ測定

```bash
# イメージサイズ確認
docker images coupleplan:test --format "{{.Size}}"

# 目標: < 500MB
```

#### レイヤー分析

```bash
# dive（イメージ分析ツール）でレイヤーごとのサイズ確認
dive coupleplan:test

# インストール:
# brew install dive
# または
# docker pull wagoodman/dive
# docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive coupleplan:test
```

#### 最適化チェックリスト

- [ ] マルチステージビルドで中間ファイル除外
- [ ] node_modulesを含まない（standaloneモード）
- [ ] 開発依存関係を除外（--omit=dev）
- [ ] 不要ファイルを.dockerignoreで除外
- [ ] Alpineベースイメージ使用

### 6.2 ビルド時間最適化

```bash
# ビルド時間測定
time docker build -t coupleplan:test .

# 目標: < 5分（初回）、< 30秒（キャッシュヒット）
```

**最適化戦略**:

1. **レイヤーキャッシュの活用**

   ```dockerfile
   # ❌ Bad: 全ファイルを先にコピー
   COPY . .
   RUN npm install

   # ✅ Good: package.jsonのみ先にコピー
   COPY package*.json ./
   RUN npm ci
   COPY . .
   ```

2. **BuildKitの活用**

   ```bash
   # BuildKit有効化
   DOCKER_BUILDKIT=1 docker build -t coupleplan:test .
   ```

3. **並列ビルド**
   ```bash
   # GitHub Actionsでキャッシュ利用
   - uses: docker/build-push-action@v4
     with:
       cache-from: type=gha
       cache-to: type=gha,mode=max
   ```

### 6.3 起動時間最適化

```bash
# コンテナ起動時間測定
time docker run --rm -p 8080:8080 \
  -e NEXT_PUBLIC_SUPABASE_URL=xxx \
  coupleplan:test &

# アプリケーション応答までの時間
time curl --retry 10 --retry-delay 1 http://localhost:8080/api/health

# 目標:
# - コンテナ起動: < 2秒
# - アプリケーション起動: < 3秒
# - 合計: < 5秒
```

---

## 7. Cloud Run統合テスト

### 7.1 ローカルでCloud Runエミュレート

#### Cloud Run Local Emulator

```bash
# gcloud CLIインストール確認
gcloud version

# ローカルでCloud Run環境をエミュレート
gcloud beta run deploy coupleplan-local \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --local

# または、Docker Composeでエミュレート
```

#### docker-compose.yml（テスト用）

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    ports:
      - '8080:8080'
    environment:
      - NODE_ENV=production
      - PORT=8080
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8080/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 7.2 Cloud Runデプロイテスト

#### 手動デプロイ（初回）

```bash
# プロジェクトID設定
export PROJECT_ID=your-gcp-project-id
export SERVICE_NAME=coupleplan-staging
export REGION=asia-northeast1

# イメージビルド
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:test .

# Container Registryにプッシュ
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:test

# Cloud Runにデプロイ
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:test \
  --platform managed \
  --region $REGION \
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

#### デプロイ確認

```bash
# サービスURL取得
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
echo "Service URL: $SERVICE_URL"

# ヘルスチェック
curl $SERVICE_URL/api/health

# レスポンス確認
curl $SERVICE_URL/

# ログ確認
gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=50
```

### 7.3 Cloud Run設定の検証

#### リソース設定テスト

```bash
# 設定確認
gcloud run services describe $SERVICE_NAME --region=$REGION

# 確認項目:
# - Memory: 512Mi
# - CPU: 1
# - Max instances: 10
# - Min instances: 0
# - Timeout: 300s
# - Concurrency: 80
```

#### スケーリング動作テスト

```bash
# 負荷発生（Artillery）
npx artillery quick --count 100 --num 10 $SERVICE_URL

# インスタンス数確認（別ターミナル）
watch -n 1 "gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.observedGeneration)'"

# 期待動作:
# - 負荷増加 → インスタンス数増加
# - 負荷減少 → インスタンス数減少
# - 最大10インスタンスまで
```

### 7.4 Secret Manager統合テスト

```bash
# シークレット一覧確認
gcloud secrets list

# シークレットバージョン確認
gcloud secrets versions list GEMINI_API_KEY

# Cloud Runサービスからアクセス可能か確認
gcloud run services describe $SERVICE_NAME --region=$REGION --format='yaml(spec.template.spec.containers[0].env)'
```

---

## 8. テスト自動化

### 8.1 GitHub Actions統合

#### フルワークフロー

```yaml
# .github/workflows/docker-full-test.yml
name: Docker Full Test

on:
  push:
    branches: [main]
  pull_request:
    paths:
      - 'Dockerfile'
      - 'src/**'
      - 'package*.json'

jobs:
  docker-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # 1. Dockerfileリント
      - name: Run Hadolint
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile

      # 2. ビルド
      - name: Build image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }} \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }} \
            -t coupleplan:${{ github.sha }} \
            .

      # 3. セキュリティスキャン
      - name: Run Trivy scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: coupleplan:${{ github.sha }}
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL'

      # 4. コンテナ起動テスト
      - name: Test container
        run: |
          docker run -d -p 8080:8080 \
            -e NEXT_PUBLIC_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }} \
            -e NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }} \
            --name test-app \
            coupleplan:${{ github.sha }}

          sleep 15

          curl -f http://localhost:8080/api/health || exit 1

          docker logs test-app
          docker stop test-app

      # 5. イメージサイズ確認
      - name: Check image size
        run: |
          SIZE=$(docker images coupleplan:${{ github.sha }} --format "{{.Size}}")
          echo "Image size: $SIZE"

          # サイズチェック（500MB以下）
          SIZE_MB=$(docker images coupleplan:${{ github.sha }} --format "{{.Size}}" | sed 's/MB//')
          if (( $(echo "$SIZE_MB > 500" | bc -l) )); then
            echo "ERROR: Image size exceeds 500MB"
            exit 1
          fi
```

### 8.2 定期スキャン

```yaml
# .github/workflows/weekly-security-scan.yml
name: Weekly Security Scan

on:
  schedule:
    - cron: '0 0 * * 0' # 毎週日曜0時

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build latest image
        run: docker build -t coupleplan:latest .

      - name: Comprehensive Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: coupleplan:latest
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload to Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

---

## 9. ベストプラクティス

### 9.1 Dockerfileのベストプラクティス

#### ✅ 推奨事項

1. **マルチステージビルドの使用**
   - ビルド環境と実行環境を分離
   - 最終イメージのサイズ削減

2. **Alpineベースイメージ**
   - 軽量（約5MB）
   - セキュリティ更新が頻繁

3. **非rootユーザー実行**
   - セキュリティリスク低減
   - 最小権限の原則

4. **明示的なバージョン指定**
   - `node:18-alpine` ではなく `node:18.20.0-alpine3.19`
   - 再現性の確保

5. **レイヤーキャッシュの最適化**
   - 変更頻度の低いものから順にCOPY
   - package.json → ソースコード

#### ❌ アンチパターン

1. **rootユーザーで実行**

   ```dockerfile
   # ❌ Bad
   CMD ["node", "server.js"]

   # ✅ Good
   USER nextjs
   CMD ["node", "server.js"]
   ```

2. **不要なファイルを含む**

   ```dockerfile
   # ❌ Bad
   COPY . .

   # ✅ Good
   COPY --from=builder /app/.next/standalone ./
   ```

3. **開発依存関係を含む**

   ```dockerfile
   # ❌ Bad
   RUN npm install

   # ✅ Good
   RUN npm ci --omit=dev
   ```

### 9.2 Cloud Run最適化

#### 推奨設定

```bash
gcloud run deploy coupleplan \
  --platform managed \
  --region asia-northeast1 \

  # トラフィック設定
  --allow-unauthenticated \  # パブリックアクセス

  # リソース設定
  --memory=512Mi \            # メモリ: 512MB
  --cpu=1 \                   # CPU: 1コア

  # スケーリング設定
  --min-instances=0 \         # 最小0（コスト削減）
  --max-instances=10 \        # 最大10（負荷対応）
  --concurrency=80 \          # 1インスタンスあたり80リクエスト

  # タイムアウト設定
  --timeout=300s \            # 最大5分（AI生成対応）

  # 環境変数
  --set-env-vars="NODE_ENV=production,PORT=8080" \

  # シークレット
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

#### パフォーマンスチューニング

**メモリ設定**:

- **128Mi**: 軽量API（非推奨）
- **256Mi**: 標準的なアプリ（最小構成）
- **512Mi**: Next.js + AI（推奨）
- **1Gi**: 高負荷・複雑な処理

**CPU設定**:

- **1 CPU**: 標準（推奨）
- **2 CPU**: 高速応答が必要な場合

**コンカレンシー**:

- **80**: デフォルト（推奨）
- **100**: メモリ1Gi以上の場合
- **50**: メモリ256Miの場合

### 9.3 モニタリング

#### Cloud Monitoringダッシュボード

```bash
# カスタムダッシュボード作成
gcloud monitoring dashboards create --config-from-file=dashboard.json
```

**monitoring-dashboard.json**:

```json
{
  "displayName": "CouplePlan Cloud Run",
  "dashboardFilters": [],
  "mosaicLayout": {
    "columns": 12,
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Request Count",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" resource.label.service_name=\"coupleplan-staging\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_RATE"
                    }
                  }
                }
              }
            ]
          }
        }
      }
    ]
  }
}
```

#### アラート設定

```bash
# エラー率アラート
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

---

## 10. トラブルシューティング

### 10.1 よくある問題

#### 問題1: ビルドが失敗する

**症状**:

```
ERROR: failed to solve: node:18-alpine: not found
```

**原因**: ネットワーク問題、タイポ

**解決策**:

```bash
# ベースイメージを事前にpull
docker pull node:18-alpine

# Dockerfileの確認
cat Dockerfile | grep FROM
```

#### 問題2: コンテナが起動しない

**症状**:

```
Error: Cannot find module './server.js'
```

**原因**: standaloneモードが無効

**解決策**:

```javascript
// next.config.mjs
export default {
  output: 'standalone', // 必須！
};
```

#### 問題3: 環境変数が読み込まれない

**症状**: アプリケーションエラー、Supabase接続失敗

**原因**: ビルド時引数とランタイム環境変数の混同

**解決策**:

```dockerfile
# ビルド時に必要（NEXT_PUBLIC_*）
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

# ランタイムに必要
# Cloud Runの--set-env-varsまたは--set-secretsで設定
```

#### 問題4: Cloud Runデプロイが失敗

**症状**:

```
ERROR: (gcloud.run.deploy) Revision creation failed
```

**原因**: 権限不足、リソース制限

**解決策**:

```bash
# サービスアカウントの権限確認
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:coupleplan-deployer@*"

# 必要な権限:
# - roles/run.admin
# - roles/storage.admin
# - roles/secretmanager.secretAccessor
```

#### 問題5: コールドスタートが遅い

**症状**: 初回アクセスに10秒以上かかる

**原因**: イメージサイズ、起動処理

**解決策**:

```bash
# min-instancesを1に設定（常時1インスタンス保持）
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --min-instances=1

# または、イメージ最適化
# - Alpineベースイメージ
# - 不要な依存関係削除
# - マルチステージビルド
```

---

## 11. チェックリスト

### デプロイ前チェックリスト

- [ ] Dockerfileリント（Hadolint）: エラー0件
- [ ] ローカルビルド成功
- [ ] コンテナ起動成功
- [ ] ヘルスチェック応答
- [ ] セキュリティスキャン（Trivy）: Critical 0件
- [ ] イメージサイズ < 500MB
- [ ] 環境変数正しく設定
- [ ] Secret Manager設定完了
- [ ] GitHub Secrets設定完了
- [ ] CI/CDパイプライン動作確認

### デプロイ後チェックリスト

- [ ] Cloud Run URLアクセス可能
- [ ] ヘルスチェックエンドポイント正常
- [ ] アプリケーション正常動作
- [ ] ログにエラーなし
- [ ] Cloud Monitoringダッシュボード確認
- [ ] スケーリング動作確認
- [ ] E2Eテスト実行成功

---

## 付録

### A. 便利なコマンド集

```bash
# ===================
# ローカル開発
# ===================

# イメージビルド
docker build -t coupleplan:dev .

# コンテナ起動
docker run -p 8080:8080 --env-file .env.local coupleplan:dev

# ログ確認
docker logs -f container_id

# コンテナ内に入る
docker exec -it container_id sh

# ===================
# Cloud Run管理
# ===================

# サービス一覧
gcloud run services list --region=asia-northeast1

# サービス詳細
gcloud run services describe SERVICE_NAME --region=asia-northeast1

# ログストリーミング
gcloud run services logs tail SERVICE_NAME --region=asia-northeast1

# トラフィック分割（カナリアリリース）
gcloud run services update-traffic SERVICE_NAME \
  --region=asia-northeast1 \
  --to-revisions=REVISION_1=90,REVISION_2=10

# リビジョン削除
gcloud run revisions delete REVISION_NAME --region=asia-northeast1

# ===================
# Secret Manager
# ===================

# シークレット作成
echo -n "secret_value" | gcloud secrets create SECRET_NAME --data-file=-

# シークレット更新
echo -n "new_value" | gcloud secrets versions add SECRET_NAME --data-file=-

# シークレット確認（値は表示されない）
gcloud secrets describe SECRET_NAME

# ===================
# Container Registry
# ===================

# イメージ一覧
gcloud container images list --repository=gcr.io/PROJECT_ID

# イメージ削除
gcloud container images delete gcr.io/PROJECT_ID/IMAGE_NAME:TAG
```

### B. 参考リソース

- [Cloud Run公式ドキュメント](https://cloud.google.com/run/docs)
- [Docker公式ベストプラクティス](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Next.js Docker デプロイ](https://nextjs.org/docs/deployment#docker-image)
- [Trivy公式ドキュメント](https://aquasecurity.github.io/trivy/)
- [Hadolint](https://github.com/hadolint/hadolint)
- [Container Structure Tests](https://github.com/GoogleContainerTools/container-structure-test)

---

**最終更新**: 2025年10月11日  
**次回レビュー**: 2025年11月1日
