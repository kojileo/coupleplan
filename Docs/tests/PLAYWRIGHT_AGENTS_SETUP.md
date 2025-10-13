# Playwright Agents セットアップ完了ガイド

このドキュメントは、Week 12で完了したPlaywright Agentsのセットアップ内容をまとめたものです。

## ✅ セットアップ完了項目

### 1. **Playwright Agents初期化** ✅

```bash
npx playwright init-agents --loop=vscode
```

**生成されたファイル**:

- `.github/chatmodes/🎭 planner.chatmode.md` - テスト計画生成エージェント
- `.github/chatmodes/🎭 generator.chatmode.md` - テストコード生成エージェント
- `.github/chatmodes/🎭 healer.chatmode.md` - テスト修復エージェント
- `.vscode/mcp.json` - MCP（Model Context Protocol）設定

### 2. **ディレクトリ構造** ✅

```
coupleplan/
├── specs/                          # テスト計画（Markdown）
│   └── README.md                   # テスト計画ガイド
├── tests/
│   └── e2e/                        # E2Eテスト
│       ├── README.md               # E2Eテストガイド
│       ├── global-setup.ts         # グローバルセットアップ
│       ├── global-teardown.ts      # グローバルクリーンアップ
│       └── seed.spec.ts            # シードテスト（Agents参照用）
├── playwright.config.ts            # Playwright設定
└── .github/chatmodes/              # エージェント定義
    ├── 🎭 planner.chatmode.md
    ├── 🎭 generator.chatmode.md
    └── 🎭 healer.chatmode.md
```

### 3. **シードテスト作成** ✅

**ファイル**: `tests/e2e/seed.spec.ts`

**役割**:

- Playwright Agentsが参照するサンプルテスト
- アプリケーションの基本動作パターンを提供
- 認証フロー、ナビゲーション、APIテストの例

**テスト結果**:

```
✅ 5 passed (14.0s)
   - アプリケーションが正常に起動する
   - ホームページの基本要素が表示される
   - ログインページへのナビゲーション
   - サインアップページへのナビゲーション
   - APIヘルスチェック
```

### 4. **グローバルセットアップ** ✅

**ファイル**: `tests/e2e/global-setup.ts`

**機能**:

- 環境変数の検証
- 開発サーバーの起動確認
- ヘルスチェックAPI確認

**出力例**:

```
🚀 E2E Global Setup: Starting...
✅ Environment variables validated
🌐 Base URL: http://localhost:3000
⏳ Waiting for development server...
✅ Development server is ready
🎉 E2E Global Setup: Complete!
```

### 5. **Playwright設定最適化** ✅

**ファイル**: `playwright.config.ts`

**追加機能**:

- dotenv統合（環境変数読み込み）
- グローバルセットアップ/ティアダウン設定
- クロスブラウザ設定（Chromium, Firefox, WebKit）
- モバイルビューポート設定
- 日本語ロケール設定（ja-JP, Asia/Tokyo）

## 🎭 エージェントの使い方

### 🎭 Planner（テスト計画生成）

**目的**: アプリを探索してテスト計画を生成

**使用方法**:

1. VS Code Chatで🎭 Plannerモードを選択
2. シナリオを提示:
   ```
   Generate a plan for authentication flow:
   - Login with email/password
   - Signup with email verification
   - Password reset flow
   ```
3. Plannerが`specs/auth-flow.md`を生成

**出力**: Markdown形式のテスト計画

### 🎭 Generator（テストコード生成）

**目的**: Markdownのテスト計画をPlaywrightテストに変換

**使用方法**:

1. VS Code Chatで🎭 Generatorモードを選択
2. テスト計画を指定:
   ```
   Generate tests from specs/auth-flow.md
   ```
3. Generatorが`tests/e2e/auth-flow.spec.ts`を生成

**出力**: 実行可能なPlaywrightテスト

### 🎭 Healer（テスト修復）

**目的**: 失敗したテストを自動デバッグ・修復

**使用方法**:

1. VS Code Chatで🎭 Healerモードを選択
2. 失敗したテストを指定:
   ```
   Heal the failing test: auth-flow.spec.ts
   ```
3. Healerがテストをデバッグして修復

**出力**: 修正されたテストコード

## 📊 テスト実行コマンド

### すべてのE2Eテストを実行

```bash
npx playwright test
```

### 特定のテストファイルを実行

```bash
npx playwright test tests/e2e/seed.spec.ts
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

### UIモードで実行（インタラクティブ）

```bash
npx playwright test --ui
```

### デバッグモードで実行

```bash
npx playwright test --debug
```

### HTMLレポート表示

```bash
npx playwright show-report
```

## 🚀 次のステップ（Week 13-15）

### Week 13: 🎭 Planner（3-4日）

**タスク**:

- [ ] 認証フローテスト計画生成
  - ログイン → ダッシュボード
  - サインアップ → プロフィール設定
  - パスワードリセット
- [ ] パートナー連携テスト計画生成
  - 招待コード生成 → 検証
  - カップル関係確立
  - パートナー情報同期
- [ ] AIプラン生成テスト計画生成
  - プラン作成 → 生成 → カスタマイズ
  - プラン保存・読み込み
  - AI API統合

**成果物**: `specs/*.md`（3ファイル）

### Week 14: 🎭 Generator（3-4日）

**タスク**:

- [ ] 認証フローE2Eテスト生成
- [ ] パートナー連携E2Eテスト生成
- [ ] AIプラン生成E2Eテスト生成
- [ ] セレクタ検証と調整

**成果物**: `tests/e2e/*.spec.ts`（3ファイル）

### Week 15: 🎭 Healer（3-4日）

**タスク**:

- [ ] 全E2Eテスト実行
- [ ] 失敗テストの自動修復
- [ ] クロスブラウザ検証（Chromium, Firefox, WebKit）
- [ ] CI/CD統合（`.github/workflows/e2e-test.yml`）
- [ ] パフォーマンス最適化

**目標**: E2E成功率 ≥ 95%、実行時間 < 5分

## 📚 参考資料

- [Playwright公式ドキュメント](https://playwright.dev)
- [Playwright Agents公式](https://playwright.dev/docs/test-agents)
- [CouplePlan作業計画](../作業計画.md)
- [CouplePlanテスト計画](../TEST_PLAN.md)

## 🎯 品質目標

| メトリクス         | 目標値     | 現状        |
| ------------------ | ---------- | ----------- |
| E2Eテスト成功率    | ≥ 95%      | 100% (5/5)  |
| テスト実行時間     | < 5分      | 14秒        |
| クロスブラウザ対応 | 3ブラウザ  | Chromium ✅ |
| モバイル対応       | 2デバイス  | 未実装      |
| カバレッジ（E2E）  | 主要フロー | シードのみ  |

## ✅ Week 12 完了チェックリスト

- [x] Playwright Agents初期化完了
- [x] エージェント定義生成（Planner, Generator, Healer）
- [x] ディレクトリ構造準備（specs/, tests/e2e/）
- [x] シードテスト作成と動作確認
- [x] グローバルセットアップ/ティアダウン実装
- [x] 環境変数の読み込み設定
- [x] Chromiumブラウザインストール
- [x] 全テストパス確認（5/5 passed）
- [x] ドキュメント整備（README, ガイド）

**Week 12 ステータス**: ✅ **完了** （2025年10月13日）

---

**次のアクション**: Week 13の🎭 Plannerを使ったテスト計画生成に進む準備が整いました！
