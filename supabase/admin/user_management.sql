-- 管理者向けユーザー管理SQL
-- ユーザーアカウントの管理、統計、トラブルシューティング

-- ============================================
-- 1. ユーザー一覧と詳細情報
-- ============================================

-- 全ユーザーの概要
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  p.full_name,
  p.prefecture,
  p.city,
  CASE 
    WHEN c1.id IS NOT NULL OR c2.id IS NOT NULL THEN 'Coupled'
    ELSE 'Single'
  END AS relationship_status,
  (SELECT COUNT(*) FROM date_plans WHERE created_by = u.id) AS plans_created
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN couples c1 ON c1.user1_id = u.id
LEFT JOIN couples c2 ON c2.user2_id = u.id
ORDER BY u.created_at DESC;

-- ============================================
-- 2. アクティビティ分析
-- ============================================

-- アクティブユーザーの判定
SELECT 
  u.id,
  u.email,
  u.last_sign_in_at,
  CASE 
    WHEN u.last_sign_in_at > NOW() - INTERVAL '7 days' THEN 'Active'
    WHEN u.last_sign_in_at > NOW() - INTERVAL '30 days' THEN 'Recent'
    WHEN u.last_sign_in_at > NOW() - INTERVAL '90 days' THEN 'Inactive'
    ELSE 'Dormant'
  END AS activity_status,
  (SELECT COUNT(*) FROM date_plans WHERE created_by = u.id) AS plans_count,
  (SELECT MAX(created_at) FROM date_plans WHERE created_by = u.id) AS last_plan_created
FROM auth.users u
ORDER BY u.last_sign_in_at DESC NULLS LAST;

-- ユーザーエンゲージメントスコア
WITH user_activity AS (
  SELECT 
    u.id,
    u.email,
    EXTRACT(EPOCH FROM (NOW() - u.last_sign_in_at)) / 86400 AS days_since_login,
    (SELECT COUNT(*) FROM date_plans WHERE created_by = u.id) AS plans_created,
    (SELECT COUNT(*) FROM plan_feedback WHERE user_id = u.id) AS feedback_given,
    CASE 
      WHEN c1.id IS NOT NULL OR c2.id IS NOT NULL THEN 1
      ELSE 0
    END AS is_coupled
  FROM auth.users u
  LEFT JOIN couples c1 ON c1.user1_id = u.id
  LEFT JOIN couples c2 ON c2.user2_id = u.id
)
SELECT 
  email,
  plans_created,
  feedback_given,
  is_coupled,
  days_since_login,
  -- エンゲージメントスコア計算
  (
    (plans_created * 10) +
    (feedback_given * 5) +
    (is_coupled * 20) +
    CASE 
      WHEN days_since_login <= 7 THEN 30
      WHEN days_since_login <= 30 THEN 15
      ELSE 0
    END
  ) AS engagement_score
FROM user_activity
ORDER BY engagement_score DESC
LIMIT 100;

-- ============================================
-- 3. カップル管理
-- ============================================

-- カップル一覧と活動状況
SELECT 
  c.id AS couple_id,
  u1.email AS user1_email,
  u2.email AS user2_email,
  c.relationship_status,
  c.anniversary_date,
  c.created_at AS coupled_since,
  (SELECT COUNT(*) FROM date_plans WHERE couple_id = c.id) AS total_plans,
  (SELECT MAX(created_at) FROM date_plans WHERE couple_id = c.id) AS last_plan_created,
  EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM date_plans WHERE couple_id = c.id))) / 86400 AS days_since_last_plan
FROM couples c
JOIN auth.users u1 ON c.user1_id = u1.id
JOIN auth.users u2 ON c.user2_id = u2.id
ORDER BY c.created_at DESC;

-- 非アクティブなカップル（30日以上プラン作成なし）
SELECT 
  c.id,
  u1.email AS user1_email,
  u2.email AS user2_email,
  c.created_at AS coupled_since,
  (SELECT MAX(created_at) FROM date_plans WHERE couple_id = c.id) AS last_plan_created,
  EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM date_plans WHERE couple_id = c.id))) / 86400 AS days_inactive
FROM couples c
JOIN auth.users u1 ON c.user1_id = u1.id
JOIN auth.users u2 ON c.user2_id = u2.id
WHERE (SELECT MAX(created_at) FROM date_plans WHERE couple_id = c.id) < NOW() - INTERVAL '30 days'
  OR (SELECT MAX(created_at) FROM date_plans WHERE couple_id = c.id) IS NULL
ORDER BY days_inactive DESC NULLS LAST;

-- ============================================
-- 4. 招待コード管理
-- ============================================

-- 期限切れ招待コードの一括更新
UPDATE couple_invitations
SET status = 'expired'
WHERE expires_at < NOW()
  AND status = 'active';

-- 招待コード統計
SELECT 
  u.email AS inviter_email,
  ci.invitation_code,
  ci.status,
  ci.created_at,
  ci.expires_at,
  CASE 
    WHEN ci.expires_at < NOW() THEN 'Expired'
    WHEN ci.status = 'used' THEN 'Used'
    WHEN ci.status = 'active' THEN 'Active'
    ELSE ci.status
  END AS current_status
FROM couple_invitations ci
JOIN auth.users u ON ci.from_user_id = u.id
ORDER BY ci.created_at DESC;

-- 未使用の招待コード（アクティブ）
SELECT 
  u.email,
  ci.invitation_code,
  ci.created_at,
  ci.expires_at,
  EXTRACT(EPOCH FROM (ci.expires_at - NOW())) / 3600 AS hours_remaining
FROM couple_invitations ci
JOIN auth.users u ON ci.from_user_id = u.id
WHERE ci.status = 'active'
  AND ci.expires_at > NOW()
ORDER BY ci.expires_at;

-- ============================================
-- 5. プラン品質分析
-- ============================================

-- AI生成プランの品質（フィードバックスコア）
SELECT 
  dp.ai_generation_id,
  COUNT(DISTINCT dp.id) AS plans_count,
  AVG(pf.rating) AS avg_rating,
  COUNT(pf.id) AS feedback_count
FROM date_plans dp
LEFT JOIN plan_feedback pf ON pf.plan_id = dp.id
WHERE dp.ai_generated = true
  AND dp.ai_generation_id IS NOT NULL
GROUP BY dp.ai_generation_id
ORDER BY avg_rating DESC NULLS LAST;

-- 低評価プランの分析
SELECT 
  dp.id,
  dp.title,
  dp.location_prefecture,
  dp.location_city,
  dp.budget,
  dp.duration,
  AVG(pf.rating) AS avg_rating,
  COUNT(pf.id) AS feedback_count,
  STRING_AGG(pf.comment, '; ') AS comments
FROM date_plans dp
JOIN plan_feedback pf ON pf.plan_id = dp.id
GROUP BY dp.id, dp.title, dp.location_prefecture, dp.location_city, dp.budget, dp.duration
HAVING AVG(pf.rating) < 3
ORDER BY avg_rating;

-- ============================================
-- 6. データ整合性チェック
-- ============================================

-- カップル関係の整合性チェック
SELECT 
  'Couples without user1' AS issue,
  COUNT(*) AS count
FROM couples
WHERE user1_id NOT IN (SELECT id FROM auth.users)
UNION ALL
SELECT 
  'Couples without user2' AS issue,
  COUNT(*) AS count
FROM couples
WHERE user2_id NOT IN (SELECT id FROM auth.users)
UNION ALL
SELECT 
  'Plans without couple' AS issue,
  COUNT(*) AS count
FROM date_plans
WHERE couple_id NOT IN (SELECT id FROM couples)
UNION ALL
SELECT 
  'Plans without creator' AS issue,
  COUNT(*) AS count
FROM date_plans
WHERE created_by NOT IN (SELECT id FROM auth.users);

-- ============================================
-- 7. ユーザー削除（管理者用）
-- ============================================

-- ユーザーを完全削除する関数
-- 注意: CASCADE削除により関連データもすべて削除されます

CREATE OR REPLACE FUNCTION admin_delete_user(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_deleted_data JSON;
BEGIN
  -- 削除前のデータ統計を取得
  SELECT json_build_object(
    'user_id', p_user_id,
    'plans_deleted', (SELECT COUNT(*) FROM date_plans WHERE created_by = p_user_id),
    'feedback_deleted', (SELECT COUNT(*) FROM plan_feedback WHERE user_id = p_user_id),
    'couples_affected', (SELECT COUNT(*) FROM couples WHERE user1_id = p_user_id OR user2_id = p_user_id),
    'invitations_deleted', (SELECT COUNT(*) FROM couple_invitations WHERE from_user_id = p_user_id)
  ) INTO v_deleted_data;
  
  -- カップル関係を解除（NULLに設定）
  UPDATE couples SET user1_id = NULL WHERE user1_id = p_user_id;
  UPDATE couples SET user2_id = NULL WHERE user2_id = p_user_id;
  
  -- 孤立したカップルを削除
  DELETE FROM couples WHERE user1_id IS NULL AND user2_id IS NULL;
  
  -- プロフィールを削除
  DELETE FROM profiles WHERE user_id = p_user_id;
  
  -- 招待コードを削除
  DELETE FROM couple_invitations WHERE from_user_id = p_user_id;
  
  -- auth.usersからユーザーを削除
  -- 注意: auth.usersの削除はSupabase Authの管理画面から行うことを推奨
  -- DELETE FROM auth.users WHERE id = p_user_id;
  
  RETURN v_deleted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用例（管理者のみ）:
-- SELECT admin_delete_user('user-uuid-here');

-- ============================================
-- 8. ユーザーの一時停止
-- ============================================

-- ユーザーアカウントを一時停止する関数
CREATE OR REPLACE FUNCTION admin_suspend_user(p_user_id UUID, p_reason TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- プロフィールに停止フラグを追加（フィールドがある場合）
  -- UPDATE profiles SET is_suspended = true, suspension_reason = p_reason WHERE user_id = p_user_id;
  
  -- すべてのプランをアーカイブ
  UPDATE date_plans SET status = 'archived' WHERE created_by = p_user_id;
  
  -- 招待コードを無効化
  UPDATE couple_invitations SET status = 'cancelled' WHERE from_user_id = p_user_id AND status = 'active';
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用例:
-- SELECT admin_suspend_user('user-uuid-here', 'Violation of terms');

