-- データベースメンテナンス: クリーンアップ
-- 定期的に実行することで、データベースを健全に保つ

-- ============================================
-- 1. 期限切れ招待コードの削除
-- ============================================

-- 期限切れの招待コードを削除（30日以上古いもの）
DELETE FROM couple_invitations
WHERE expires_at < NOW() - INTERVAL '30 days'
  AND status = 'expired';

-- ============================================
-- 2. 孤立データの削除
-- ============================================

-- カップルが削除されたプランを削除（CASCADE で自動削除されるはずだが念のため）
DELETE FROM date_plans
WHERE couple_id NOT IN (SELECT id FROM couples);

-- プランが削除されたアイテムを削除
DELETE FROM plan_items
WHERE plan_id NOT IN (SELECT id FROM date_plans);

-- プランが削除されたフィードバックを削除
DELETE FROM plan_feedback
WHERE plan_id NOT IN (SELECT id FROM date_plans);

-- ============================================
-- 3. 古いドラフトプランの削除（オプション）
-- ============================================

-- 90日以上前に作成され、一度も更新されていないドラフトプランを削除
-- 注意: 必要に応じてコメントアウトを解除
/*
DELETE FROM date_plans
WHERE status = 'draft'
  AND created_at < NOW() - INTERVAL '90 days'
  AND updated_at = created_at;
*/

-- ============================================
-- 4. VACUUMの実行（パフォーマンス向上）
-- ============================================

-- 削除されたレコードの領域を解放
-- 注意: Supabaseでは手動VACUUM不要（自動実行される）
-- ローカル環境やセルフホスティングの場合のみ実行

/*
VACUUM ANALYZE couple_invitations;
VACUUM ANALYZE date_plans;
VACUUM ANALYZE plan_items;
VACUUM ANALYZE plan_templates;
VACUUM ANALYZE plan_feedback;
*/

-- ============================================
-- 5. 統計情報の更新
-- ============================================

-- クエリプランナーの統計情報を更新
ANALYZE couple_invitations;
ANALYZE date_plans;
ANALYZE plan_items;
ANALYZE plan_templates;
ANALYZE plan_feedback;

-- ============================================
-- 実行結果の確認
-- ============================================

-- クリーンアップ後のテーブルサイズを確認
SELECT 
  schemaname,
  relname AS tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;

