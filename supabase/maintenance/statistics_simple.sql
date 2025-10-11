-- シンプル統計クエリ（Supabase環境で確実に動作）
-- システムビューを使わず、アプリケーションテーブルのみを使用

-- ============================================
-- 1. 基本統計
-- ============================================

-- 総合統計（システム全体の概要）
SELECT 
  '総ユーザー数' AS metric,
  COUNT(*)::TEXT AS value
FROM auth.users
UNION ALL
SELECT 
  'カップル数' AS metric,
  COUNT(*)::TEXT AS value
FROM couples
UNION ALL
SELECT 
  '総プラン数' AS metric,
  COUNT(*)::TEXT AS value
FROM date_plans
UNION ALL
SELECT 
  'AI生成プラン数' AS metric,
  COUNT(*)::TEXT AS value
FROM date_plans
WHERE ai_generated = true
UNION ALL
SELECT 
  '総プランアイテム数' AS metric,
  COUNT(*)::TEXT AS value
FROM plan_items
UNION ALL
SELECT 
  '総フィードバック数' AS metric,
  COUNT(*)::TEXT AS value
FROM plan_feedback
UNION ALL
SELECT 
  '平均評価' AS metric,
  ROUND(AVG(rating), 2)::TEXT AS value
FROM plan_feedback;

-- ============================================
-- 2. ユーザー統計
-- ============================================

-- 日別新規ユーザー数（過去30日）
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS new_users
FROM auth.users
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 総ユーザー数
SELECT COUNT(*) AS total_users FROM auth.users;

-- ============================================
-- 3. カップル統計
-- ============================================

-- カップル数（期間別）
SELECT 
  COUNT(*) AS total_couples,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS new_this_week,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS new_this_month
FROM couples;

-- カップル形成率
SELECT 
  (SELECT COUNT(*) FROM couples) AS total_couples,
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  ROUND(
    (SELECT COUNT(*) FROM couples)::NUMERIC / 
    NULLIF((SELECT COUNT(*) FROM auth.users)::NUMERIC, 0) * 100, 
    2
  ) AS couple_rate_percent;

-- ============================================
-- 4. デートプラン統計
-- ============================================

-- プラン数（期間別）
SELECT 
  COUNT(*) AS total_plans,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') AS today,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS this_week,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS this_month
FROM date_plans;

-- AI生成率
SELECT 
  COUNT(*) AS total_plans,
  COUNT(*) FILTER (WHERE ai_generated = true) AS ai_plans,
  ROUND(
    COUNT(*) FILTER (WHERE ai_generated = true)::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    2
  ) AS ai_rate_percent
FROM date_plans;

-- ステータス別プラン数
SELECT 
  status,
  COUNT(*) AS count,
  ROUND(
    COUNT(*)::NUMERIC / 
    NULLIF((SELECT COUNT(*) FROM date_plans)::NUMERIC, 0) * 100, 
    2
  ) AS percentage
FROM date_plans
GROUP BY status
ORDER BY count DESC;

-- 平均予算・所要時間
SELECT 
  ROUND(AVG(budget), 0) AS avg_budget_yen,
  ROUND(AVG(duration), 0) AS avg_duration_minutes,
  ROUND(AVG(duration) / 60.0, 1) AS avg_duration_hours
FROM date_plans
WHERE budget IS NOT NULL AND duration IS NOT NULL;

-- ============================================
-- 5. 人気の場所
-- ============================================

-- 都道府県別プラン数
SELECT 
  location_prefecture,
  COUNT(*) AS plan_count,
  ROUND(AVG(budget), 0) AS avg_budget
FROM date_plans
WHERE location_prefecture IS NOT NULL
GROUP BY location_prefecture
ORDER BY plan_count DESC
LIMIT 10;

-- 都市別プラン数
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
-- 6. AI生成統計
-- ============================================

-- AI生成数の推移（日別・過去30日）
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS ai_plans
FROM date_plans
WHERE ai_generated = true
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- AI生成の成功率
SELECT 
  COUNT(*) AS total_attempts,
  COUNT(*) FILTER (WHERE status = 'draft') AS successful,
  COUNT(*) FILTER (WHERE status = 'generating') AS in_progress,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'draft')::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    2
  ) AS success_rate_percent
FROM date_plans
WHERE ai_generated = true;

-- ============================================
-- 7. フィードバック統計
-- ============================================

-- 総合評価
SELECT 
  COUNT(*) AS total_feedback,
  ROUND(AVG(rating), 2) AS avg_rating,
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
  ROUND(
    COUNT(*)::NUMERIC / 
    NULLIF((SELECT COUNT(*) FROM plan_feedback)::NUMERIC, 0) * 100, 
    2
  ) AS percentage
FROM plan_feedback
GROUP BY rating
ORDER BY rating DESC;

-- ============================================
-- 8. プランアイテム統計
-- ============================================

-- アイテムタイプ別人気度
SELECT 
  type,
  COUNT(*) AS count,
  ROUND(AVG(cost), 0) AS avg_cost,
  ROUND(AVG(duration), 0) AS avg_duration_min
FROM plan_items
GROUP BY type
ORDER BY count DESC;

-- 平均アイテム数/プラン
SELECT 
  ROUND(AVG(item_count), 1) AS avg_items_per_plan
FROM (
  SELECT plan_id, COUNT(*) AS item_count
  FROM plan_items
  GROUP BY plan_id
) AS counts;

-- ============================================
-- 9. 招待コード統計
-- ============================================

-- 招待コードの状態別数
SELECT 
  status,
  COUNT(*) AS count,
  ROUND(
    COUNT(*)::NUMERIC / 
    NULLIF((SELECT COUNT(*) FROM couple_invitations)::NUMERIC, 0) * 100, 
    2
  ) AS percentage
FROM couple_invitations
GROUP BY status
ORDER BY count DESC;

-- 招待コードの成功率
SELECT 
  COUNT(*) AS total_invitations,
  COUNT(*) FILTER (WHERE status = 'used') AS used,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'used')::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    2
  ) AS success_rate_percent
FROM couple_invitations;

-- ============================================
-- 10. アクティビティ統計
-- ============================================

-- 日別アクティビティ（過去7日）
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS total_actions,
  COUNT(*) FILTER (WHERE ai_generated = true) AS ai_generations,
  COUNT(DISTINCT created_by) AS active_users
FROM date_plans
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 時間帯別アクティビティ
SELECT 
  EXTRACT(HOUR FROM created_at) AS hour,
  COUNT(*) AS plan_count
FROM date_plans
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- ============================================
-- 11. テーブルごとのレコード数（簡易版）
-- ============================================

-- 各テーブルのレコード数
SELECT 'auth.users' AS table_name, COUNT(*) AS record_count FROM auth.users
UNION ALL
SELECT 'profiles' AS table_name, COUNT(*) AS record_count FROM profiles
UNION ALL
SELECT 'couples' AS table_name, COUNT(*) AS record_count FROM couples
UNION ALL
SELECT 'couple_invitations' AS table_name, COUNT(*) AS record_count FROM couple_invitations
UNION ALL
SELECT 'date_plans' AS table_name, COUNT(*) AS record_count FROM date_plans
UNION ALL
SELECT 'plan_items' AS table_name, COUNT(*) AS record_count FROM plan_items
UNION ALL
SELECT 'plan_templates' AS table_name, COUNT(*) AS record_count FROM plan_templates
UNION ALL
SELECT 'plan_feedback' AS table_name, COUNT(*) AS record_count FROM plan_feedback
ORDER BY record_count DESC;

