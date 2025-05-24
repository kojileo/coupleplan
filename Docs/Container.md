# Dockerローカル実行手順（Docker Compose使用）

## 事前準備

### 1. 環境変数の設定

`.env`ファイルを作成し、必要な環境変数を設定します：

```powershell
# .env.localファイルを作成
@"
# AdSense設定
NEXT_PUBLIC_ADSENSE_CLIENT_ID=pub-your-adsense-client-id

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# データベース設定
DATABASE_URL=postgresql://postgres:your-password@host.docker.internal:5432/your-database-name
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

## Docker Compose実行手順

### 1. 既存のコンテナの停止（必要な場合）

```powershell
# 実行中のCoupleplanコンテナを確認・停止
docker-compose down
```

### 2. アプリケーションの起動

```powershell
# アプリケーションをビルドして起動
docker-compose up --build

# バックグラウンドで起動したい場合
docker-compose up --build -d
```

### 3. アプリケーションへのアクセス

- ローカル: http://localhost:3000
- ネットワーク: http://0.0.0.0:3000

### 4. アプリケーションの停止

```powershell
# アプリケーションを停止
docker-compose down

# コンテナとボリュームを削除して停止
docker-compose down -v
```

### 5. ログの確認

```powershell
# リアルタイムでログを確認
docker-compose logs -f

# 特定のサービスのログを確認
docker-compose logs -f app
```

## Docker Composeの主な利点

- ✅ `.env`ファイルが自動的に読み込まれる
- ✅ 複雑な環境変数の設定が不要
- ✅ 一度設定すれば簡単にアプリケーションを起動・停止できる
- ✅ コマンドが簡潔で覚えやすい
- ✅ 開発環境の再現性が高い

## よく使用するコマンド一覧

```powershell
# 初回起動（ビルドも含む）
docker-compose up --build

# 通常の起動
docker-compose up

# バックグラウンド起動
docker-compose up -d

# 停止
docker-compose down

# 完全停止（ボリュームも削除）
docker-compose down -v

# ログ確認
docker-compose logs -f

# コンテナの状態確認
docker-compose ps

# 再ビルド
docker-compose build

# サービス再起動
docker-compose restart app
```

### Docker Composeエラーの一般的な解決方法

```powershell
# キャッシュをクリアして再ビルド
docker-compose build --no-cache

# 全てのコンテナを停止して再起動
docker-compose down
docker-compose up --build

# Dockerシステム全体のクリーンアップ（注意：他のプロジェクトにも影響）
docker system prune -a
```
