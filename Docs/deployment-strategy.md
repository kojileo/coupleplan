# CouplePlan デプロイ戦略

## 概要

CouplePlanプロジェクトでは、シンプルで効率的なCI/CDパイプラインを採用しています。GitHub ActionsとGoogle Cloud Runを使用した自動デプロイメントシステムにより、品質を保ちながら迅速なリリースを実現しています。

## ブランチ戦略

```mermaid
graph LR
    A[feature/*] --> B[develop]
    B --> C[main]
    C --> D[Production Deploy]
```

### ブランチの役割

- **feature/\***: 機能開発ブランチ
- **develop**: 開発統合ブランチ（CI実行）
- **main**: 本番リリースブランチ（CD実行）

## CI/CD パイプライン

### 🔄 CI（継続的インテグレーション）

**トリガー**: `develop`ブランチへのpush/PR

#### ワークフロー構成

1. **Lint**

   - ESLint/Prettierによるコード品質チェック
   - コーディング規約の遵守確認

2. **Unit Tests**

   - ユニットテストの実行
   - テスト結果のHTML/XMLレポート生成
   - テスト結果の自動コメント投稿

3. **Integration Tests**
   - 統合テストの実行
   - カバレッジレポートの生成

#### 実行環境

- **OS**: Ubuntu Latest
- **Node.js**: v20
- **タイムゾーン**: Asia/Tokyo
- **並列実行**: lint完了後、unit-testsとintegration-testsが並列実行

### 🚀 CD（継続的デプロイメント）

**トリガー**: `main`ブランチへのpush

#### デプロイフロー

1. **認証**

   - Google Cloud Workload Identity Federation
   - セキュアな認証情報管理

2. **コンテナビルド**

   - Dockerイメージのビルド
   - Google Container Registryへのpush
   - 環境変数の注入

3. **デプロイ**
   - Google Cloud Runへの直接デプロイ
   - ダウンタイムなしの自動切り替え

## インフラ構成

### Google Cloud Platform

- **プロジェクト**: `serious-bearing-460203-r6`
- **リージョン**: `asia-northeast1`
- **サービス**: Cloud Run
- **レジストリ**: Artifact Registry

### 環境変数

#### ビルド時変数

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
RESEND_API_KEY
ADMIN_EMAIL
FROM_EMAIL
```

#### 実行時変数

同じ環境変数がCloud Runサービスに設定されます

## セキュリティ

### 認証方式

- **Workload Identity Federation**: パスワードレス認証
- **GitHub Secrets**: 機密情報の安全な管理
- **サービスアカウント**: 最小権限の原則

### アクセス制御

- Cloud Runサービスは認証不要で公開
- 内部APIは認証済みユーザーのみアクセス可能

## 監視・ログ

### GitHub Actions

- **ワークフローログ**: 各ステップの詳細ログ
- **テストレポート**: 自動生成されるHTML/XMLレポート
- **アーティファクト**: テスト結果の保持（7-14日）

### Google Cloud

- **Cloud Run ログ**: アプリケーションログ
- **Cloud Monitoring**: メトリクス監視
- **Error Reporting**: エラー追跡

## デプロイ手順

### 通常リリース

1. **機能開発**

   ```bash
   git checkout -b feature/new-feature
   # 開発作業
   git push origin feature/new-feature
   ```

2. **開発環境統合**

   ```bash
   git checkout develop
   git merge feature/new-feature
   git push origin develop
   # → CI実行
   ```

3. **本番リリース**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   # → CD実行（自動デプロイ）
   ```

### 緊急修正

現在の構成では緊急修正用の特別なフローは設定されていません。通常のフローを使用して迅速に対応します。

## トラブルシューティング

### よくある問題

#### CI失敗時

1. **Lintエラー**: コード品質の修正
2. **テスト失敗**: テストコードまたは実装の修正
3. **依存関係**: `npm install`の実行

#### CD失敗時

1. **認証エラー**: Secrets設定の確認
2. **ビルドエラー**: 環境変数の確認
3. **デプロイエラー**: Cloud Runサービスの状態確認

### 復旧手順

#### Cloud Runからの手動復旧

```bash
# 前のリビジョンへのロールバック
gcloud run services update-traffic coupleplan \
  --region=asia-northeast1 \
  --to-revisions=PREVIOUS_REVISION=100
```

## 改善の機会

現在のシンプルな構成は安定していますが、以下の改善を検討できます：

### 短期的改善

- **ヘルスチェック**: デプロイ後の自動確認
- **通知機能**: Slack/メール通知
- **環境分離**: ステージング環境の追加

### 長期的改善

- **セキュリティスキャン**: 依存関係脆弱性チェック
- **E2Eテスト**: ブラウザ自動化テスト
- **パフォーマンス監視**: Lighthouse CI

## パフォーマンス指標

### 現在の指標

- **CI実行時間**: 約5-10分
- **CD実行時間**: 約3-5分
- **デプロイ頻度**: 手動（main pushベース）
- **復旧時間**: 手動対応

### 目標指標

- **CI実行時間**: 5分以内
- **CD実行時間**: 3分以内
- **デプロイ頻度**: 週1-2回
- **復旧時間**: 15分以内

## 連絡先・サポート

### GitHub Actions

- **ワークフロー**: `.github/workflows/`
- **ログ**: GitHub Actionsタブ
- **設定**: リポジトリSettings > Secrets

### Google Cloud

- **コンソール**: [Google Cloud Console](https://console.cloud.google.com/)
- **プロジェクト**: `serious-bearing-460203-r6`
- **サポート**: [Cloud Run ドキュメント](https://cloud.google.com/run/docs)

---

_最終更新: 2024年12月_
