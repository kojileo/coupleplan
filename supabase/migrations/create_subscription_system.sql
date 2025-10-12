-- Migration: Create Subscription System
-- Created: 2025-10-11
-- Purpose: AIプラン生成の制限機能を実装（Stripe連携なし）

-- =========================================
-- 1. subscription_plans テーブル
-- =========================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'premium'
  display_name TEXT NOT NULL, -- 'Free', 'Premium'
  price_monthly INTEGER NOT NULL, -- 0, 480 (円)
  daily_plan_limit INTEGER, -- 3, NULL (無制限)
  monthly_plan_limit INTEGER, -- 10, NULL (無制限)
  max_saved_plans INTEGER, -- 5, NULL (無制限)
  features JSONB DEFAULT '{}'::jsonb, -- その他の機能フラグ
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS有効化
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- ポリシー: アクティブなプランは全員が閲覧可能
CREATE POLICY "Plans are viewable by everyone"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- =========================================
-- 2. user_subscriptions テーブル
-- =========================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
  -- Stripe関連（将来用、現在は未使用）
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON user_subscriptions(status);

-- RLS有効化
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のサブスクのみ閲覧可能
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: システムによる作成（トリガー経由）
CREATE POLICY "System can insert subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (true);

-- =========================================
-- 3. plan_generation_usage テーブル
-- =========================================

CREATE TABLE IF NOT EXISTS plan_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES date_plans(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  -- インデックス用の日付カラム（JST基準）
  generation_date DATE GENERATED ALWAYS AS (DATE(generated_at AT TIME ZONE 'Asia/Tokyo')) STORED,
  generation_month DATE GENERATED ALWAYS AS (DATE_TRUNC('month', (generated_at AT TIME ZONE 'Asia/Tokyo'))::DATE) STORED
);

-- パフォーマンス用インデックス
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON plan_generation_usage(user_id, generation_date);
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON plan_generation_usage(user_id, generation_month);
CREATE INDEX IF NOT EXISTS idx_usage_user_generated ON plan_generation_usage(user_id, generated_at DESC);

-- RLS有効化
ALTER TABLE plan_generation_usage ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の履歴のみ閲覧可能
CREATE POLICY "Users can view own usage"
  ON plan_generation_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: ユーザーは自分の履歴を作成可能
CREATE POLICY "Users can insert own usage"
  ON plan_generation_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =========================================
-- 4. 初期データ投入
-- =========================================

-- Freeプラン
INSERT INTO subscription_plans (name, display_name, price_monthly, daily_plan_limit, monthly_plan_limit, max_saved_plans, features)
VALUES (
  'free',
  'Free',
  0,
  3,
  10,
  5,
  '{"ai_plan_generation": true, "plan_save": true, "partner_linkage": true, "basic_features": true}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price_monthly = EXCLUDED.price_monthly,
  daily_plan_limit = EXCLUDED.daily_plan_limit,
  monthly_plan_limit = EXCLUDED.monthly_plan_limit,
  max_saved_plans = EXCLUDED.max_saved_plans,
  features = EXCLUDED.features,
  updated_at = now();

-- Premiumプラン（将来用）
INSERT INTO subscription_plans (name, display_name, price_monthly, daily_plan_limit, monthly_plan_limit, max_saved_plans, features)
VALUES (
  'premium',
  'Premium',
  480,
  NULL, -- 無制限
  NULL, -- 無制限
  NULL, -- 無制限
  '{"ai_plan_generation": true, "plan_save": true, "partner_linkage": true, "priority_support": true, "future_features": true, "advanced_analytics": true}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price_monthly = EXCLUDED.price_monthly,
  daily_plan_limit = EXCLUDED.daily_plan_limit,
  monthly_plan_limit = EXCLUDED.monthly_plan_limit,
  max_saved_plans = EXCLUDED.max_saved_plans,
  features = EXCLUDED.features,
  updated_at = now();

-- =========================================
-- 5. トリガー関数: 新規ユーザーに自動的にFreeプランを割り当て
-- =========================================

CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Freeプランのidを取得
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE name = 'free' AND is_active = true 
  LIMIT 1;
  
  -- プランが見つかった場合のみサブスクを作成
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, free_plan_id, 'active')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを作成（存在しない場合のみ）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();

-- =========================================
-- 6. 既存ユーザーへのFreeプラン割り当て
-- =========================================

-- 既存ユーザーでサブスクが未設定の場合、Freeプランを割り当て
DO $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Freeプランのidを取得
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE name = 'free' AND is_active = true 
  LIMIT 1;
  
  -- プランが見つかった場合のみ処理
  IF free_plan_id IS NOT NULL THEN
    -- サブスクが未設定のユーザーにFreeプランを割り当て
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    SELECT u.id, free_plan_id, 'active'
    FROM auth.users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id
    WHERE us.id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- =========================================
-- 7. ヘルパー関数（オプション）
-- =========================================

-- ユーザーの現在の制限状況を取得する関数
CREATE OR REPLACE FUNCTION get_user_plan_limits(p_user_id UUID)
RETURNS TABLE (
  plan_name TEXT,
  daily_limit INTEGER,
  monthly_limit INTEGER,
  daily_used BIGINT,
  monthly_used BIGINT,
  daily_remaining INTEGER,
  monthly_remaining INTEGER,
  can_generate BOOLEAN
) AS $$
DECLARE
  v_today DATE;
  v_this_month DATE;
BEGIN
  -- 現在の日時（JST）
  v_today := DATE(now() AT TIME ZONE 'Asia/Tokyo');
  v_this_month := DATE_TRUNC('month', (now() AT TIME ZONE 'Asia/Tokyo'))::DATE;
  
  RETURN QUERY
  SELECT 
    sp.name AS plan_name,
    sp.daily_plan_limit AS daily_limit,
    sp.monthly_plan_limit AS monthly_limit,
    COALESCE(
      (SELECT COUNT(*) FROM plan_generation_usage 
       WHERE user_id = p_user_id AND generation_date = v_today), 
      0
    ) AS daily_used,
    COALESCE(
      (SELECT COUNT(*) FROM plan_generation_usage 
       WHERE user_id = p_user_id AND generation_month = v_this_month), 
      0
    ) AS monthly_used,
    CASE 
      WHEN sp.daily_plan_limit IS NULL THEN NULL
      ELSE GREATEST(0, sp.daily_plan_limit - COALESCE(
        (SELECT COUNT(*) FROM plan_generation_usage 
         WHERE user_id = p_user_id AND generation_date = v_today), 
        0
      ))
    END AS daily_remaining,
    CASE 
      WHEN sp.monthly_plan_limit IS NULL THEN NULL
      ELSE GREATEST(0, sp.monthly_plan_limit - COALESCE(
        (SELECT COUNT(*) FROM plan_generation_usage 
         WHERE user_id = p_user_id AND generation_month = v_this_month), 
        0
      ))
    END AS monthly_remaining,
    (
      (sp.daily_plan_limit IS NULL OR sp.daily_plan_limit > COALESCE(
        (SELECT COUNT(*) FROM plan_generation_usage 
         WHERE user_id = p_user_id AND generation_date = v_today), 
        0
      )) AND
      (sp.monthly_plan_limit IS NULL OR sp.monthly_plan_limit > COALESCE(
        (SELECT COUNT(*) FROM plan_generation_usage 
         WHERE user_id = p_user_id AND generation_month = v_this_month), 
        0
      ))
    ) AS can_generate
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 8. コメント追加（ドキュメンテーション）
-- =========================================

COMMENT ON TABLE subscription_plans IS 'サブスクリプションプランの定義（FreeとPremium）';
COMMENT ON TABLE user_subscriptions IS 'ユーザーの現在のサブスクリプション状態';
COMMENT ON TABLE plan_generation_usage IS 'AIプラン生成の使用履歴（日次・月次制限のため）';

COMMENT ON COLUMN subscription_plans.daily_plan_limit IS '日次制限（NULL = 無制限）';
COMMENT ON COLUMN subscription_plans.monthly_plan_limit IS '月次制限（NULL = 無制限）';
COMMENT ON COLUMN subscription_plans.max_saved_plans IS 'プラン保存数制限（NULL = 無制限）';

COMMENT ON COLUMN plan_generation_usage.generation_date IS 'プラン生成日（JST、日次制限用）';
COMMENT ON COLUMN plan_generation_usage.generation_month IS 'プラン生成月（JST、月次制限用）';

-- =========================================
-- マイグレーション完了
-- =========================================

