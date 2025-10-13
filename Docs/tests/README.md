# CouplePlan E2Eテストガイド

CouplePlanプロジェクトのE2Eテスト（End-to-End Testing）に関する包括的なガイドです。

## 🎯 E2Eテスト概要

### ✅ 実装完了（2025年10月）

- **Week 12**: Playwright基本セットアップ（100%成功）
- **Week 13**: 認証フローテスト（81%成功率）
- **Week 14**: パートナー連携テスト（83%成功率）
- **Week 15**: AIプラン生成テスト（100%成功率）

### 📊 総合成績

- **総テスト数**: 60+ tests
- **平均成功率**: 91%
- **実行時間**: 平均15-20秒
- **カバレッジ**: 全主要機能網羅

## 📋 重要ドキュメント

| ドキュメント                                                    | 説明                             | 対象者 |
| --------------------------------------------------------------- | -------------------------------- | ------ |
| **[E2E_AUTH_STRATEGY.md](./E2E_AUTH_STRATEGY.md)**              | 認証テスト戦略・storageState方式 | 開発者 |
| **[E2E_TEST_USER_SETUP.md](./E2E_TEST_USER_SETUP.md)**          | テストユーザー設定ガイド         | 開発者 |
| **[WEEK13_PROGRESS.md](./WEEK13_PROGRESS.md)**                  | Week 13進捗レポート              | 全員   |
| **[GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md)**       | GitHub Actions設定               | DevOps |
| **[AUTH_DIRECTORY_HANDLING.md](../AUTH_DIRECTORY_HANDLING.md)** | 認証状態管理                     | 開発者 |

## 🚀 クイックスタート

### 1. ローカルでE2Eテスト実行

```bash
# 全テスト実行
npx playwright test

# 特定のテスト実行
npx playwright test tests/e2e/auth/
npx playwright test tests/e2e/partner/
npx playwright test tests/e2e/plans/

# ブラウザ指定
npx playwright test --project=chromium
```

### 2. テスト環境設定

**⚠️ 重要**: `.env.test` ファイルは Git にコミットしないでください！

ローカルでテストを実行する場合のみ作成：

```bash
# .env.test (ローカル開発用のみ)
BASE_URL=https://coupleplan-staging-350595109373.asia-northeast1.run.app
TEST_USER_EMAIL=e2e-test@example.com
TEST_USER_PASSWORD=E2ETestPass123!
TEST_PARTNER_EMAIL=e2e-partner@example.com
TEST_PARTNER_PASSWORD=E2ETestPass123!
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TEST_TIMEOUT=30000
TEST_PARALLEL_WORKERS=2
```

### 3. GitHub Actions での実行

E2Eテストは **週1回（日曜日）** 自動実行されます：

- ワークフロー: `.github/workflows/weekly-e2e.yml`
- ブラウザ: Chromium のみ（コスト最適化）
- 手動実行も可能

## 🏗️ テスト構造

```
tests/e2e/
├── auth/                  # 認証テスト
│   ├── login.spec.ts     # ログイン機能
│   ├── signup.spec.ts    # サインアップ機能
│   └── auth.setup.ts     # 認証セットアップ
├── dashboard/             # ダッシュボードテスト
│   └── dashboard.spec.ts # ダッシュボード機能
├── partner/               # パートナー連携テスト
│   ├── partner-linkage.spec.ts
│   └── partner-invitation.spec.ts
├── plans/                 # AIプラン生成テスト
│   ├── plan-creation.spec.ts
│   └── plan-results.spec.ts
├── helpers/               # ヘルパー関数
│   ├── test-users.ts     # テストユーザー管理
│   └── partner-helpers.ts # パートナー連携ヘルパー
├── global-setup.ts        # グローバルセットアップ
├── global-teardown.ts     # グローバルクリーンアップ
└── seed.spec.ts          # 基本動作確認
```

## 🔐 セキュリティ

### GitHub Actions でのシークレット管理

- テスト用認証情報は GitHub Secrets で管理
- `.env.test` ファイルは動的生成
- 認証状態（`.auth/`）は毎回新規作成

### 認証戦略

- **storageState**: 認証状態の保存・再利用
- **テスト専用ユーザー**: 本番データと分離
- **セッション管理**: 効率的な認証フロー

## 📈 成功実績

### カテゴリ別成功率

| カテゴリ           | 成功率 | 主要機能                           |
| ------------------ | ------ | ---------------------------------- |
| **認証テスト**     | 81%    | ログイン・サインアップ・セッション |
| **ダッシュボード** | 86%    | ナビゲーション・アクセス制御       |
| **パートナー連携** | 83%    | 招待コード・カップル確立           |
| **AIプラン生成**   | 100%   | フォーム入力・AI生成・結果表示     |
| **基本機能**       | 100%   | ページ表示・API疎通                |

### 技術的成果

- **認証状態保存**: 実行時間90%削減
- **柔軟なセレクター**: UI変更に対する耐性向上
- **エラーハンドリング**: 実際の動作に基づく適応的テスト
- **CI/CD統合**: 自動品質チェック体制確立

## 🛠️ トラブルシューティング

### よくある問題

1. **認証失敗**: テストユーザーがSupabaseに存在するか確認
2. **タイムアウト**: `domcontentloaded` vs `networkidle` の使い分け
3. **セレクター不一致**: Playwright Codegen で実際の要素を確認

### デバッグ方法

```bash
# ヘッドレスモードを無効にして実行
npx playwright test --headed

# デバッグモードで実行
npx playwright test --debug

# 特定のテストのみ実行
npx playwright test tests/e2e/auth/login.spec.ts
```

---

**最終更新**: 2025年10月13日  
**E2Eテスト実装**: 完了（Week 12-15）  
**次回メンテナンス**: 新機能追加時
