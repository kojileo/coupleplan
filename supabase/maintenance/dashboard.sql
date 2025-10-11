-- ダッシュボード統計（1つの結果セットで表示）
-- システム全体の重要な指標を一覧で確認

-- ============================================
-- 統合ダッシュボード
-- ============================================

SELECT 
  json_build_object(
    -- ユーザー統計
    'users', json_build_object(
      'total', (SELECT COUNT(*) FROM auth.users),
      'new_today', (SELECT COUNT(*) FROM auth.users WHERE created_at::DATE = CURRENT_DATE),
      'new_this_week', (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days'),
      'new_this_month', (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '30 days')
    ),
    
    -- カップル統計
    'couples', json_build_object(
      'total', (SELECT COUNT(*) FROM couples),
      'new_this_week', (SELECT COUNT(*) FROM couples WHERE created_at > NOW() - INTERVAL '7 days'),
      'new_this_month', (SELECT COUNT(*) FROM couples WHERE created_at > NOW() - INTERVAL '30 days'),
      'formation_rate_percent', ROUND(
        (SELECT COUNT(*) FROM couples)::NUMERIC / 
        NULLIF((SELECT COUNT(*) FROM auth.users)::NUMERIC, 0) * 100, 
        2
      )
    ),
    
    -- デートプラン統計
    'plans', json_build_object(
      'total', (SELECT COUNT(*) FROM date_plans),
      'today', (SELECT COUNT(*) FROM date_plans WHERE created_at::DATE = CURRENT_DATE),
      'this_week', (SELECT COUNT(*) FROM date_plans WHERE created_at > NOW() - INTERVAL '7 days'),
      'this_month', (SELECT COUNT(*) FROM date_plans WHERE created_at > NOW() - INTERVAL '30 days'),
      'ai_generated', (SELECT COUNT(*) FROM date_plans WHERE ai_generated = true),
      'ai_rate_percent', ROUND(
        (SELECT COUNT(*) FROM date_plans WHERE ai_generated = true)::NUMERIC / 
        NULLIF((SELECT COUNT(*) FROM date_plans)::NUMERIC, 0) * 100, 
        2
      ),
      'avg_budget', ROUND((SELECT AVG(budget) FROM date_plans WHERE budget IS NOT NULL), 0),
      'avg_duration_hours', ROUND((SELECT AVG(duration) / 60.0 FROM date_plans WHERE duration IS NOT NULL), 1)
    ),
    
    -- ステータス別
    'plan_status', (
      SELECT json_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) AS count
        FROM date_plans
        GROUP BY status
      ) s
    ),
    
    -- フィードバック統計
    'feedback', json_build_object(
      'total', (SELECT COUNT(*) FROM plan_feedback),
      'avg_rating', ROUND((SELECT AVG(rating) FROM plan_feedback), 2),
      'positive_count', (SELECT COUNT(*) FROM plan_feedback WHERE rating >= 4),
      'positive_rate_percent', ROUND(
        (SELECT COUNT(*) FROM plan_feedback WHERE rating >= 4)::NUMERIC / 
        NULLIF((SELECT COUNT(*) FROM plan_feedback)::NUMERIC, 0) * 100, 
        2
      )
    ),
    
    -- 人気の場所 Top 5
    'top_locations', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          location_prefecture,
          location_city,
          COUNT(*) AS plan_count
        FROM date_plans
        WHERE location_city IS NOT NULL
        GROUP BY location_prefecture, location_city
        ORDER BY plan_count DESC
        LIMIT 5
      ) t
    ),
    
    -- 人気のアクティビティ Top 5
    'top_activities', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          type,
          COUNT(*) AS count,
          ROUND(AVG(cost), 0) AS avg_cost
        FROM plan_items
        GROUP BY type
        ORDER BY count DESC
        LIMIT 5
      ) t
    ),
    
    -- 招待コード統計
    'invitations', json_build_object(
      'total', (SELECT COUNT(*) FROM couple_invitations),
      'active', (SELECT COUNT(*) FROM couple_invitations WHERE status = 'active' AND expires_at > NOW()),
      'used', (SELECT COUNT(*) FROM couple_invitations WHERE status = 'used'),
      'success_rate_percent', ROUND(
        (SELECT COUNT(*) FROM couple_invitations WHERE status = 'used')::NUMERIC / 
        NULLIF((SELECT COUNT(*) FROM couple_invitations)::NUMERIC, 0) * 100, 
        2
      )
    ),
    
    -- アクティビティ（過去7日）
    'activity_last_7d', json_build_object(
      'plans_created', (SELECT COUNT(*) FROM date_plans WHERE created_at > NOW() - INTERVAL '7 days'),
      'ai_plans', (SELECT COUNT(*) FROM date_plans WHERE ai_generated = true AND created_at > NOW() - INTERVAL '7 days'),
      'active_users', (SELECT COUNT(DISTINCT created_by) FROM date_plans WHERE created_at > NOW() - INTERVAL '7 days'),
      'new_couples', (SELECT COUNT(*) FROM couples WHERE created_at > NOW() - INTERVAL '7 days')
    )
  ) AS dashboard;

