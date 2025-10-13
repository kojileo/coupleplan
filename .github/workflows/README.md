# GitHub Actions ワークフロー構成

このディレクトリには、CouplePlan プロジェクトの CI/CD ワークフローが含まれています。

## 📋 ワークフロー一覧

### 🔍 **pr-test.yml** - プルリクエストテスト

**トリガー**: PR作成時（main, develop ブランチ向け）

**目的**: コードレビュー前の品質保証

**実行内容**:

- ESLint（コード品質チェック）
- TypeScript 型チェック
- Unit Tests（単体テスト）
- Integration Tests（統合テスト）
- カバレッジレポート生成・アップロード

**重要**: このワークフローでテストを通過しないとマージできません。

---

### 🚀 **deploy.yml** - 本番・ステージングデプロイ

**トリガー**:

- `develop` ブランチへのプッシュ → Staging 環境
- `main` ブランチへのプッシュ → Production 環境

**目的**: Google Cloud Run への自動デプロイ

**実行内容**:

1. Docker イメージのビルド
2. Artifact Registry へのプッシュ
3. Cloud Run へのデプロイ
4. デプロイ後のヘルスチェック

**注意**:

- テストは実行しません（PR時に既に実行済み）
- Workload Identity Federation を使用した安全な認証
- Dockerビルドテストも統合済み（重複排除）

**環境設定**:

- **Staging**: min-instances=0, max-instances=3, memory=512Mi
- **Production**: min-instances=0, max-instances=10, memory=1Gi

---

### 🔒 **security-scan.yml** - 週次セキュリティスキャン

**トリガー**: 毎週日曜日 0:00 JST（自動）+ 手動実行可能

**目的**: 運用中のイメージの脆弱性監視

**実行内容**:

1. GCR からイメージを取得
2. Trivy による包括的スキャン（CRITICAL, HIGH, MEDIUM）
3. GitHub Security タブへの結果アップロード
4. レポートのアーティファクト保存（30日間）

---

### 📅 **weekly-e2e.yml** - 週次E2Eテスト

**トリガー**: 毎週日曜日 0:00 JST（自動）+ 手動実行可能

**目的**: 週次の包括的テストとパフォーマンス監視（コスト最適化）

**実行内容**:

1. **E2E テスト（最小限）**
   - Chromium のみ（コスト削減）
   - シャード分割による並列実行（2シャード）
2. **パフォーマンステスト**
   - Lighthouse CI によるスコア測定
   - 主要ページ（トップ、ダッシュボード、ログイン）

3. **Cloud Run ヘルスチェック**
   - サービスステータス確認
   - トラフィック分散状況の確認

**変更点**: 毎日→週1回、全ブラウザ→Chromiumのみ、3シャード→2シャード

---

## 🔄 CI/CD フロー

```
┌─────────────────┐
│  開発者がコード  │
│   をプッシュ     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PR作成         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  pr-test.yml 実行       │
│  ✓ Lint & Type Check    │
│  ✓ Unit Tests           │
│  ✓ Integration Tests    │
└────────┬────────────────┘
         │
         │ ✅ すべて成功
         ▼
┌─────────────────┐
│  コードレビュー  │
│  承認＆マージ    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
develop     main
    │         │
    ▼         ▼
Staging   Production
デプロイ   デプロイ
(deploy.yml)
```

## 🎯 ベストプラクティス

### ✅ DO（推奨）

- PR作成前にローカルでテストを実行
- PR が green（すべてのチェック成功）になってからマージ
- デプロイ後は必ずヘルスチェックを確認
- セキュリティスキャン結果を定期的にレビュー

### ❌ DON'T（非推奨）

- テスト失敗中のPRをマージしない
- デプロイワークフローを手動でスキップしない
- セキュリティ警告を無視しない

## 🛠️ トラブルシューティング

### テストが失敗する場合

1. ローカルで同じテストを実行: `npm run test:unit`
2. TypeScript エラーを確認: `npx tsc --noEmit`
3. Lint エラーを修正: `npm run lint`

### デプロイが失敗する場合

1. Docker ビルドログを確認
2. Cloud Run のログを確認: `gcloud run services logs read <service-name>`
3. シークレット/環境変数の設定を確認

### Actions のバージョン

すべてのワークフローで以下のバージョンを使用：

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`
- `google-github-actions/auth@v2`
- `google-github-actions/setup-gcloud@v2`
- `docker/setup-buildx-action@v3`
- `docker/build-push-action@v6`

## 📊 コスト最適化

### Cloud Run 設定

- **min-instances=0**: アイドル時のコストゼロ
- コールドスタート許容範囲: 数秒
- トラフィックに応じた自動スケーリング

### GitHub Actions 使用量

- PR時のみ完全なテスト実行
- デプロイ時はテストをスキップ（重複排除）
- E2Eテストは週1回のみ（コスト削減）
- Chromiumのみでテスト（クロスブラウザ削減）
- マトリックスジョブの並列実行で時間短縮

## 🔐 セキュリティ

### 認証方式

- **Workload Identity Federation**: 推奨（キーレス認証）
- **Service Account Key**: 一部のワークフローで使用（要移行検討）

### シークレット管理

- GitHub Secrets で管理
- 環境ごとに分離（staging/production）
- 定期的なローテーション推奨

---

**最終更新**: 2025-10-13
**メンテナンス**: GitHub Actions のバージョンは四半期ごとに確認・更新

## 📝 変更履歴

### 2025-10-13: ワークフロー最適化

- **削除**: `e2e-test.yml`, `e2e-nightly.yml`, `docker-test.yml`（重複排除）
- **変更**: `nightly.yml` → `weekly-e2e.yml`（週次実行、Chromiumのみ、2シャード）
- **理由**: コスト削減、E2E実行頻度の最適化
