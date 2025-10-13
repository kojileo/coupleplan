# E2Eテスト環境設定ガイド

このガイドでは、`.env.test`ファイルを使用したE2Eテストの環境設定方法を説明します。

## 🔧 セットアップ手順

### Step 1: `.env.test`ファイルを作成

プロジェクトルートに`.env.test`ファイルを作成してください。

```bash
# Windowsの場合
type nul > .env.test

# Mac/Linuxの場合
touch .env.test
```

### Step 2: `.env.test`に以下の内容を記入

```env
# E2Eテスト環境設定

# テスト対象のベースURL
BASE_URL=https://coupleplan.vercel.app

# テストユーザー認証情報（テスト環境用）
# 注意: 本番環境のデータを使用しないでください
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123

# パートナーユーザー（パートナー連携テスト用）
TEST_PARTNER_EMAIL=partner@example.com
TEST_PARTNER_PASSWORD=password123

# Supabase設定（テスト環境 - 既存の.envから値をコピー）
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
SUPABASE_SERVICE_ROLE_KEY=あなたのサービスロールキー

# テスト設定
TEST_TIMEOUT=30000
TEST_HEADLESS=true
TEST_PARALLEL_WORKERS=4

# デバッグ設定（必要に応じて有効化）
DEBUG=false
PWDEBUG=0
```

### Step 3: 値を実際の環境に合わせて編集

#### BASE_URLの設定

テスト対象のURLを指定します：

```env
# Vercel本番環境
BASE_URL=https://coupleplan.vercel.app

# Vercelプレビュー環境
BASE_URL=https://coupleplan-git-feature-xxx.vercel.app

# ローカル開発環境
BASE_URL=http://localhost:3000
```

#### テストユーザーの準備

E2Eテスト用のテストユーザーを作成し、認証情報を設定します：

```env
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
```

**重要**:

- 本番環境のユーザーは使用しないでください
- テスト専用のユーザーアカウントを作成してください
- パスワードはシンプルなものでOK（テスト用）

#### Supabase設定のコピー

既存の`.env`ファイルからSupabaseの設定をコピーします：

```bash
# .envファイルから以下の値をコピー
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: `.gitignore`の確認

`.env.test`が`.gitignore`に追加されていることを確認してください：

```gitignore
# local env files
.env*.local
.env.test
```

これにより、機密情報がGitにコミットされるのを防ぎます。

## 📝 環境変数の詳細説明

### 必須設定

| 変数名               | 説明                           | 例                              |
| -------------------- | ------------------------------ | ------------------------------- |
| `BASE_URL`           | テスト対象のURL                | `https://coupleplan.vercel.app` |
| `TEST_USER_EMAIL`    | テストユーザーのメールアドレス | `test@example.com`              |
| `TEST_USER_PASSWORD` | テストユーザーのパスワード     | `password123`                   |

### オプション設定

| 変数名                  | 説明                           | デフォルト値   |
| ----------------------- | ------------------------------ | -------------- |
| `TEST_TIMEOUT`          | テストのタイムアウト（ミリ秒） | `30000` (30秒) |
| `TEST_PARALLEL_WORKERS` | 並列実行するワーカー数         | `4`            |
| `TEST_HEADLESS`         | ヘッドレスモードの有効化       | `true`         |
| `DEBUG`                 | デバッグモードの有効化         | `false`        |

### Supabase設定（既存の.envと同じ）

| 変数名                          | 説明                                 |
| ------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | SupabaseプロジェクトURL              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabaseサービスロールキー（管理用） |

## 🚀 テスト実行

`.env.test`の設定が完了したら、テストを実行できます：

```bash
# すべてのE2Eテストを実行
npx playwright test

# 認証テストのみ実行
npx playwright test tests/e2e/auth/

# デバッグモードで実行（ブラウザを表示）
npx playwright test --headed --debug
```

## 🔍 設定の確認

環境変数が正しく読み込まれているか確認するには：

```bash
# シードテストを実行
npx playwright test tests/e2e/seed.spec.ts

# グローバルセットアップのログを確認
# 以下のメッセージが表示されるはずです：
# ✅ Environment variables validated
# 🌐 Base URL: https://coupleplan.vercel.app
# ✅ Vercel environment is ready
```

## 🛠️ トラブルシューティング

### 問題: BASE_URLが読み込まれない

**原因**: `.env.test`ファイルが正しい場所にない

**解決策**:

```bash
# プロジェクトルートに.env.testがあることを確認
ls -la | grep .env.test  # Mac/Linux
dir | findstr .env.test  # Windows
```

### 問題: テストユーザーで認証できない

**原因**: テストユーザーが存在しない、またはパスワードが間違っている

**解決策**:

1. Supabaseダッシュボードでテストユーザーを確認
2. メール確認が必要な場合は確認を完了
3. `.env.test`の認証情報を確認

### 問題: Supabaseエラーが発生する

**原因**: Supabase設定が正しくない

**解決策**:

1. `.env`ファイルからSupabase設定を正しくコピー
2. Supabaseダッシュボードでプロジェクトが正常に動作しているか確認
3. APIキーの有効期限を確認

## 📚 環境変数の優先順位

Playwrightは以下の順序で環境変数を読み込みます：

```
1. .env.test    ← 最優先（E2Eテスト専用）
2. .env.local   ← ローカル開発環境
3. .env         ← デフォルト設定
```

つまり、`.env.test`の設定が最優先されます。

## 🔒 セキュリティのベストプラクティス

1. **`.env.test`をGitにコミットしない**
   - `.gitignore`に必ず追加
   - チームメンバーには別途共有

2. **テスト専用のユーザーアカウントを使用**
   - 本番データを使用しない
   - 権限を最小限に設定

3. **本番環境とテスト環境を分離**
   - 可能であれば、テスト専用のSupabaseプロジェクトを使用
   - 本番データベースを直接テストしない

4. **CI/CD環境では環境変数を使用**
   - GitHub Secretsに設定を保存
   - `.env.test`ファイルは使用しない

## 📋 チェックリスト

セットアップが完了したら、以下を確認してください：

- [ ] `.env.test`ファイルをプロジェクトルートに作成
- [ ] `BASE_URL`を正しく設定
- [ ] テストユーザーの認証情報を設定
- [ ] Supabase設定を`.env`からコピー
- [ ] `.gitignore`に`.env.test`が追加されている
- [ ] シードテストが正常に実行される
- [ ] 認証テストが正常に実行される（または適切にスキップされる）

---

**最終更新**: 2025年10月13日  
**関連ドキュメント**:

- [E2Eテストガイド](./E2E_TESTING_GUIDE.md)
- [テスト計画](./TEST_PLAN.md)
- [作業計画](../作業計画.md)
