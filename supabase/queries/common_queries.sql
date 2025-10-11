-- よく使うクエリ集
-- 日常的な運用で頻繁に使用するクエリ

-- ============================================
-- 1. プラン検索
-- ============================================

-- 特定のカップルのプラン一覧
SELECT 
  dp.*,
  (SELECT COUNT(*) FROM plan_items WHERE plan_id = dp.id) AS item_count,
  (SELECT AVG(rating) FROM plan_feedback WHERE plan_id = dp.id) AS avg_rating
FROM date_plans dp
WHERE dp.couple_id = 'couple-uuid-here'
ORDER BY dp.created_at DESC;

-- 都道府県でプランを検索
SELECT 
  id,
  title,
  budget,
  duration,
  location_prefecture,
  location_city,
  created_at
FROM date_plans
WHERE location_prefecture = '東京都'
ORDER BY created_at DESC
LIMIT 50;

-- 予算範囲でプランを検索
SELECT 
  id,
  title,
  budget,
  duration,
  location_city,
  created_at
FROM date_plans
WHERE budget BETWEEN 5000 AND 15000
ORDER BY created_at DESC;

-- ============================================
-- 2. プラン詳細の取得
-- ============================================

-- プラン詳細（アイテムとフィードバック含む）
SELECT 
  dp.*,
  json_agg(
    json_build_object(
      'id', pi.id,
      'type', pi.type,
      'name', pi.name,
      'description', pi.description,
      'location', pi.location,
      'latitude', pi.latitude,
      'longitude', pi.longitude,
      'start_time', pi.start_time,
      'duration', pi.duration,
      'cost', pi.cost,
      'order_index', pi.order_index
    ) ORDER BY pi.order_index
  ) FILTER (WHERE pi.id IS NOT NULL) AS items,
  (
    SELECT json_agg(
      json_build_object(
        'rating', pf.rating,
        'comment', pf.comment,
        'submitted_at', pf.submitted_at
      )
    )
    FROM plan_feedback pf
    WHERE pf.plan_id = dp.id
  ) AS feedback
FROM date_plans dp
LEFT JOIN plan_items pi ON pi.plan_id = dp.id
WHERE dp.id = 'plan-uuid-here'
GROUP BY dp.id;

-- ============================================
-- 3. ユーザー情報の取得
-- ============================================

-- ユーザーの完全な情報
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  p.full_name,
  p.prefecture,
  p.city,
  p.birth_date,
  p.anniversary_date,
  c.id AS couple_id,
  CASE 
    WHEN c.user1_id = u.id THEN u2.email
    WHEN c.user2_id = u.id THEN u1.email
  END AS partner_email,
  (SELECT COUNT(*) FROM date_plans WHERE created_by = u.id) AS plans_created
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN couples c ON c.user1_id = u.id OR c.user2_id = u.id
LEFT JOIN auth.users u1 ON c.user1_id = u1.id
LEFT JOIN auth.users u2 ON c.user2_id = u2.id
WHERE u.email = 'user@example.com';

-- ============================================
-- 4. カップル情報の取得
-- ============================================

-- カップルの詳細情報
SELECT 
  c.id,
  u1.email AS user1_email,
  u2.email AS user2_email,
  c.relationship_status,
  c.anniversary_date,
  c.created_at,
  (SELECT COUNT(*) FROM date_plans WHERE couple_id = c.id) AS total_plans,
  (SELECT COUNT(*) FROM date_plans WHERE couple_id = c.id AND status = 'completed') AS completed_plans,
  (SELECT SUM(budget) FROM date_plans WHERE couple_id = c.id) AS total_budget_spent,
  (SELECT AVG(rating) FROM plan_feedback pf 
   JOIN date_plans dp ON pf.plan_id = dp.id 
   WHERE dp.couple_id = c.id) AS avg_plan_rating
FROM couples c
JOIN auth.users u1 ON c.user1_id = u1.id
JOIN auth.users u2 ON c.user2_id = u2.id
WHERE c.id = 'couple-uuid-here';

-- ============================================
-- 5. AI生成関連のクエリ
-- ============================================

-- AI生成プランの統計
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS ai_plans_generated,
  AVG(budget) AS avg_budget,
  AVG(duration) AS avg_duration,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count
FROM date_plans
WHERE ai_generated = true
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- AI生成失敗率
SELECT 
  COUNT(*) AS total_attempts,
  COUNT(*) FILTER (WHERE status = 'generating') AS stuck_generating,
  COUNT(*) FILTER (WHERE status = 'draft' AND ai_generated = true) AS successful,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'generating')::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100,
    2
  ) AS failure_rate_percent
FROM date_plans
WHERE ai_generated = true;

-- ============================================
-- 6. 人気の分析
-- ============================================

-- 人気のある場所（プラン作成数）
SELECT 
  location_prefecture,
  location_city,
  COUNT(*) AS plan_count,
  AVG(budget) AS avg_budget,
  AVG(duration) AS avg_duration,
  AVG((SELECT AVG(rating) FROM plan_feedback WHERE plan_id = date_plans.id)) AS avg_rating
FROM date_plans
WHERE location_prefecture IS NOT NULL
GROUP BY location_prefecture, location_city
ORDER BY plan_count DESC
LIMIT 20;

-- 人気のアクティビティタイプ
SELECT 
  type,
  COUNT(*) AS count,
  AVG(cost) AS avg_cost,
  AVG(duration) AS avg_duration
FROM plan_items
GROUP BY type
ORDER BY count DESC;

-- ============================================
-- 7. フィードバック分析
-- ============================================

-- 詳細なフィードバック分析
SELECT 
  dp.id AS plan_id,
  dp.title,
  dp.location_city,
  pf.rating,
  pf.comment,
  pf.submitted_at,
  u.email AS reviewer_email
FROM plan_feedback pf
JOIN date_plans dp ON pf.plan_id = dp.id
JOIN auth.users u ON pf.user_id = u.id
ORDER BY pf.submitted_at DESC
LIMIT 100;

-- 評価別のプラン数
SELECT 
  pf.rating,
  COUNT(DISTINCT pf.plan_id) AS plan_count,
  COUNT(*) AS feedback_count,
  ROUND(AVG(dp.budget), 2) AS avg_budget,
  ROUND(AVG(dp.duration), 2) AS avg_duration
FROM plan_feedback pf
JOIN date_plans dp ON pf.plan_id = dp.id
GROUP BY pf.rating
ORDER BY pf.rating DESC;

-- ============================================
-- 8. テンプレート管理
-- ============================================

-- 人気のテンプレート
SELECT 
  pt.id,
  pt.name,
  pt.category,
  pt.popularity,
  pt.is_public,
  u.email AS creator_email,
  pt.created_at
FROM plan_templates pt
LEFT JOIN auth.users u ON pt.created_by = u.id
ORDER BY pt.popularity DESC
LIMIT 50;

-- テンプレートからのプラン生成数（実装されている場合）
-- SELECT 
--   pt.id,
--   pt.name,
--   COUNT(dp.id) AS plans_created_from_template
-- FROM plan_templates pt
-- LEFT JOIN date_plans dp ON dp.template_id = pt.id
-- GROUP BY pt.id, pt.name
-- ORDER BY plans_created_from_template DESC;

-- ============================================
-- 9. 招待コードの管理
-- ============================================

-- アクティブな招待コード一覧
SELECT 
  ci.invitation_code,
  u.email AS inviter_email,
  ci.created_at,
  ci.expires_at,
  EXTRACT(EPOCH FROM (ci.expires_at - NOW())) / 3600 AS hours_remaining
FROM couple_invitations ci
JOIN auth.users u ON ci.from_user_id = u.id
WHERE ci.status = 'active'
  AND ci.expires_at > NOW()
ORDER BY ci.expires_at;

-- 招待コードの使用履歴
SELECT 
  ci.invitation_code,
  u1.email AS inviter_email,
  u2.email AS invitee_email,
  ci.status,
  ci.created_at,
  ci.updated_at
FROM couple_invitations ci
JOIN auth.users u1 ON ci.from_user_id = u1.id
LEFT JOIN auth.users u2 ON ci.to_user_id = u2.id
WHERE ci.status = 'used'
ORDER BY ci.updated_at DESC;

-- ============================================
-- 10. ダッシュボード用集計クエリ
-- ============================================

-- 管理者ダッシュボード用の統計情報
SELECT 
  json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_couples', (SELECT COUNT(*) FROM couples),
    'total_plans', (SELECT COUNT(*) FROM date_plans),
    'ai_generated_plans', (SELECT COUNT(*) FROM date_plans WHERE ai_generated = true),
    'completed_plans', (SELECT COUNT(*) FROM date_plans WHERE status = 'completed'),
    'total_feedback', (SELECT COUNT(*) FROM plan_feedback),
    'avg_rating', (SELECT ROUND(AVG(rating), 2) FROM plan_feedback),
    'active_users_7d', (
      SELECT COUNT(DISTINCT created_by) 
      FROM date_plans 
      WHERE created_at > NOW() - INTERVAL '7 days'
    ),
    'new_users_today', (
      SELECT COUNT(*) 
      FROM auth.users 
      WHERE created_at::DATE = CURRENT_DATE
    ),
    'new_plans_today', (
      SELECT COUNT(*) 
      FROM date_plans 
      WHERE created_at::DATE = CURRENT_DATE
    )
  ) AS dashboard_stats;

