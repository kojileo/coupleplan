-- セキュリティ監査SQL
-- セキュリティ上の問題をチェックし、脆弱性を検出

-- ============================================
-- 1. RLS（Row Level Security）の監査
-- ============================================

-- RLSが無効なテーブルの検出
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- RLSポリシーが設定されていないテーブル
SELECT 
  t.schemaname,
  t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND p.policyname IS NULL
ORDER BY t.tablename;

-- すべてのRLSポリシーの一覧
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command,
  CASE 
    WHEN qual IS NOT NULL THEN 'YES' 
    ELSE 'NO' 
  END AS has_using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'YES' 
    ELSE 'NO' 
  END AS has_with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 2. 権限の監査
-- ============================================

-- テーブルごとの権限確認
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
ORDER BY table_name, grantee, privilege_type;

-- カラムレベルの権限確認
SELECT 
  grantee,
  table_schema,
  table_name,
  column_name,
  privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
ORDER BY table_name, column_name;

-- ============================================
-- 3. 不審なアクティビティの検出
-- ============================================

-- 同一IPから複数アカウントを作成（Supabaseのログが利用可能な場合）
-- 注意: auth.usersにIP情報がない場合は、アプリケーションレベルでログを取る必要あり

-- 短時間に大量のプランを作成したユーザー
SELECT 
  created_by,
  u.email,
  COUNT(*) AS plans_created,
  MIN(dp.created_at) AS first_plan,
  MAX(dp.created_at) AS last_plan,
  EXTRACT(EPOCH FROM (MAX(dp.created_at) - MIN(dp.created_at))) / 60 AS timespan_minutes
FROM date_plans dp
JOIN auth.users u ON dp.created_by = u.id
WHERE dp.created_at > NOW() - INTERVAL '1 hour'
GROUP BY created_by, u.email
HAVING COUNT(*) > 10
ORDER BY plans_created DESC;

-- 異常に高い予算のプラン（不正データの可能性）
SELECT 
  id,
  title,
  budget,
  created_by,
  u.email,
  created_at
FROM date_plans dp
JOIN auth.users u ON dp.created_by = u.id
WHERE budget > 1000000  -- 100万円以上
ORDER BY budget DESC;

-- ============================================
-- 4. データ漏洩リスクの検出
-- ============================================

-- 個人情報を含む可能性のあるフィールドの確認
SELECT 
  id,
  title,
  description,
  special_requests
FROM date_plans
WHERE 
  description ~* '(電話|tel|phone|メール|email|住所|address)' OR
  special_requests ~* '(電話|tel|phone|メール|email|住所|address)'
LIMIT 100;

-- ============================================
-- 5. 認証関連のセキュリティ
-- ============================================

-- 長期間ログインしていないユーザー（休眠アカウント）
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  EXTRACT(EPOCH FROM (NOW() - COALESCE(last_sign_in_at, created_at))) / 86400 AS days_since_activity
FROM auth.users
WHERE COALESCE(last_sign_in_at, created_at) < NOW() - INTERVAL '180 days'
ORDER BY days_since_activity DESC;

-- メール未認証のユーザー（Supabaseのconfirmed_atフィールドがある場合）
-- SELECT id, email, created_at
-- FROM auth.users
-- WHERE confirmed_at IS NULL
-- ORDER BY created_at DESC;

-- ============================================
-- 6. SQLインジェクション対策の確認
-- ============================================

-- パラメータ化されていないクエリの検出
-- 注意: これはコードレベルでの確認が必要
-- データベース側では、準備済みステートメントの使用を推奨

-- 関数のセキュリティ属性を確認
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_type,
  l.lanname AS language
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- ============================================
-- 7. 監査ログの作成
-- ============================================

-- 監査ログテーブル（データ変更履歴）
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,  -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at DESC);

-- 監査ログトリガー関数
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 監査ログトリガーの適用（重要なテーブルのみ）
/*
-- date_plansテーブルに監査ログを適用
DROP TRIGGER IF EXISTS audit_date_plans ON date_plans;
CREATE TRIGGER audit_date_plans
  AFTER INSERT OR UPDATE OR DELETE ON date_plans
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- couplesテーブルに監査ログを適用
DROP TRIGGER IF EXISTS audit_couples ON couples;
CREATE TRIGGER audit_couples
  AFTER INSERT OR UPDATE OR DELETE ON couples
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
*/

-- 監査ログの確認
-- SELECT * FROM audit_log ORDER BY changed_at DESC LIMIT 100;

-- ============================================
-- 8. セキュリティチェックリスト
-- ============================================

-- セキュリティチェックを実行する関数
CREATE OR REPLACE FUNCTION security_check()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- RLS有効化チェック
  RETURN QUERY
  SELECT 
    'RLS Enabled on All Tables' AS check_name,
    CASE 
      WHEN COUNT(*) FILTER (WHERE rowsecurity = false) = 0 THEN 'PASS'
      ELSE 'FAIL'
    END AS status,
    COUNT(*) FILTER (WHERE rowsecurity = false)::TEXT || ' tables without RLS' AS details
  FROM pg_tables
  WHERE schemaname = 'public';
  
  -- 公開データの確認
  RETURN QUERY
  SELECT 
    'Public Templates Security' AS check_name,
    'INFO' AS status,
    COUNT(*)::TEXT || ' public templates' AS details
  FROM plan_templates
  WHERE is_public = true;
END;
$$ LANGUAGE plpgsql;

-- 使用例:
-- SELECT * FROM security_check();

