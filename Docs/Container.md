# Dockerローカル実行手順

## 実行手順

### 1. 環境変数の設定

`.env`ファイルを作成し、必要な環境変数を設定します：

```bash
# .envファイルを作成
cat > .env << EOL
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=your-database-url
EOL
```

### 2. 既存のコンテナの確認と停止

```bash
# 実行中のコンテナを確認
docker ps

# 実行中のコンテナを停止（必要な場合）
docker ps -q | ForEach-Object { docker stop $_ }
```

### 3. Dockerイメージのビルド

#### Windowsの場合

```powershell
# PowerShellで実行
$env:NEXT_PUBLIC_SUPABASE_URL = (Get-Content .env | Select-String "NEXT_PUBLIC_SUPABASE_URL").ToString().Split("=")[1]
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = (Get-Content .env | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY").ToString().Split("=")[1]
$env:SUPABASE_SERVICE_ROLE_KEY = (Get-Content .env | Select-String "SUPABASE_SERVICE_ROLE_KEY").ToString().Split("=")[1]
$env:DATABASE_URL = (Get-Content .env | Select-String "DATABASE_URL").ToString().Split("=")[1]

docker build -t coupleplan . `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$env:NEXT_PUBLIC_SUPABASE_URL" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$env:NEXT_PUBLIC_SUPABASE_ANON_KEY" `
  --build-arg SUPABASE_SERVICE_ROLE_KEY="$env:SUPABASE_SERVICE_ROLE_KEY" `
  --build-arg DATABASE_URL="$env:DATABASE_URL"
```

### 4. コンテナの実行

#### Windowsの場合

```powershell
docker run -p 3000:3000 `
  -e NEXT_PUBLIC_SUPABASE_URL="$env:NEXT_PUBLIC_SUPABASE_URL" `
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$env:NEXT_PUBLIC_SUPABASE_ANON_KEY" `
  -e SUPABASE_SERVICE_ROLE_KEY="$env:SUPABASE_SERVICE_ROLE_KEY" `
  -e DATABASE_URL="$env:DATABASE_URL" `
  coupleplan
```

### 5. アプリケーションへのアクセス

- ローカル: http://localhost:3000
- ネットワーク: http://0.0.0.0:3000

## Cloud Runへのデプロイ

### 1. Google Cloud SDKのセットアップ

```bash
# Google Cloud SDKのインストール（未インストールの場合）
# https://cloud.google.com/sdk/docs/install からインストール

# Google Cloudにログイン
gcloud auth login

# プロジェクトの設定
gcloud config set project <PROJECT_ID>
```

### 2. Artifact Registryのセットアップ

```bash
# Artifact Registryのリポジトリを作成
gcloud artifacts repositories create coupleplan-repo \
    --repository-format=docker \
    --location=asia-northeast1 \
    --description="CouplePlan Docker repository"

# サービスアカウントに必要な権限を付与
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:github-actions@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

### 3. Dockerイメージのビルドとプッシュ

#### Windowsの場合

```powershell
# イメージのビルド
docker build -t asia-northeast1-docker.pkg.dev/<PROJECT_ID>/coupleplan-repo/coupleplan . `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$env:NEXT_PUBLIC_SUPABASE_URL" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$env:NEXT_PUBLIC_SUPABASE_ANON_KEY" `
  --build-arg SUPABASE_SERVICE_ROLE_KEY="$env:SUPABASE_SERVICE_ROLE_KEY" `
  --build-arg DATABASE_URL="$env:DATABASE_URL"

# イメージのプッシュ
docker push asia-northeast1-docker.pkg.dev/<PROJECT_ID>/coupleplan-repo/coupleplan
```

#### Linux/Macの場合

```bash
# イメージのビルド
docker build -t asia-northeast1-docker.pkg.dev/<PROJECT_ID>/coupleplan-repo/coupleplan . \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f2)" \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY .env | cut -d '=' -f2)" \
  --build-arg DATABASE_URL="$(grep DATABASE_URL .env | cut -d '=' -f2)"

# イメージのプッシュ
docker push asia-northeast1-docker.pkg.dev/<PROJECT_ID>/coupleplan-repo/coupleplan
```

### 4. Cloud Runへのデプロイ

#### Windowsの場合

```powershell
# Cloud Runにデプロイ
gcloud run deploy coupleplan `
  --image asia-northeast1-docker.pkg.dev/<PROJECT_ID>/coupleplan-repo/coupleplan `
  --platform managed `
  --region asia-northeast1 `
  --allow-unauthenticated `
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=$env:NEXT_PUBLIC_SUPABASE_URL" `
  --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:NEXT_PUBLIC_SUPABASE_ANON_KEY" `
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=$env:SUPABASE_SERVICE_ROLE_KEY" `
  --set-env-vars="DATABASE_URL=$env:DATABASE_URL"
```

#### Linux/Macの場合

```bash
# Cloud Runにデプロイ
gcloud run deploy coupleplan \
  --image asia-northeast1-docker.pkg.dev/<PROJECT_ID>/coupleplan-repo/coupleplan \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f2)" \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env | cut -d '=' -f2)" \
  --set-env-vars="DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)"
```
