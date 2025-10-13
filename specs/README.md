# Test Specifications (テスト計画)

このディレクトリには、Playwright Agents（🎭 Planner）が生成するテスト計画（Markdown形式）を保存します。

## 📁 ディレクトリ構造

```
specs/
├── README.md              # このファイル
├── auth-flow.md          # 認証フローのテスト計画（予定）
├── partner-linkage-flow.md  # パートナー連携のテスト計画（予定）
└── ai-plan-generation-flow.md  # AIプラン生成のテスト計画（予定）
```

## 🎭 Playwright Agentsワークフロー

### 1. Planner（計画者）

- **役割**: アプリケーションを探索し、テスト計画を生成
- **入力**: ユーザーからのシナリオ要求
- **出力**: `specs/*.md` ファイル（Markdown形式のテスト計画）

### 2. Generator（生成者）

- **役割**: Markdownのテスト計画をPlaywrightテストコードに変換
- **入力**: `specs/*.md` ファイル
- **出力**: `tests/e2e/*.spec.ts` ファイル（実行可能なテスト）

### 3. Healer（修復者）

- **役割**: 失敗したテストを自動的に修復
- **入力**: 失敗したテスト名
- **出力**: 修正されたテストコード

## 📝 テスト計画の例

以下は、Plannerが生成するテスト計画の例です：

### auth-flow.md（例）

```markdown
# 認証フローテスト計画

## アプリケーション概要

CouplePlanは、カップル向けのデートプラン管理アプリケーションです。

## テストシナリオ

### 1. ログインフロー

**Seed:** `tests/seed.spec.ts`

#### 1.1 メールアドレスとパスワードでログイン

**Steps:**

1. ログインページ（/login）にアクセス
2. メールアドレスを入力
3. パスワードを入力
4. ログインボタンをクリック

**Expected Results:**

- ダッシュボード（/dashboard）へリダイレクト
- ユーザー名が表示される
```

## 🚀 使い方

### Step 1: Plannerでテスト計画を生成

1. VS Code Chat（または対応AI）で🎭 Plannerモードを選択
2. シナリオを提示:
   ```
   Generate a plan for authentication flow:
   - Login with email/password
   - Signup flow
   - Password reset
   ```
3. Plannerが`specs/auth-flow.md`を生成

### Step 2: Generatorでテストコードを生成

1. 🎭 Generatorモードを選択
2. テスト計画を指定:
   ```
   Generate tests from specs/auth-flow.md
   ```
3. Generatorが`tests/e2e/auth-flow.spec.ts`を生成

### Step 3: テスト実行と修復

1. テスト実行:
   ```bash
   npx playwright test tests/e2e/auth-flow.spec.ts
   ```
2. 失敗したテストがある場合、🎭 Healerモードを選択:
   ```
   Heal the failing test: auth-flow.spec.ts
   ```

## 📚 参考資料

- [Playwright Agents公式ドキュメント](https://playwright.dev/docs/test-agents)
- [CouplePlan作業計画](../Docs/作業計画.md)
- [CouplePlanテスト計画](../Docs/TEST_PLAN.md)

## 🎯 今後のテスト計画

### Week 13: 🎭 Planner

- [ ] 認証フローテスト計画
- [ ] パートナー連携テスト計画
- [ ] AIプラン生成テスト計画

### Week 14: 🎭 Generator

- [ ] 認証フローE2Eテスト生成
- [ ] パートナー連携E2Eテスト生成
- [ ] AIプラン生成E2Eテスト生成

### Week 15: 🎭 Healer

- [ ] テスト実行と自動修復
- [ ] クロスブラウザ検証
- [ ] CI/CD統合
