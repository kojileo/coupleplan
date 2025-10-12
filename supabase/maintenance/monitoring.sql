-- パフォーマンス監視とモニタリング
-- システムのパフォーマンスを監視し、問題を早期発見する

-- ============================================
-- 1. クエリパフォーマンス
-- ============================================

-- 実行時間が長いクエリを確認
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state,
  wait_event_type,
  wait_event
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
  AND state != 'idle'
ORDER BY duration DESC;

-- ============================================
-- 2. インデックス使用状況
-- ============================================

-- 使用されていないインデックスの確認
SELECT 
  schemaname,
  relname AS tablename,
  indexrelname AS indexname,
  idx_scan AS index_scans,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- インデックスの効率性
SELECT 
  schemaname,
  relname AS tablename,
  indexrelname AS indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================
-- 3. テーブルサイズとブロート
-- ============================================

-- テーブルサイズの監視
SELECT 
  schemaname,
  relname AS tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||relname)) AS table_size,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  ROUND(
    n_dead_tup::NUMERIC / NULLIF(n_live_tup::NUMERIC, 0) * 100, 
    2
  ) AS dead_row_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;

-- ブロート率の確認（dead rowsの割合）
SELECT 
  schemaname,
  relname AS tablename,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  ROUND(n_dead_tup::NUMERIC / NULLIF(n_live_tup::NUMERIC, 0) * 100, 2) AS bloat_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 0
ORDER BY bloat_percent DESC;

-- ============================================
-- 4. 接続とロック
-- ============================================

-- アクティブな接続数
SELECT 
  COUNT(*) AS total_connections,
  COUNT(*) FILTER (WHERE state = 'active') AS active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') AS idle_connections,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction
FROM pg_stat_activity
WHERE datname = current_database();

-- ロックの確認
SELECT 
  pg_class.relname AS table_name,
  pg_locks.mode,
  pg_locks.granted,
  pg_stat_activity.pid,
  pg_stat_activity.query,
  now() - pg_stat_activity.query_start AS duration
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
JOIN pg_stat_activity ON pg_locks.pid = pg_stat_activity.pid
WHERE pg_class.relkind = 'r'
  AND pg_class.relnamespace = 'public'::regnamespace
ORDER BY duration DESC;

-- ============================================
-- 5. キャッシュヒット率
-- ============================================

-- テーブルごとのキャッシュヒット率
SELECT 
  schemaname,
  tablename,
  heap_blks_read AS disk_reads,
  heap_blks_hit AS cache_hits,
  ROUND(
    heap_blks_hit::NUMERIC / NULLIF((heap_blks_hit + heap_blks_read)::NUMERIC, 0) * 100, 
    2
  ) AS cache_hit_ratio_percent
FROM pg_statio_user_tables
WHERE schemaname = 'public'
  AND (heap_blks_hit + heap_blks_read) > 0
ORDER BY cache_hit_ratio_percent ASC;

-- インデックスのキャッシュヒット率
SELECT 
  schemaname,
  indexrelname,
  idx_blks_read AS disk_reads,
  idx_blks_hit AS cache_hits,
  ROUND(
    idx_blks_hit::NUMERIC / NULLIF((idx_blks_hit + idx_blks_read)::NUMERIC, 0) * 100, 
    2
  ) AS cache_hit_ratio_percent
FROM pg_statio_user_indexes
WHERE schemaname = 'public'
  AND (idx_blks_hit + idx_blks_read) > 0
ORDER BY cache_hit_ratio_percent ASC;

-- ============================================
-- 6. データベース全体のヘルスチェック
-- ============================================

CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  value TEXT,
  recommendation TEXT
) AS $$
BEGIN
  -- テーブルサイズチェック
  RETURN QUERY
  SELECT 
    'Total Database Size' AS check_name,
    CASE 
      WHEN pg_database_size(current_database()) < 1073741824 THEN 'OK'  -- < 1GB
      WHEN pg_database_size(current_database()) < 10737418240 THEN 'WARNING'  -- < 10GB
      ELSE 'CRITICAL'
    END AS status,
    pg_size_pretty(pg_database_size(current_database())) AS value,
    'Consider archiving old data if > 10GB' AS recommendation;
  
  -- アクティブ接続数チェック
  RETURN QUERY
  SELECT 
    'Active Connections' AS check_name,
    CASE 
      WHEN COUNT(*) < 50 THEN 'OK'
      WHEN COUNT(*) < 100 THEN 'WARNING'
      ELSE 'CRITICAL'
    END AS status,
    COUNT(*)::TEXT AS value,
    'Check for connection leaks if > 50' AS recommendation
  FROM pg_stat_activity
  WHERE state = 'active' AND datname = current_database();
  
  -- デッドロウの確認
  RETURN QUERY
  SELECT 
    'Dead Rows Ratio' AS check_name,
    CASE 
      WHEN AVG(n_dead_tup::NUMERIC / NULLIF(n_live_tup::NUMERIC, 0)) < 0.1 THEN 'OK'
      WHEN AVG(n_dead_tup::NUMERIC / NULLIF(n_live_tup::NUMERIC, 0)) < 0.2 THEN 'WARNING'
      ELSE 'CRITICAL'
    END AS status,
    ROUND(AVG(n_dead_tup::NUMERIC / NULLIF(n_live_tup::NUMERIC, 0)) * 100, 2)::TEXT || '%' AS value,
    'Run VACUUM if > 20%' AS recommendation
  FROM pg_stat_user_tables
  WHERE schemaname = 'public' AND n_live_tup > 0;
END;
$$ LANGUAGE plpgsql;

-- 使用例:
-- SELECT * FROM database_health_check();

-- ============================================
-- 7. レプリケーション遅延の確認（該当する場合）
-- ============================================

-- Supabaseのレプリケーション状態を確認
-- 注意: 権限が必要な場合があります

/*
SELECT 
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  sync_state,
  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replication_lag_bytes
FROM pg_stat_replication;
*/

-- ============================================
-- 8. 定期実行推奨事項
-- ============================================

-- このクエリを定期的に実行して監視
-- 推奨: 1日1回

SELECT 
  'Health Check' AS task,
  NOW() AS executed_at,
  (SELECT COUNT(*) FROM database_health_check() WHERE status != 'OK') AS issues_found;

