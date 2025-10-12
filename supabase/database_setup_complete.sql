-- =========================================
-- CouplePlan データベース完全セットアップSQL
-- =========================================
-- 作成日: 2025-01-27
-- 目的: データベースのセットアップに必要なSQLを抜け漏れなく統合
-- 実行順序: このファイルを順番に実行することで完全なデータベースが構築されます

-- =========================================
-- 1. 既存テーブルの削除（安全な順序で）
-- =========================================

-- 外部キー制約を持つテーブルから順番に削除
DROP TABLE IF EXISTS plan_feedback CASCADE;
DROP TABLE IF EXISTS plan_items CASCADE;
DROP TABLE IF EXISTS plan_generation_usage CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS couple_invitations CASCADE;
DROP TABLE IF EXISTS date_plans CASCADE;
DROP TABLE IF EXISTS plan_templates CASCADE;
DROP TABLE IF EXISTS couples CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =========================================
-- 2. 基本テーブル作成
-- =========================================

-- 2.1 profiles テーブル（ユーザープロフィール）
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 couples テーブル（カップル関係）
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, separated
  formed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- 2.3 couple_invitations テーブル（パートナー招待）
CREATE TABLE couple_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID,
  invitation_code VARCHAR(6) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, used, expired
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- 3. デートプラン関連テーブル
-- =========================================

-- 3.1 date_plans テーブル（デートプラン）
CREATE TABLE date_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  budget DECIMAL(10, 2),
  duration INTEGER, -- minutes
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, generating, completed, archived
  location_prefecture VARCHAR(50),
  location_city VARCHAR(100),
  location_station VARCHAR(100),
  preferences JSONB DEFAULT '[]'::jsonb,
  special_requests TEXT,
  ai_generated BOOLEAN DEFAULT false,
  ai_generation_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 plan_items テーブル（プランアイテム）
CREATE TABLE plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES date_plans(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- activity, restaurant, cafe, transportation, etc.
  name VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_time TIME,
  duration INTEGER, -- minutes
  cost DECIMAL(10, 2),
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 plan_templates テーブル（プランテンプレート）
CREATE TABLE plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  popularity INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 plan_feedback テーブル（プランフィードバック）
CREATE TABLE plan_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES date_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- 4. サブスクリプション関連テーブル
-- =========================================

-- 4.1 subscription_plans テーブル（サブスクリプションプラン）
CREATE TABLE subscription_plans (
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

-- 4.2 user_subscriptions テーブル（ユーザーサブスクリプション）
CREATE TABLE user_subscriptions (
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

-- 4.3 plan_generation_usage テーブル（プラン生成使用履歴）
CREATE TABLE plan_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES date_plans(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  -- インデックス用の日付カラム（JST基準）
  generation_date DATE GENERATED ALWAYS AS (DATE(generated_at AT TIME ZONE 'Asia/Tokyo')) STORED,
  generation_month DATE GENERATED ALWAYS AS (DATE_TRUNC('month', (generated_at AT TIME ZONE 'Asia/Tokyo'))::DATE) STORED
);

-- =========================================
-- 5. インデックス作成
-- =========================================

-- profiles テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- couples テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_couples_user1_id ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2_id ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_status ON couples(status);

-- couple_invitations テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_couple_invitations_code ON couple_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_couple_invitations_from_user ON couple_invitations(from_user_id);
CREATE INDEX IF NOT EXISTS idx_couple_invitations_status ON couple_invitations(status);

-- date_plans テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_date_plans_couple_id ON date_plans(couple_id);
CREATE INDEX IF NOT EXISTS idx_date_plans_created_by ON date_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_date_plans_status ON date_plans(status);
CREATE INDEX IF NOT EXISTS idx_date_plans_created_at ON date_plans(created_at DESC);

-- plan_items テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_plan_items_plan_id ON plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_order_index ON plan_items(plan_id, order_index);

-- plan_templates テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_plan_templates_category ON plan_templates(category);
CREATE INDEX IF NOT EXISTS idx_plan_templates_popularity ON plan_templates(popularity DESC);

-- plan_feedback テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_plan_feedback_plan_id ON plan_feedback(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_feedback_user_id ON plan_feedback(user_id);

-- subscription関連のインデックス
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON user_subscriptions(status);

-- plan_generation_usage のインデックス
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON plan_generation_usage(user_id, generation_date);
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON plan_generation_usage(user_id, generation_month);
CREATE INDEX IF NOT EXISTS idx_usage_user_generated ON plan_generation_usage(user_id, generated_at DESC);

-- =========================================
-- 6. 更新日時自動更新のトリガー関数
-- =========================================

-- 更新日時の自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON couples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couple_invitations_updated_at
  BEFORE UPDATE ON couple_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_date_plans_updated_at
  BEFORE UPDATE ON date_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_items_updated_at
  BEFORE UPDATE ON plan_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_templates_updated_at
  BEFORE UPDATE ON plan_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 7. Row Level Security (RLS) 設定
-- =========================================

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_generation_usage ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 8. RLSポリシー設定
-- =========================================

-- 8.1 profiles テーブルのポリシー
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8.2 couples テーブルのポリシー
CREATE POLICY "Users can view their couples" ON couples
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can create couples" ON couples
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their couples" ON couples
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- 8.3 couple_invitations テーブルのポリシー
CREATE POLICY "Users can view own invitations" ON couple_invitations
  FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "Users can create own invitations" ON couple_invitations
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update own invitations" ON couple_invitations
  FOR UPDATE USING (auth.uid() = from_user_id);

-- すべてのユーザーは有効な招待コードを検証可能
CREATE POLICY "Users can verify invitation codes" ON couple_invitations
  FOR SELECT USING (status = 'active' AND expires_at > NOW());

-- 8.4 date_plans テーブルのポリシー
CREATE POLICY "Users can view their couple's plans" ON date_plans
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      couple_id IN (
        SELECT id FROM couples 
        WHERE user1_id = auth.uid() OR user2_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create plans for their couple" ON date_plans
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    created_by = auth.uid() AND
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their couple's plans" ON date_plans
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      couple_id IN (
        SELECT id FROM couples 
        WHERE user1_id = auth.uid() OR user2_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own plans" ON date_plans
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND created_by = auth.uid()
  );

-- 8.5 plan_items テーブルのポリシー
CREATE POLICY "Users can view plan items of their couple's plans" ON plan_items
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      plan_id IN (
        SELECT id FROM date_plans
        WHERE couple_id IN (
          SELECT id FROM couples 
          WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage plan items of their couple's plans" ON plan_items
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      plan_id IN (
        SELECT id FROM date_plans
        WHERE couple_id IN (
          SELECT id FROM couples 
          WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
      )
    )
  );

-- 8.6 plan_templates テーブルのポリシー
-- 公開テンプレートは全員が閲覧可能
CREATE POLICY "Anyone can view public templates" ON plan_templates
  FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);

-- ユーザーは自分のテンプレートを管理可能
CREATE POLICY "Users can manage their own templates" ON plan_templates
  FOR ALL USING (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- 8.7 plan_feedback テーブルのポリシー
CREATE POLICY "Users can view feedback for their couple's plans" ON plan_feedback
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      plan_id IN (
        SELECT id FROM date_plans
        WHERE couple_id IN (
          SELECT id FROM couples 
          WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can submit feedback for their couple's plans" ON plan_feedback
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    user_id = auth.uid() AND
    plan_id IN (
      SELECT id FROM date_plans
      WHERE couple_id IN (
        SELECT id FROM couples 
        WHERE user1_id = auth.uid() OR user2_id = auth.uid()
      )
    )
  );

-- 8.8 subscription_plans テーブルのポリシー
CREATE POLICY "Plans are viewable by everyone" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- 8.9 user_subscriptions テーブルのポリシー
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (true);

-- 8.10 plan_generation_usage テーブルのポリシー
CREATE POLICY "Users can view own usage" ON plan_generation_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON plan_generation_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================
-- 9. 初期データ投入
-- =========================================

-- 9.1 サブスクリプションプランの初期データ
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
-- 10. トリガー関数とヘルパー関数
-- =========================================

-- 10.1 新規ユーザーに自動的にプロフィールとFreeプランを作成する関数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- 1. プロフィールを作成
  BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', 'ユーザー'),
      NEW.email
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;

  -- 2. Freeプランのidを取得
  SELECT id INTO free_plan_id 
  FROM public.subscription_plans 
  WHERE name = 'free' AND is_active = true 
  LIMIT 1;
  
  -- 3. プランが見つかった場合のみサブスクを作成
  IF free_plan_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_subscriptions (user_id, plan_id, status)
      VALUES (NEW.id, free_plan_id, 'active')
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create subscription for user %: %', NEW.id, SQLERRM;
    END;
  ELSE
    RAISE WARNING 'Free plan not found when creating user %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10.2 ユーザーの現在の制限状況を取得する関数
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
-- 11. トリガー設定
-- =========================================

-- 新規ユーザー作成時のトリガー
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =========================================
-- 12. 既存ユーザーへのプロフィールとFreeプラン割り当て
-- =========================================

-- 既存ユーザーでプロフィールやサブスクが未設定の場合、作成する
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
    -- 1. プロフィールが未作成のユーザーにプロフィールを作成
    INSERT INTO profiles (user_id, name, email)
    SELECT 
      u.id, 
      COALESCE(u.raw_user_meta_data->>'name', 'ユーザー'),
      u.email
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE p.id IS NULL
    ON CONFLICT (user_id) DO NOTHING;

    -- 2. サブスクが未設定のユーザーにFreeプランを割り当て
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    SELECT u.id, free_plan_id, 'active'
    FROM auth.users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id
    WHERE us.id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- =========================================
-- 13. コメント追加（ドキュメンテーション）
-- =========================================

COMMENT ON TABLE profiles IS 'ユーザープロフィール情報';
COMMENT ON TABLE couples IS 'カップル関係管理';
COMMENT ON TABLE couple_invitations IS 'パートナー連携招待テーブル';
COMMENT ON TABLE date_plans IS 'AIまたはユーザーが作成したデートプラン';
COMMENT ON TABLE plan_items IS 'デートプランの個別アイテム（アクティビティ、レストラン等）';
COMMENT ON TABLE plan_templates IS 'デートプランのテンプレート';
COMMENT ON TABLE plan_feedback IS 'デートプランへのフィードバック';
COMMENT ON TABLE subscription_plans IS 'サブスクリプションプランの定義（FreeとPremium）';
COMMENT ON TABLE user_subscriptions IS 'ユーザーの現在のサブスクリプション状態';
COMMENT ON TABLE plan_generation_usage IS 'AIプラン生成の使用履歴（日次・月次制限のため）';

-- =========================================
-- 14. セットアップ完了メッセージ
-- =========================================

-- セットアップ完了を確認するクエリ
DO $$
BEGIN
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'CouplePlan データベースセットアップ完了';
  RAISE NOTICE '=========================================';
  RAISE NOTICE '作成されたテーブル:';
  RAISE NOTICE '- profiles (ユーザープロフィール)';
  RAISE NOTICE '- couples (カップル関係)';
  RAISE NOTICE '- couple_invitations (パートナー招待)';
  RAISE NOTICE '- date_plans (デートプラン)';
  RAISE NOTICE '- plan_items (プランアイテム)';
  RAISE NOTICE '- plan_templates (プランテンプレート)';
  RAISE NOTICE '- plan_feedback (プランフィードバック)';
  RAISE NOTICE '- subscription_plans (サブスクリプションプラン)';
  RAISE NOTICE '- user_subscriptions (ユーザーサブスクリプション)';
  RAISE NOTICE '- plan_generation_usage (使用履歴)';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'RLSポリシーが設定されました';
  RAISE NOTICE '初期データが投入されました';
  RAISE NOTICE 'トリガーが設定されました';
  RAISE NOTICE '=========================================';
END $$;
