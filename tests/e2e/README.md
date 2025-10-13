# E2E Tests Directory

このディレクトリには、従来のPlaywrightを使用したE2Eテストを保存します。

## 📁 ディレクトリ構造

```
tests/e2e/
├── README.md              # このファイル
├── E2E_TESTING_GUIDE.md  # E2Eテスト実装ガイド
├── global-setup.ts       # E2Eテスト前のグローバルセットアップ
├── global-teardown.ts    # E2Eテスト後のグローバルクリーンアップ
├── seed.spec.ts          # シードテスト（基本動作確認）
├── auth/                 # 認証関連テスト
│   ├── login.spec.ts    # ログインテスト
│   └── signup.spec.ts   # サインアップテスト
├── partner/              # パートナー連携テスト（予定）
│   ├── invitation.spec.ts
│   └── couple.spec.ts
└── plans/                # プラン関連テスト（予定）
    ├── create.spec.ts
    └── customize.spec.ts
```

## 🔧 環境設定

### 1. `.env.test`ファイルの作成

E2Eテストでは、`.env.test`ファイルから設定を読み込みます。

```bash
# .env.test.exampleをコピー
cp .env.test.example .env.test

# .env.testを編集して、テスト環境の設定を記入
```

### 2. `.env.test`の設定項目

```env
# テスト対象のベースURL
BASE_URL=https://coupleplan.vercel.app

# テストユーザー認証情報
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123

# パートナーユーザー（パートナー連携テスト用）
TEST_PARTNER_EMAIL=partner@example.com
TEST_PARTNER_PASSWORD=password123

# Supabase設定（必要に応じて）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# テスト設定
TEST_TIMEOUT=30000
TEST_PARALLEL_WORKERS=4
```

### 3. 環境変数の優先順位

Playwrightは以下の順序で環境変数を読み込みます：

1. `.env.test` （最優先 - E2Eテスト専用）
2. `.env.local` （ローカル開発環境）
3. `.env` （デフォルト設定）

## 🚀 テスト実行方法

### すべてのE2Eテストを実行

```bash
npx playwright test
```

### 特定のディレクトリのテストを実行

```bash
# 認証テストのみ
npx playwright test tests/e2e/auth/

# パートナー連携テストのみ
npx playwright test tests/e2e/partner/
```

### 特定のテストファイルを実行

```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### UIモードで実行（デバッグ用）

```bash
npx playwright test --ui
```

### ヘッドレスモードを無効化（ブラウザを表示）

```bash
npx playwright test --headed
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
# Playwright Inspector起動
npx playwright test --debug

# 特定のテストをデバッグ
npx playwright test tests/e2e/auth/login.spec.ts --debug
```

## 📊 テストレポート

テスト実行後、HTMLレポートを表示：

```bash
npx playwright show-report
```

レポートには以下が含まれます：

- テスト結果サマリー
- 失敗したテストのスクリーンショット
- 失敗したテストのビデオ録画
- トレース情報（デバッグ用）

## 🔧 Global Setup / Teardown

### global-setup.ts

E2Eテスト実行前に以下を実行：

- 環境変数の検証
- テスト対象URLの確認
- テスト環境の接続確認

### global-teardown.ts

E2Eテスト実行後に以下を実行：

- テストデータのクリーンアップ（将来実装）
- 一時ファイルの削除（将来実装）

## 🎯 テスト実装状況

### Week 12: Playwrightセットアップ ✅

- [x] Playwright環境構築
- [x] シードテスト作成（5/5 passed）
- [x] グローバルセットアップ/ティアダウン
- [x] `.env.test`による環境設定

### Week 13: 認証フローE2Eテスト 🚀 進行中

- [x] ログインテスト実装（11テストケース）
- [x] サインアップテスト実装（11テストケース）
- [ ] パスワードリセットテスト
- [ ] セッション管理テスト
- [ ] テスト実行と調整

### Week 14: パートナー連携E2Eテスト 📝 予定

- [ ] 招待コード生成テスト
- [ ] 招待コード検証テスト
- [ ] カップル関係確立テスト
- [ ] パートナー情報表示テスト
- [ ] エラーハンドリングテスト

### Week 15: AIプラン生成 & CI/CD統合 📝 予定

- [ ] プラン作成フローテスト
- [ ] AI生成プロセステスト
- [ ] プランカスタマイズテスト
- [ ] クロスブラウザ検証
- [ ] CI/CD統合

## 🛠️ トラブルシューティング

### テストが失敗する場合

1. `.env.test`の設定を確認
2. `BASE_URL`が正しいか確認
3. テストユーザーが存在するか確認
4. スクリーンショットとビデオを確認（`test-results/`）

### タイムアウトエラーが発生する場合

`.env.test`でタイムアウトを延長：

```env
TEST_TIMEOUT=60000  # 60秒
```

### セレクタが見つからない場合

Playwright Codegenで正しいセレクタを確認：

```bash
npx playwright codegen https://coupleplan.vercel.app/
```

## 📚 参考資料

- [Playwright公式ドキュメント](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [E2Eテスト実装ガイド](./E2E_TESTING_GUIDE.md)
- [CouplePlan作業計画](../../Docs/作業計画.md)

---

**最終更新**: 2025年10月13日  
**Week 13**: 認証フローE2Eテスト実装中
