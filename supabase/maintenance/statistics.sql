-- データベース統計情報とレポート
-- システムの利用状況を把握するためのクエリ集

-- ============================================
-- 1. 全体統計
-- ============================================

-- テーブルごとのレコード数とサイズ
SELECT 
  schemaname,
  relname AS tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||relname)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - pg_relation_size(schemaname||'.'||relname)) AS index_size,
  n_live_tup AS row_count,
  n_dead_tup AS dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;

-- ============================================
-- 2. ユーザー統計
-- ============================================

-- ユーザー登録数（日別）
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS new_users
FROM auth.users
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;

-- 総ユーザー数
SELECT COUNT(*) AS total_users FROM auth.users;

-- アクティブユーザー数（過去30日）
SELECT COUNT(DISTINCT created_by) AS active_users
FROM date_plans
WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================
-- 3. カップル統計
-- ============================================

-- カップル数
SELECT 
  COUNT(*) AS total_couples,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS new_couples_this_week,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS new_couples_this_month
FROM couples;

-- カップル形成率
SELECT 
  (SELECT COUNT(*) FROM couples) AS total_couples,
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  ROUND((SELECT COUNT(*) FROM couples)::NUMERIC / NULLIF((SELECT COUNT(*) FROM auth.users)::NUMERIC, 0) * 100, 2) AS couple_formation_rate_percent
;

-- ============================================
-- 4. デートプラン統計
-- ============================================

-- プラン生成数（総数・日別・週別・月別）
SELECT 
  COUNT(*) AS total_plans,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') AS plans_today,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS plans_this_week,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS plans_this_month,
  COUNT(*) FILTER (WHERE ai_generated = true) AS ai_generated_plans,
  ROUND(COUNT(*) FILTER (WHERE ai_generated = true)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0) * 100, 2) AS ai_generation_rate_percent
FROM date_plans;

-- ステータス別プラン数
SELECT 
  status,
  COUNT(*) AS count,
  ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM date_plans)::NUMERIC, 0) * 100, 2) AS percentage
FROM date_plans
GROUP BY status
ORDER BY count DESC;

-- 平均予算・所要時間
SELECT 
  ROUND(AVG(budget), 2) AS avg_budget,
  ROUND(AVG(duration), 2) AS avg_duration_minutes,
  ROUND(AVG(duration) / 60.0, 2) AS avg_duration_hours
FROM date_plans
WHERE budget IS NOT NULL AND duration IS NOT NULL;

-- 人気のある都道府県（プラン作成数）
SELECT 
  location_prefecture,
  COUNT(*) AS plan_count
FROM date_plans
WHERE location_prefecture IS NOT NULL
GROUP BY location_prefecture
ORDER BY plan_count DESC
LIMIT 10;

-- 人気のある都市（プラン作成数）
SELECT 
  location_prefecture,
  location_city,
  COUNT(*) AS plan_count
FROM date_plans
WHERE location_city IS NOT NULL
GROUP BY location_prefecture, location_city
ORDER BY plan_count DESC
LIMIT 20;

-- ============================================
-- 5. AI生成統計
-- ============================================

-- AI生成の成功率
SELECT 
  COUNT(*) FILTER (WHERE ai_generated = true AND status != 'generating') AS successful_generations,
  COUNT(*) FILTER (WHERE ai_generated = true AND status = 'generating') AS stuck_generations,
  COUNT(*) FILTER (WHERE ai_generated = true) AS total_ai_attempts,
  ROUND(
    COUNT(*) FILTER (WHERE ai_generated = true AND status != 'generating')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE ai_generated = true)::NUMERIC, 0) * 100, 
    2
  ) AS success_rate_percent
FROM date_plans;

-- AI生成数の推移（日別）
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS ai_plans_generated
FROM date_plans
WHERE ai_generated = true
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;

-- ============================================
-- 6. エンゲージメント統計
-- ============================================

-- フィードバック統計
SELECT 
  AVG(rating) AS avg_rating,
  COUNT(*) AS total_feedback,
  COUNT(*) FILTER (WHERE rating >= 4) AS positive_feedback,
  ROUND(
    COUNT(*) FILTER (WHERE rating >= 4)::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    2
  ) AS positive_rate_percent
FROM plan_feedback;

-- 評価分布
SELECT 
  rating,
  COUNT(*) AS count,
  ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM plan_feedback)::NUMERIC, 0) * 100, 2) AS percentage
FROM plan_feedback
GROUP BY rating
ORDER BY rating DESC;

-- ============================================
-- 7. プランアイテム統計
-- ============================================

-- プランアイテムのタイプ別人気度
SELECT 
  type,
  COUNT(*) AS count,
  ROUND(AVG(cost), 2) AS avg_cost,
  ROUND(AVG(duration), 2) AS avg_duration_minutes
FROM plan_items
GROUP BY type
ORDER BY count DESC;

-- 平均アイテム数/プラン
SELECT 
  ROUND(AVG(item_count), 2) AS avg_items_per_plan
FROM (
  SELECT plan_id, COUNT(*) AS item_count
  FROM plan_items
  GROUP BY plan_id
) AS item_counts;

-- ============================================
-- 8. テンプレート統計
-- ============================================

-- 人気のテンプレート
SELECT 
  id,
  name,
  category,
  popularity,
  is_public,
  created_at
FROM plan_templates
ORDER BY popularity DESC
LIMIT 20;

-- カテゴリー別テンプレート数
SELECT 
  category,
  COUNT(*) AS count,
  AVG(popularity) AS avg_popularity
FROM plan_templates
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- ============================================
-- 9. 招待コード統計
-- ============================================

-- 招待コードの使用状況
SELECT 
  status,
  COUNT(*) AS count,
  ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM couple_invitations)::NUMERIC, 0) * 100, 2) AS percentage
FROM couple_invitations
GROUP BY status
ORDER BY count DESC;

-- 招待コードの成功率
SELECT 
  COUNT(*) FILTER (WHERE status = 'used') AS used_invitations,
  COUNT(*) AS total_invitations,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'used')::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    2
  ) AS success_rate_percent
FROM couple_invitations;

-- ============================================
-- 10. 総合ダッシュボード
-- ============================================

-- システム全体の主要指標
SELECT 
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  (SELECT COUNT(*) FROM couples) AS total_couples,
  (SELECT COUNT(*) FROM date_plans) AS total_plans,
  (SELECT COUNT(*) FROM date_plans WHERE ai_generated = true) AS ai_generated_plans,
  (SELECT COUNT(*) FROM plan_items) AS total_plan_items,
  (SELECT ROUND(AVG(rating), 2) FROM plan_feedback) AS avg_rating,
  (SELECT COUNT(*) FROM plan_feedback) AS total_feedback;

