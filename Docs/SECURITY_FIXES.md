# 🔐 Supabaseセキュリティ警告解決手順

## 📊 **解決対象の警告**

| 警告                                | 重要度 | 解決可能 |
| ----------------------------------- | ------ | -------- |
| Function Search Path Mutable        | 🟡 中  | ✅ 可能  |
| Auth OTP Long Expiry                | 🟡 中  | ✅ 可能  |
| Leaked Password Protection Disabled | 🟡 中  | ✅ 可能  |

## 🛠️ **実行手順**

### ステップ1: Function Search Path の修正

**実行場所**: Supabase SQL Editor

```sql
-- supabase/rls-policies.sql の is_admin 関数を更新
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
```

### ステップ2: OTP設定の最適化

**⚠️ 重要: Supabase Dashboard経由でのみ設定可能**

`auth.config` テーブルは存在しないため、以下の手順で Dashboard から設定してください：

**Dashboard 経由での設定:**

1. Supabase Dashboard → Authentication → Settings
2. **Advanced Settings** セクションで以下を設定:
   - **Email Confirm OTP Expiry**: `600` 秒（10分）
   - **Password Reset OTP Expiry**: `600` 秒（10分）
   - **Phone Confirm OTP Expiry**: `300` 秒（5分）
3. **Save** をクリックして設定を保存

### ステップ3: 漏洩パスワード保護の有効化

**実行場所**: Supabase Dashboard > Authentication > Settings > Security

**Dashboard 経由（推奨）:**

1. Supabase Dashboard → Authentication → Settings
2. **Security** セクションで以下を有効化:
   - ✅ **Breach password protection**: ON
   - ✅ **Password requirements**: 8文字以上、複雑性要件

**⚠️ 注意: SQLでの設定は非対応**

パスワード保護設定は Supabase Dashboard からのみ変更可能です。SQL経由での設定はサポートされていません。

## ✅ **検証方法**

### 1. Function Search Path

```sql
-- 関数が正しく作成されているか確認
SELECT proname, prosrc FROM pg_proc WHERE proname = 'is_admin';
```

### 2. OTP設定確認

**Dashboard で確認:**

1. Supabase Dashboard → Authentication → Settings
2. **Advanced Settings** セクションで設定値を確認
3. 各OTP設定が適切な値（600秒以下）になっているか確認

### 3. パスワード保護確認

- Supabase Dashboard で新規ユーザー登録を試行
- 弱いパスワード（例: `123456`）でエラーが表示されることを確認

## ⚠️ **注意事項**

### 実行前の確認

- [ ] 本番環境での作業は保守時間中に実行
- [ ] データベースのバックアップを取得
- [ ] 変更内容をステージング環境で事前テスト

### 実行後の確認

- [ ] アプリケーションの正常動作確認
- [ ] 認証フローのテスト（ログイン/サインアップ）
- [ ] Security Advisor で警告が解消されているか確認

## 🔄 **ロールバック手順**

万が一問題が発生した場合：

```sql
-- is_admin 関数のロールバック（search_path設定を削除）
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**OTP設定のロールバック:**

- Supabase Dashboard → Authentication → Settings
- **Advanced Settings** で各OTP設定を元の値に戻す

## 📝 **完了チェックリスト**

- [ ] Function Search Path Mutable 警告の解消
- [ ] Auth OTP Long Expiry 警告の解消
- [ ] Leaked Password Protection 警告の解消
- [ ] アプリケーションの動作確認
- [ ] Security Advisor での再スキャン実行
- [ ] 変更内容のドキュメント更新

---

**作成日**: 2025年1月  
**最終更新**: 実行完了時に更新してください
