# セキュリティガイド

## 🔐 Supabase セキュリティ設定

### 必須のセキュリティ設定

#### 1. Row Level Security (RLS) の有効化

```sql
-- supabase/rls-policies.sql ファイルを実行
-- Supabaseダッシュボードから以下のSQLを実行してください
```

#### 2. 環境変数の適切な管理

```bash
# .env.local ファイル（本番環境では適切なシークレット管理を使用）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **重要**: Service Role Keyは絶対にクライアントサイドで使用しないでください。

**なぜService Role Keyが危険なのか:**

- 🚨 **RLS（Row Level Security）をバイパス** - 全ての認証制限を無視
- 🚨 **無制限のデータベースアクセス** - 全ユーザーのデータを読み書き可能
- 🚨 **管理者権限** - ユーザー削除、テーブル操作等が無制限

**安全な使用方法:**

- ✅ サーバーサイドAPIルート内でのみ使用
- ✅ `SUPABASE_SERVICE_ROLE_KEY`（NEXT*PUBLIC*プレフィックスなし）
- ✅ 管理者操作（ユーザー削除など）に限定使用
- ❌ フロントエンド（React コンポーネント）では絶対使用禁止
- ❌ `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`として設定禁止

#### 3. Supabase Auth 設定

**認証プロバイダーの制限:**

- Email/Password のみ有効化
- OAuth プロバイダーは必要に応じて設定

**パスワードポリシー:**

- 最小8文字
- 英大文字・小文字・数字・記号を含む

#### 4. データベースセキュリティ

**RLS ポリシー:**

- ユーザーは自分のデータのみアクセス可能
- 公開プランは誰でも閲覧可能
- 管理者は全データにアクセス可能

#### 5. API セキュリティ

**レート制限:**

- API エンドポイント: 5分間で100リクエスト
- 認証エンドポイント: より厳しい制限を推奨

**入力検証:**

- 全ての入力データをサニタイズ
- SQLインジェクション対策
- XSS対策

### セキュリティチェックリスト

#### 環境設定

- [ ] 環境変数が `.gitignore` に含まれている
- [ ] 本番環境でHTTPS強制設定
- [ ] セキュリティヘッダーが設定されている
- [ ] CORS設定が適切

#### Supabase設定

- [ ] RLSが全テーブルで有効
- [ ] 適切なポリシーが設定されている
- [ ] Service Role Keyが適切に保護されている
- [ ] 認証設定が適切

#### アプリケーション

- [ ] 入力検証が実装されている
- [ ] レート制限が実装されている
- [ ] エラーハンドリングが適切
- [ ] ログ出力が適切（機密情報を含まない）

### 定期的なセキュリティ監査

#### 月次チェック

- [ ] 依存関係の脆弱性チェック (`npm audit`)
- [ ] Supabaseダッシュボードでの異常アクセス確認
- [ ] ログの確認

#### 四半期チェック

- [ ] パスワードポリシーの見直し
- [ ] RLSポリシーの見直し
- [ ] セキュリティヘッダーの更新確認

### インシデント対応

#### セキュリティ侵害発見時

1. 即座にSupabaseプロジェクトのアクセスキーをローテート
2. 影響範囲の調査
3. 必要に応じてサービス停止
4. 修正後の再開
5. インシデントレポート作成

#### 連絡先

- セキュリティ責任者: [メールアドレス]
- 緊急時対応: [電話番号]

### ツールとリソース

#### セキュリティツール

- `npm audit` - 依存関係の脆弱性チェック
- `eslint-plugin-security` - コード内のセキュリティ問題検出
- OWASP ZAP - Webアプリケーション脆弱性スキャン

#### 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

---

最終更新: 2025年1月
