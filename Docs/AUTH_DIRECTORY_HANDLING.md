# `.auth` ディレクトリの GitHub Actions での扱い

## 🔐 `.auth` ディレクトリとは

`.auth` ディレクトリは Playwright の `storageState` 機能で生成される認証状態ファイルを保存する場所です：

```
.auth/
├── user.json      # メインテストユーザーの認証状態
├── partner.json   # パートナーユーザーの認証状態
└── .gitkeep       # ディレクトリを Git で管理するため
```

## 🚨 重要なセキュリティ考慮事項

### ❌ 絶対にやってはいけないこと

```bash
# これらのファイルをGitにコミットしてはいけません
git add .auth/user.json
git add .auth/partner.json
```

### ✅ 正しい設定

```bash
# .gitignore に追加済み
/.auth/
!/.auth/.gitkeep
```

## 🔄 GitHub Actions での `.auth` ディレクトリの動作

### 1. **各実行で新しい環境**

GitHub Actions の各ジョブは完全に新しい仮想環境で実行されるため：

- `.auth` ディレクトリは空の状態で開始
- 認証状態ファイルは毎回新しく生成される
- 前回の実行結果は保持されない

### 2. **認証セットアップの流れ**

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
    # .auth/.gitkeep のみが存在

  - name: Install dependencies
    run: npm ci

  - name: Install Playwright browsers
    run: npx playwright install --with-deps chromium

  - name: Run E2E tests
    run: npm run test:e2e
    # auth.setup.ts が実行され、.auth/user.json と .auth/partner.json が生成される
```

### 3. **認証セットアップのタイミング**

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    // セットアップ専用プロジェクト
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // メインテスト（セットアップに依存）
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json', // セットアップで生成されたファイルを使用
      },
      dependencies: ['setup'], // セットアップ完了後に実行
    },
  ],
});
```

## 🔧 GitHub Actions での最適化

### 1. **認証状態のキャッシュ（推奨しない）**

```yaml
# ❌ セキュリティリスクがあるため推奨しない
- name: Cache auth state
  uses: actions/cache@v4
  with:
    path: .auth/
    key: auth-${{ hashFiles('tests/e2e/auth.setup.ts') }}
```

**理由**: 認証トークンが GitHub Actions のキャッシュに保存されるセキュリティリスク

### 2. **毎回新しい認証（推奨）**

```yaml
# ✅ 推奨：毎回新しい認証を行う
- name: Run E2E tests
  run: npm run test:e2e
  # auth.setup.ts が毎回実行され、新しい認証状態を生成
```

**利点**:

- セキュリティが高い
- 認証フローのテストも含まれる
- トークンの有効期限切れを回避

## 📊 パフォーマンスへの影響

### 認証セットアップの時間

- **初回認証**: 約3-5秒
- **テスト実行**: 約10-20秒
- **合計オーバーヘッド**: 約15-25秒

### コスト対効果

```
セキュリティ > パフォーマンス
```

毎回新しい認証を行うことで、セキュリティを最優先にしています。

## 🛠️ トラブルシューティング

### 1. **認証ファイルが見つからないエラー**

```
Error: ENOENT: no such file or directory, open '.auth/user.json'
```

**解決策**:

```yaml
# セットアップが正しく実行されているか確認
- name: Debug auth files
  run: |
    ls -la .auth/
    echo "Setup project completed: $?"
```

### 2. **認証が失敗する**

```
Error: Authentication failed for user: e2e-test@example.com
```

**解決策**:

1. GitHub Secrets の設定を確認
2. テストユーザーがSupabaseに存在するか確認
3. パスワードが正しいか確認

### 3. **並列実行での競合**

```
Error: Cannot write to .auth/user.json (file in use)
```

**解決策**:

```yaml
# シャード実行時は異なるファイル名を使用
- name: Run E2E tests
  run: npm run test:e2e -- --shard=${{ matrix.shard }}/2
  env:
    AUTH_FILE_SUFFIX: '-shard-${{ matrix.shard }}'
```

## 📋 ベストプラクティス

### 1. **セキュリティ**

- 認証状態ファイルを Git にコミットしない
- GitHub Actions のログに認証情報を出力しない
- テスト専用のユーザーアカウントを使用

### 2. **信頼性**

- 毎回新しい認証を行う（キャッシュしない）
- 認証失敗時のリトライ機能を実装
- タイムアウト設定を適切に行う

### 3. **効率性**

- 並列実行時の競合を避ける
- 不要な認証ステップを削除
- 適切なタイムアウト値を設定
