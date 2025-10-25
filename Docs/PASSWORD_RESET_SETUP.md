# パスワードリセット設定ガイド

## 📋 概要

このドキュメントでは、CouplePlanアプリケーションのパスワードリセット機能を正しく設定するための手順を説明します。

**所要時間**: 約 15-20 分  
**前提条件**: Supabaseプロジェクトが作成済みであること

---

## 🎯 設定の全体像

```
1. Supabaseダッシュボードでの設定確認 (10分)
   ↓
2. メールテンプレートの設定 (5分)
   ↓
3. リダイレクトURLの設定 (3分)
   ↓
4. 動作確認・テスト (2分)
```

---

## ステップ 1: Supabaseダッシュボードでの設定確認

### 1.1 認証設定の確認

1. **Supabase ダッシュボードにアクセス**

   ```
   https://supabase.com/dashboard
   ```

2. **プロジェクトを選択**

3. **Authentication → Providers** に移動

4. **Email Provider の設定を確認**

   ```
   ✅ Enable Email Provider: ON
   ✅ Confirm email: ON (推奨)
   ✅ Secure email change: ON (推奨)
   ```

### 1.2 URL設定の確認

1. **Authentication → URL Configuration** に移動

2. **Site URL を確認**

   ```
   開発環境: http://localhost:3000
   本番環境: https://your-domain.com
   ```

3. **Redirect URLs に以下を追加**

   ```
   http://localhost:3000/reset-password
   https://your-domain.com/reset-password
   ```

   **重要**: ワイルドカード（`**`）は使用しないでください。正確なURLを指定してください。

---

## ステップ 2: メールテンプレートの設定

### 2.1 パスワードリセットテンプレートの確認

1. **Authentication → Email Templates** に移動

2. **Reset Password** テンプレートを選択

3. **テンプレート内容を確認**

   ```html
   <h2>パスワードをリセット</h2>
   <p>以下のリンクをクリックしてパスワードをリセットしてください：</p>
   <p><a href="{{ .ConfirmationURL }}">パスワードをリセット</a></p>
   <p>このリンクは24時間有効です。</p>
   ```

### 2.2 リダイレクトURLの確認

**重要**: メールテンプレート内の `{{ .ConfirmationURL }}` が正しく設定されていることを確認してください。

- このURLは `NEXT_PUBLIC_APP_URL/reset-password` にリダイレクトされる必要があります
- URLパラメータとして `type=recovery` と `code` が含まれます

### 2.3 カスタムテンプレートの設定（オプション）

既存のカスタムテンプレートを使用している場合：

1. **テンプレート内のリンクを確認**

   ```html
   <!-- 正しい例 -->
   <a href="{{ .ConfirmationURL }}">パスワードをリセット</a>

   <!-- 間違った例 -->
   <a href="https://your-domain.com/reset-password">パスワードをリセット</a>
   ```

2. **リダイレクトURLが動的に生成されることを確認**

---

## ステップ 3: 環境変数の確認

### 3.1 開発環境

`.env.local` ファイルを確認：

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.2 本番環境

GitHub Secrets または環境変数を確認：

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## ステップ 4: 動作確認・テスト

### 4.1 パスワードリセットフローのテスト

1. **パスワードリセットページにアクセス**

   ```
   http://localhost:3000/forgot-password
   ```

2. **テスト用メールアドレスを入力**

3. **メール送信を実行**

4. **送信されたメールを確認**
   - メールが受信されることを確認
   - リンクが正しいURLを指していることを確認

5. **メール内のリンクをクリック**
   - リセットページ（`/reset-password`）に遷移することを確認
   - セッションが正しく確立されることを確認

6. **新しいパスワードを設定**
   - パスワード更新が成功することを確認
   - ログインページにリダイレクトされることを確認

### 4.2 ログの確認

開発者ツールのコンソールで以下のログを確認：

```
[requestId] パスワードリセットAPI開始
[requestId] リクエスト受信: test@example.com
[requestId] Supabaseパスワードリセット結果 (XXXms)
[requestId] パスワードリセットメール送信成功 (XXXms)
```

---

## 🚨 トラブルシューティング

### よくある問題と解決策

#### 1. メールが送信されない

**症状**: パスワードリセットメールが届かない

**原因と対策**:

1. **Supabaseのメール送信制限**
   - Supabaseの無料プランでは1時間に3通まで
   - 制限に達している場合は時間をおいて再試行

2. **メールアドレスの確認**
   - 正しいメールアドレスを入力しているか確認
   - スペルミスがないか確認

3. **スパムフォルダの確認**
   - メールがスパムフォルダに振り分けられていないか確認

#### 2. リセットリンクが機能しない

**症状**: メール内のリンクをクリックしても正しく動作しない

**原因と対策**:

1. **リダイレクトURLの設定確認**

   ```
   Supabase Dashboard → Authentication → URL Configuration
   Redirect URLs に以下が含まれているか確認：
   - http://localhost:3000/reset-password (開発環境)
   - https://your-domain.com/reset-password (本番環境)
   ```

2. **環境変数の確認**

   ```bash
   # 正しい設定例
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **メールテンプレートの確認**
   - テンプレート内で `{{ .ConfirmationURL }}` を使用しているか確認
   - ハードコードされたURLを使用していないか確認

#### 3. セッションが確立されない

**症状**: リセットページに遷移するがセッションエラーが発生

**原因と対策**:

1. **Supabaseクライアントの設定確認**

   ```typescript
   // src/lib/supabase-auth.ts
   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       autoRefreshToken: false,
       persistSession: true,
       detectSessionInUrl: true,
       flowType: 'pkce',
     },
   });
   ```

2. **ブラウザのコンソールログ確認**
   - エラーメッセージを確認
   - ネットワークタブでAPI呼び出しを確認

#### 4. パスワード更新が失敗する

**症状**: 新しいパスワードの設定でエラーが発生

**原因と対策**:

1. **パスワードの要件確認**
   - 8文字以上であること
   - 確認パスワードと一致していること

2. **セッションの有効性確認**
   - リセットリンクの有効期限（通常24時間）
   - セッションが正しく確立されているか

### デバッグ方法

#### 1. ブラウザの開発者ツール

```javascript
// コンソールでセッション状態を確認
const {
  data: { session },
} = await supabase.auth.getSession();
console.log('セッション:', session);

// URLパラメータを確認
console.log('URL:', window.location.href);
console.log('Search:', window.location.search);
console.log('Hash:', window.location.hash);
```

#### 2. サーバーログの確認

```bash
# 開発環境
npm run dev

# 本番環境（Cloud Run）
gcloud run services logs read coupleplan --region=asia-northeast1 --limit=50
```

#### 3. Supabaseダッシュボードでの確認

1. **Authentication → Users** でユーザー状態を確認
2. **Logs** でAPI呼び出しログを確認
3. **Database** でユーザーテーブルの状態を確認

---

## 📚 関連ドキュメント

- [認証システム設計書](./design/認証システム設計書.md) - 認証システムの詳細設計
- [本番環境構築ガイド](./PRODUCTION_SETUP_GUIDE.md) - 本番環境の設定
- [トラブルシューティング](./TROUBLESHOOTING.md) - 一般的な問題の解決方法

---

## 🎯 チェックリスト

### Supabase設定

- [ ] Email Provider が有効になっている
- [ ] Site URL が正しく設定されている
- [ ] Redirect URLs にリセットページのURLが含まれている
- [ ] メールテンプレートで `{{ .ConfirmationURL }}` を使用している

### 環境変数

- [ ] `NEXT_PUBLIC_APP_URL` が正しく設定されている
- [ ] `NEXT_PUBLIC_SUPABASE_URL` が正しく設定されている
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しく設定されている

### 動作確認

- [ ] パスワードリセットメールが送信される
- [ ] メール内のリンクが正しく動作する
- [ ] リセットページでセッションが確立される
- [ ] 新しいパスワードの設定が成功する
- [ ] ログインページにリダイレクトされる

---

**最終更新**: 2025年1月12日  
**バージョン**: 1.0.0
