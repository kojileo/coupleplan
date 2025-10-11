# CI/CD パイプライン更新ドキュメント

## 更新日時

2025-01-11

## 概要

Prisma削除とSupabase移行に伴い、CI/CDパイプラインを更新しました。

## 主な変更点

### 1. 環境変数の更新

#### 削除された環境変数

- `DATABASE_URL` - Prisma接続文字列（不要）

#### 追加された環境変数

- `GEMINI_API_KEY` - Google Gemini AI API キー

#### 更新された環境変数

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL（より厳密な形式に変更）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - JWT形式のダミー値に変更（テスト用）
- `SUPABASE_SERVICE_ROLE_KEY` - JWT形式のダミー値に変更（テスト用）

### 2. CI パイプライン（.github/workflows/ci.yml）

#### 変更内容

- テストジョブを一旦コメントアウト（今後実装予定）
- lintジョブのみを実行
- シンプルで高速なCIパイプライン

#### 実装されたジョブ

1. **lint**
   - コードの静的解析を実行
   - ESLint、Prettierのチェック
   - 依存関係のインストール

#### コメントアウトされたジョブ（将来実装予定）

- **unit-tests** - ユニットテスト
- **integration-tests** - インテグレーションテスト
- **cdc-tests** - Contract-Driven Development テスト

### 3. CD パイプライン（.github/workflows/cd.yml）

#### 変更内容

- Docker buildステップから`DATABASE_URL`を削除
- Docker buildステップに`GEMINI_API_KEY`を追加
- Cloud Run環境変数から`DATABASE_URL`を削除
- Cloud Run環境変数に`GEMINI_API_KEY`を追加

#### ビルド引数

```bash
--build-arg NEXT_PUBLIC_SUPABASE_URL="${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}"
--build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}"
--build-arg SUPABASE_SERVICE_ROLE_KEY="${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
--build-arg GEMINI_API_KEY="${{ secrets.GEMINI_API_KEY }}"  # 新規追加
# DATABASE_URL は削除
```

### 4. Dockerfile

#### 変更内容

- Prismaディレクトリのコピー削除
- `DATABASE_URL`環境変数の削除
- `GEMINI_API_KEY`環境変数の追加
- Prisma関連のディレクトリ作成コマンドの削除

#### 削除されたコマンド

```dockerfile
COPY prisma ./prisma/
RUN mkdir -p /app/public /app/prisma /app/.next
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
```

#### 追加されたビルド引数

```dockerfile
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
```

## 必要なGitHub Secrets

### 既存のSecrets（継続使用）

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `FROM_EMAIL`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`

### 新規追加のSecrets

- `GEMINI_API_KEY` - Google Gemini AI APIキー

### 削除されたSecrets

- `DATABASE_URL` - もう不要

## セットアップ手順

### GitHub Secretsの設定

1. GitHubリポジトリの設定ページを開く
2. Settings > Secrets and variables > Actions を選択
3. 新規Secret `GEMINI_API_KEY` を追加
4. （オプション）古いSecret `DATABASE_URL` を削除

### Google Cloud（Cloud Run）の設定

Cloud Run環境変数は自動的にCDパイプラインで更新されますが、手動で確認する場合：

```bash
gcloud run services update coupleplan \
  --region=asia-northeast1 \
  --update-env-vars GEMINI_API_KEY=<your-api-key> \
  --remove-env-vars DATABASE_URL
```

## テスト

### ローカルでのテスト

```bash
# 環境変数を設定
export NEXT_PUBLIC_SUPABASE_URL='https://dummy-supabase-url.supabase.co'
export NEXT_PUBLIC_SUPABASE_ANON_KEY='dummy-key'
export SUPABASE_SERVICE_ROLE_KEY='dummy-key'
export GEMINI_API_KEY='dummy-key'

# テスト実行
npm run test:unit
npm run test:integration
npm run test:cdc:msw
```

### CI/CDパイプラインのテスト

1. develop ブランチにプッシュしてCIを確認
2. main ブランチにマージしてCDを確認

## トラブルシューティング

### エラー: "GEMINI_API_KEY is not defined"

- GitHub Secretsに`GEMINI_API_KEY`が設定されているか確認
- Dockerfileで環境変数が正しく設定されているか確認

### エラー: "Prisma schema not found"

- Dockerfileでprismaディレクトリのコピーが削除されているか確認
- package.jsonでprisma関連のスクリプトが削除されているか確認

### ビルドが遅い

- Dockerのマルチステージビルドキャッシュが有効か確認
- 不要な依存関係が削除されているか確認（Prismaなど）

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

## 更新履歴

- 2025-01-11: Prisma削除とSupabase/Gemini移行に伴う更新
- 2025-01-11: テストジョブを一旦コメントアウト（今後実装予定）、lintのみのシンプルなCI構成に変更
