# Dockerローカル実行手順

## 実行手順

### 1. 既存のコンテナの確認と停止

```bash
# 実行中のコンテナを確認
docker ps

# 実行中のコンテナを停止（必要な場合）
docker ps -q | ForEach-Object { docker stop $_ }
```

### 2. Dockerイメージのビルド

```bash
# プロジェクトのルートディレクトリで実行
docker build -t coupleplan .
```

### 3. コンテナの実行

```bash
docker run -p 3000:3000 coupleplan
```

### 4. アプリケーションへのアクセス

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
```

### 3. Dockerイメージのビルドとプッシュ

```bash
# イメージのビルド
docker build -t asia-northeast1-docker.pkg.dev/<PROJECT_ID>/coupleplan-repo/coupleplan .

# イメージのプッシュ
docker push asia-northeast1-docker.pkg.dev/<PROJECT_ID>/coupleplan-repo/coupleplan
```
