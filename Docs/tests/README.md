# CouplePlan テストドキュメント

## 📚 ドキュメント一覧

このディレクトリには、CouplePlanプロジェクトのテスト関連ドキュメントが含まれています。

### メインドキュメント

| ドキュメント                                       | 説明                                                             | 対象者         |
| -------------------------------------------------- | ---------------------------------------------------------------- | -------------- |
| **[TEST_PLAN.md](../TEST_PLAN.md)**                | メインテスト計画書<br>全体戦略、スコープ、品質目標               | 全員           |
| **[TEST_STRATEGY.md](./TEST_STRATEGY.md)**         | テスト戦略詳細<br>各テストレベルの実装方法、ベストプラクティス   | 開発者         |
| **[TEST_CASES.md](./TEST_CASES.md)**               | テストケース集<br>画面別・機能別の具体的なテストケース           | QA, 開発者     |
| **[TEST_ENVIRONMENTS.md](./TEST_ENVIRONMENTS.md)** | テスト環境設定ガイド<br>環境セットアップ、トラブルシューティング | 開発者, DevOps |
| **[DOCKER_TEST.md](./DOCKER_TEST.md)**             | Dockerテスト戦略<br>Cloud Run対応、コンテナテスト、セキュリティ  | 開発者, DevOps |
| **[CI_CD_WORKFLOWS.md](./CI_CD_WORKFLOWS.md)**     | CI/CDワークフロー<br>GitHub Actions設定、デプロイ自動化          | DevOps         |

---

## 🚀 クイックスタート

### 初めてテストを実行する場合

1. **環境セットアップ**

   ```bash
   # 依存関係インストール
   npm install

   # 環境変数設定
   cp .env.local.example .env.local
   # .env.localを編集

   # Playwrightインストール
   npx playwright install --with-deps
   ```

2. **テスト実行**

   ```bash
   # 全テスト実行
   npm run test:all

   # または個別に
   npm run test:unit          # 単体テスト
   npm run test:integration   # 統合テスト
   npm run test:e2e          # E2Eテスト
   ```

3. **レポート確認**

   ```bash
   # カバレッジレポート
   npm run test:coverage
   open coverage/index.html

   # E2Eテストレポート
   npm run test:e2e:report
   ```

詳細は [TEST_ENVIRONMENTS.md](./TEST_ENVIRONMENTS.md) を参照してください。

---

## 📖 ドキュメント利用ガイド

### 役割別おすすめの読み方

#### プロダクトオーナー / マネージャー

1. [TEST_PLAN.md](../TEST_PLAN.md) のエグゼクティブサマリー
   - 品質目標とKPI
   - リリース判定基準
   - リスク管理

2. テストスケジュールとマイルストーン

#### 開発者（初めてのテスト実装）

1. [TEST_ENVIRONMENTS.md](./TEST_ENVIRONMENTS.md)
   - ローカル環境セットアップ
   - テストコマンド一覧

2. [TEST_STRATEGY.md](./TEST_STRATEGY.md)
   - テストピラミッド
   - 単体テストの書き方
   - ベストプラクティス

3. [TEST_CASES.md](./TEST_CASES.md)
   - テストケーステンプレート
   - 具体例

#### 開発者（既存テストの拡張）

1. [TEST_STRATEGY.md](./TEST_STRATEGY.md)
   - テストパターン集
   - モック戦略
   - 非機能テスト

2. [TEST_CASES.md](./TEST_CASES.md)
   - 該当機能のテストケース

#### DevOpsエンジニア

1. [TEST_ENVIRONMENTS.md](./TEST_ENVIRONMENTS.md)
   - CI/CD環境セットアップ
   - Cloud Run設定
   - Secret Manager管理

2. [DOCKER_TEST.md](./DOCKER_TEST.md)
   - Dockerビルドテスト
   - セキュリティスキャン
   - 性能最適化

#### QAエンジニア

1. [TEST_PLAN.md](../TEST_PLAN.md) 全体
2. [TEST_CASES.md](./TEST_CASES.md) 全体
3. [TEST_ENVIRONMENTS.md](./TEST_ENVIRONMENTS.md)
   - Staging環境
   - テストデータ管理

---

## 🎯 テストの種類と実行方法

### 静的解析（L0）

```bash
# Lint
npm run lint

# 型チェック
npx tsc --noEmit
```

**目的**: コード品質の基本保証  
**実行タイミング**: コミット前、PR作成時  
**詳細**: [TEST_STRATEGY.md § 2.1](./TEST_STRATEGY.md#21-単体テスト戦略)

### 単体テスト（L1）

```bash
# 全単体テスト
npm run test:unit

# ウォッチモード
npm run test:watch

# カバレッジ
npm run test:coverage
```

**目的**: 個別関数・コンポーネントの動作検証  
**カバレッジ目標**: 80%以上  
**詳細**: [TEST_STRATEGY.md § 2.1](./TEST_STRATEGY.md#21-単体テスト戦略)

### 統合テスト（L2）

```bash
# 統合テスト
npm run test:integration
```

**目的**: モジュール間連携、API統合の検証  
**カバレッジ目標**: 70%以上  
**詳細**: [TEST_STRATEGY.md § 2.2](./TEST_STRATEGY.md#22-統合テスト戦略)

### E2Eテスト（L3）

```bash
# 全ブラウザ
npm run test:e2e

# Chromiumのみ
npm run test:e2e:chromium

# デバッグモード
npm run test:e2e:debug

# UIモード
npm run test:e2e:ui
```

**目的**: エンドツーエンドの業務フロー検証  
**カバレッジ目標**: クリティカルパス 100%  
**詳細**: [TEST_STRATEGY.md § 2.3](./TEST_STRATEGY.md#23-e2eテスト戦略)

### 契約テスト（L4）

```bash
# 契約テスト
npm run test:cdc

# Pactのみ
npm run test:cdc:pact
```

**目的**: マイクロサービス間の契約整合性検証  
**詳細**: [TEST_STRATEGY.md § 2.4](./TEST_STRATEGY.md#24-契約テスト)

### 性能テスト（L5）

```bash
# Lighthouse
npx lighthouse https://coupleplan-xxx.a.run.app --output html

# Cloud Run固有のテスト
gcloud run services describe coupleplan-staging --region=asia-northeast1
```

**目的**: パフォーマンスの検証  
**詳細**: [TEST_STRATEGY.md § 6.1](./TEST_STRATEGY.md#61-性能テスト)

### Docker・インフラテスト

```bash
# Dockerビルドテスト
docker build -t coupleplan:test .

# セキュリティスキャン
trivy image coupleplan:test

# Cloud Runデプロイテスト
gcloud run deploy coupleplan-staging --image gcr.io/PROJECT_ID/coupleplan:test
```

**目的**: コンテナ品質保証、Cloud Run統合検証  
**詳細**: [DOCKER_TEST.md](./DOCKER_TEST.md)

### セキュリティテスト（L6）

**手動実行**（四半期ごと）

**目的**: セキュリティ脆弱性の検出  
**詳細**: [TEST_STRATEGY.md § 6.2](./TEST_STRATEGY.md#62-セキュリティテスト)

---

## 📊 品質メトリクス

### 現在のステータス

| メトリクス       | 目標値   | 現在値 | ステータス  |
| ---------------- | -------- | ------ | ----------- |
| コードカバレッジ | ≥ 80%    | TBD    | 🔄 測定予定 |
| E2E成功率        | ≥ 95%    | TBD    | 🔄 測定予定 |
| バグ密度         | < 1/KLOC | TBD    | 🔄 測定予定 |
| フレーク率       | < 5%     | TBD    | 🔄 測定予定 |

### カバレッジレポート

```bash
# 最新のカバレッジレポート生成
npm run test:coverage

# レポート確認
open coverage/index.html
```

---

## 🐛 テスト失敗時の対応

### 1. ローカルで再現を試みる

```bash
# 該当テストのみ実行
npm run test -- path/to/test.test.ts

# デバッグモード
npm run test:e2e:debug -- path/to/test.spec.ts
```

### 2. ログを確認

- Jest: コンソール出力
- Playwright: `playwright-report/index.html`
- CI: GitHub Actions ログ

### 3. トラブルシューティング

[TEST_ENVIRONMENTS.md § 6](./TEST_ENVIRONMENTS.md#6-トラブルシューティング) を参照

### 4. それでも解決しない場合

- GitHub Issueを作成
- テスト計画書にフィードバック

---

## 🔄 CI/CD統合

### GitHub Actionsワークフロー

| トリガー       | ワークフロー        | テスト範囲                    | 実行時間 |
| -------------- | ------------------- | ----------------------------- | -------- |
| Pull Request   | `pr-test.yml`       | Lint + Unit + Integration     | < 5分    |
| Merge to main  | `main-test.yml`     | Full Suite + Cloud Run Deploy | < 25分   |
| Nightly        | `nightly.yml`       | Full Suite + Performance      | < 30分   |
| Weekly         | `security-scan.yml` | Docker Security Scan (Trivy)  | < 10分   |
| Dockerfile変更 | `docker-test.yml`   | Docker Build + Container Test | < 10分   |

詳細: [TEST_ENVIRONMENTS.md § 3](./TEST_ENVIRONMENTS.md#3-ci環境セットアップ)

---

## 📝 テストケース追加の流れ

### 新機能開発時

1. **テストケース設計**
   - [TEST_CASES.md](./TEST_CASES.md) のテンプレートを使用
   - 正常系・異常系・境界値を網羅

2. **単体テスト実装**
   - TDD（Test-Driven Development）推奨
   - AAA（Arrange-Act-Assert）パターン

3. **統合テスト実装**
   - API連携がある場合
   - MSWでモック化

4. **E2Eテスト実装**
   - クリティカルパスの場合のみ
   - Page Object Modelパターン使用

5. **レビュー**
   - テストコードもレビュー対象
   - カバレッジ確認

6. **ドキュメント更新**
   - [TEST_CASES.md](./TEST_CASES.md) にテストケース追加

詳細: [TEST_STRATEGY.md § 3](./TEST_STRATEGY.md#3-ベストプラクティス)

---

## 🛠️ よく使うコマンド

```bash
# セットアップ
npm install
npm run db:setup
npm run seed:local

# 開発
npm run dev
npm run build

# テスト（全て）
npm run test:all

# テスト（個別）
npm run test:unit
npm run test:integration
npm run test:e2e

# カバレッジ
npm run test:coverage

# Lint
npm run lint
npm run lint:fix

# 型チェック
npx tsc --noEmit

# データ管理
npm run seed:local
npm run staging:reset
```

---

## 🔗 関連リンク

### プロジェクトドキュメント

- [ビジネス要件定義書](../design/ビジネス要件定義書.md)
- [マイクロサービスアプリケーション定義書](../design/マイクロサービスアプリケーション定義書.md)
- [画面一覧・遷移図](../design/画面一覧・遷移図.md)
- [開発計画](../開発計画.md)

### 外部リソース

- [Jest公式ドキュメント](https://jestjs.io/docs/getting-started)
- [Playwright公式ドキュメント](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)
- [MSW](https://mswjs.io/docs/)
- [Cloud Run公式ドキュメント](https://cloud.google.com/run/docs)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [Trivy](https://aquasecurity.github.io/trivy/)

---

## 📞 サポート

### 質問・フィードバック

- GitHub Issues: バグ報告、機能要望
- GitHub Discussions: 質問、ディスカッション
- Slack: #testing チャンネル（社内）

### ドキュメント改善

このドキュメントへの改善提案は歓迎です！

1. Issueを作成
2. Pull Requestを送信
3. レビュー後にマージ

---

**最終更新**: 2025年10月11日  
**メンテナー**: 開発チーム  
**バージョン**: 1.0.0
