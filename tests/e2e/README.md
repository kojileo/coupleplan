# E2E Tests Directory

このディレクトリには、Playwright Agents（🎭 Generator）が生成するE2Eテストを保存します。

## 📁 ディレクトリ構造

```
tests/e2e/
├── README.md              # このファイル
├── global-setup.ts       # E2Eテスト前のグローバルセットアップ
├── global-teardown.ts    # E2Eテスト後のグローバルクリーンアップ
├── auth-flow.spec.ts     # 認証フローE2Eテスト（予定）
├── partner-linkage-flow.spec.ts  # パートナー連携E2Eテスト（予定）
└── ai-plan-generation-flow.spec.ts  # AIプラン生成E2Eテスト（予定）
```

## 🎭 Playwright Agentsによる生成

これらのE2Eテストは、Playwright Agents（🎭 Generator）によって自動生成されます。

### 生成プロセス

1. **テスト計画作成**（🎭 Planner）
   - `specs/auth-flow.md` などのMarkdownファイルを生成

2. **テストコード生成**（🎭 Generator）
   - Markdownファイルを読み込み
   - 実際にブラウザで操作を実行
   - 動作するPlaywrightテストコードを生成
   - このディレクトリに`.spec.ts`ファイルを保存

3. **テスト修復**（🎭 Healer）
   - 失敗したテストを自動的にデバッグ
   - コードを修正して再実行

## 🚀 テスト実行方法

### すべてのE2Eテストを実行

```bash
npx playwright test
```

### 特定のテストファイルを実行

```bash
npx playwright test tests/e2e/auth-flow.spec.ts
```

### UIモードで実行（インタラクティブ）

```bash
npx playwright test --ui
```

### 特定のブラウザで実行

```bash
# Chromiumのみ
npx playwright test --project=chromium

# Firefoxのみ
npx playwright test --project=firefox

# WebKitのみ
npx playwright test --project=webkit
```

### デバッグモードで実行

```bash
npx playwright test --debug
```

### ヘッドレスモードを無効化（ブラウザを表示）

```bash
npx playwright test --headed
```

## 📊 テストレポート

テスト実行後、HTMLレポートを表示：

```bash
npx playwright show-report
```

## 🔧 Global Setup / Teardown

### global-setup.ts

E2Eテスト実行前に以下を実行：

- 環境変数の検証
- 開発サーバーの起動確認
- ヘルスチェック

### global-teardown.ts

E2Eテスト実行後に以下を実行：

- テストデータのクリーンアップ（将来実装）
- 一時ファイルの削除（将来実装）

## 🎯 テスト実装状況

- [ ] **Week 12**: セットアップ完了 ✅（このファイル作成時点）
- [ ] **Week 13**: 🎭 Plannerでテスト計画生成
- [ ] **Week 14**: 🎭 Generatorでテストコード生成
- [ ] **Week 15**: 🎭 Healerでテスト修復と最適化

## 📚 参考資料

- [Playwright公式ドキュメント](https://playwright.dev)
- [Playwright Agents](https://playwright.dev/docs/test-agents)
- [シードテスト](../seed.spec.ts) - Agentsの参照用
- [テスト計画](../../specs/README.md)
