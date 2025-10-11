-- トラブルシューティング用SQL
-- 問題の診断と解決に使用

-- ============================================
-- 1. データの整合性チェック
-- ============================================

-- すべてのテーブルの整合性を一括チェック
WITH integrity_checks AS (
  -- 孤立したdate_plans（カップルが存在しない）
  SELECT 
    'Orphaned date_plans' AS issue,
    COUNT(*) AS count,
    'CRITICAL' AS severity
  FROM date_plans
  WHERE couple_id NOT IN (SELECT id FROM couples)
  
  UNION ALL
  
  -- 孤立したplan_items（プランが存在しない）
  SELECT 
    'Orphaned plan_items' AS issue,
    COUNT(*) AS count,
    'CRITICAL' AS severity
  FROM plan_items
  WHERE plan_id NOT IN (SELECT id FROM date_plans)
  
  UNION ALL
  
  -- 孤立したplan_feedback（プランが存在しない）
  SELECT 
    'Orphaned plan_feedback' AS issue,
    COUNT(*) AS count,
    'CRITICAL' AS severity
  FROM plan_feedback
  WHERE plan_id NOT IN (SELECT id FROM date_plans)
  
  UNION ALL
  
  -- order_indexの重複
  SELECT 
    'Duplicate order_index in plan_items' AS issue,
    COUNT(*) AS count,
    'WARNING' AS severity
  FROM (
    SELECT plan_id, order_index, COUNT(*) AS dup_count
    FROM plan_items
    GROUP BY plan_id, order_index
    HAVING COUNT(*) > 1
  ) duplicates
  
  UNION ALL
  
  -- 無効な評価値
  SELECT 
    'Invalid ratings (not 1-5)' AS issue,
    COUNT(*) AS count,
    'WARNING' AS severity
  FROM plan_feedback
  WHERE rating < 1 OR rating > 5
  
  UNION ALL
  
  -- 負の予算
  SELECT 
    'Negative budget' AS issue,
    COUNT(*) AS count,
    'WARNING' AS severity
  FROM date_plans
  WHERE budget < 0
  
  UNION ALL
  
  -- 負の時間
  SELECT 
    'Negative duration' AS issue,
    COUNT(*) AS count,
    'WARNING' AS severity
  FROM date_plans
  WHERE duration < 0
)
SELECT * FROM integrity_checks
WHERE count > 0
ORDER BY 
  CASE severity
    WHEN 'CRITICAL' THEN 1
    WHEN 'WARNING' THEN 2
    ELSE 3
  END,
  count DESC;

-- ============================================
-- 2. プラン生成の問題診断
-- ============================================

-- 生成中のまま止まっているプラン
SELECT 
  id,
  title,
  created_by,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 AS minutes_stuck,
  ai_generation_id
FROM date_plans
WHERE status = 'generating'
  AND created_at < NOW() - INTERVAL '5 minutes'
ORDER BY created_at;

-- 生成中のプランを強制的にエラー状態に変更
/*
UPDATE date_plans
SET status = 'draft',
    special_requests = COALESCE(special_requests || E'\n', '') || '[ERROR] AI generation timeout'
WHERE status = 'generating'
  AND created_at < NOW() - INTERVAL '10 minutes';
*/

-- ============================================
-- 3. 重複データの検出
-- ============================================

-- 同じカップルで重複している招待コード
SELECT 
  from_user_id,
  COUNT(*) AS duplicate_count,
  STRING_AGG(invitation_code, ', ') AS codes
FROM couple_invitations
WHERE status = 'active'
GROUP BY from_user_id
HAVING COUNT(*) > 1;

-- 同じカップルIDを持つ重複レコード
SELECT 
  user1_id,
  user2_id,
  COUNT(*) AS duplicate_count
FROM couples
GROUP BY user1_id, user2_id
HAVING COUNT(*) > 1;

-- ============================================
-- 4. パフォーマンス問題の診断
-- ============================================

-- 実行時間が長いクエリ
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  state,
  query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
  AND state != 'idle'
ORDER BY duration DESC;

-- テーブルスキャンが多いクエリ（インデックス不足の可能性）
SELECT 
  schemaname,
  relname AS tablename,
  seq_scan AS sequential_scans,
  seq_tup_read AS rows_read_sequentially,
  idx_scan AS index_scans,
  idx_tup_fetch AS rows_fetched_via_index,
  ROUND(
    seq_scan::NUMERIC / NULLIF((seq_scan + idx_scan)::NUMERIC, 0) * 100,
    2
  ) AS seq_scan_ratio_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND (seq_scan + idx_scan) > 0
ORDER BY seq_scan DESC;

-- ============================================
-- 5. RLSポリシーの診断
-- ============================================

-- 有効なRLSポリシーの一覧
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- RLSが有効なテーブルの確認
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 6. データ修正用クエリ
-- ============================================

-- 不正なデータを修正

-- 負の予算を0に修正
UPDATE date_plans
SET budget = 0
WHERE budget < 0;

-- 負の時間を0に修正
UPDATE date_plans
SET duration = 0
WHERE duration < 0;

-- 空の文字列をNULLに変換
UPDATE date_plans
SET 
  location_prefecture = NULLIF(TRIM(location_prefecture), ''),
  location_city = NULLIF(TRIM(location_city), ''),
  location_station = NULLIF(TRIM(location_station), '');

-- order_indexを振り直し
WITH ordered_items AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY plan_id ORDER BY order_index, created_at) AS new_order
  FROM plan_items
)
UPDATE plan_items pi
SET order_index = oi.new_order
FROM ordered_items oi
WHERE pi.id = oi.id;

-- ============================================
-- 7. デバッグ用ビュー
-- ============================================

-- プラン詳細ビュー（デバッグ用）
CREATE OR REPLACE VIEW v_plan_details AS
SELECT 
  dp.id AS plan_id,
  dp.title,
  dp.status,
  dp.budget,
  dp.duration,
  dp.ai_generated,
  u.email AS creator_email,
  c.id AS couple_id,
  (SELECT COUNT(*) FROM plan_items WHERE plan_id = dp.id) AS item_count,
  (SELECT AVG(rating) FROM plan_feedback WHERE plan_id = dp.id) AS avg_rating,
  (SELECT COUNT(*) FROM plan_feedback WHERE plan_id = dp.id) AS feedback_count,
  dp.created_at,
  dp.updated_at
FROM date_plans dp
JOIN auth.users u ON dp.created_by = u.id
JOIN couples c ON dp.couple_id = c.id;

-- 使用例:
-- SELECT * FROM v_plan_details WHERE status = 'generating';

-- ============================================
-- 8. エラーログテーブル（オプション）
-- ============================================

-- エラーログを記録するテーブル
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT,
  error_details JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_path TEXT,
  request_method VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);

-- エラーログの分析
SELECT 
  error_type,
  COUNT(*) AS occurrence_count,
  MAX(created_at) AS last_occurrence
FROM error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY error_type
ORDER BY occurrence_count DESC;

-- ============================================
-- 9. テスト環境のリセット
-- ============================================

-- 開発環境でのみ使用！本番環境では絶対に実行しないこと！
-- すべてのデータを削除してクリーンな状態にする

/*
-- 警告: これを実行するとすべてのデータが失われます
BEGIN;

TRUNCATE plan_feedback CASCADE;
TRUNCATE plan_items CASCADE;
TRUNCATE plan_templates CASCADE;
TRUNCATE date_plans CASCADE;
TRUNCATE couple_invitations CASCADE;
TRUNCATE couples CASCADE;
TRUNCATE profiles CASCADE;

-- auth.usersは手動削除を推奨（Supabase Authの管理画面から）

COMMIT;
*/

-- ============================================
-- 10. パフォーマンステスト用データ生成
-- ============================================

-- テスト用のダミーデータを生成
-- 開発・ステージング環境でのみ使用

/*
-- ダミープランを生成（パフォーマンステスト用）
INSERT INTO date_plans (couple_id, created_by, title, description, budget, duration, status)
SELECT 
  (SELECT id FROM couples ORDER BY RANDOM() LIMIT 1) AS couple_id,
  (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1) AS created_by,
  'Test Plan ' || generate_series AS title,
  'This is a test plan for performance testing' AS description,
  FLOOR(RANDOM() * 50000 + 5000)::INTEGER AS budget,
  FLOOR(RANDOM() * 480 + 60)::INTEGER AS duration,
  'draft' AS status
FROM generate_series(1, 1000);
*/

