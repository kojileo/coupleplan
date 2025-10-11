-- Date Planning Service テーブル作成
-- UC-001: AIデートプラン提案・生成機能用

-- 既存のテーブルを削除（CASCADE で関連データも削除）
DROP TABLE IF EXISTS plan_feedback CASCADE;
DROP TABLE IF EXISTS plan_items CASCADE;
DROP TABLE IF EXISTS plan_templates CASCADE;
DROP TABLE IF EXISTS date_plans CASCADE;

-- 1. date_plans テーブル
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

-- 2. plan_items テーブル
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

-- 3. plan_templates テーブル
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

-- 4. plan_feedback テーブル
CREATE TABLE plan_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES date_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_date_plans_couple_id ON date_plans(couple_id);
CREATE INDEX IF NOT EXISTS idx_date_plans_created_by ON date_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_date_plans_status ON date_plans(status);
CREATE INDEX IF NOT EXISTS idx_date_plans_created_at ON date_plans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_plan_items_plan_id ON plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_order_index ON plan_items(plan_id, order_index);

CREATE INDEX IF NOT EXISTS idx_plan_templates_category ON plan_templates(category);
CREATE INDEX IF NOT EXISTS idx_plan_templates_popularity ON plan_templates(popularity DESC);

CREATE INDEX IF NOT EXISTS idx_plan_feedback_plan_id ON plan_feedback(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_feedback_user_id ON plan_feedback(user_id);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 既存のトリガーを削除してから再作成
DROP TRIGGER IF EXISTS update_date_plans_updated_at ON date_plans;
DROP TRIGGER IF EXISTS update_plan_items_updated_at ON plan_items;
DROP TRIGGER IF EXISTS update_plan_templates_updated_at ON plan_templates;

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

-- RLS (Row Level Security) ポリシー設定

-- date_plans のRLS
ALTER TABLE date_plans ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their couple's plans" ON date_plans;
DROP POLICY IF EXISTS "Users can create plans for their couple" ON date_plans;
DROP POLICY IF EXISTS "Users can update their couple's plans" ON date_plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON date_plans;

-- ユーザーは自分が所属するカップルのプランを閲覧可能
CREATE POLICY "Users can view their couple's plans"
  ON date_plans FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      couple_id IN (
        SELECT id FROM couples 
        WHERE user1_id = auth.uid() OR user2_id = auth.uid()
      )
    )
  );

-- ユーザーは自分が所属するカップルのプランを作成可能
CREATE POLICY "Users can create plans for their couple"
  ON date_plans FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    created_by = auth.uid() AND
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- ユーザーは自分が所属するカップルのプランを更新可能
CREATE POLICY "Users can update their couple's plans"
  ON date_plans FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      couple_id IN (
        SELECT id FROM couples 
        WHERE user1_id = auth.uid() OR user2_id = auth.uid()
      )
    )
  );

-- ユーザーは自分が作成したプランを削除可能
CREATE POLICY "Users can delete their own plans"
  ON date_plans FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND created_by = auth.uid()
  );

-- plan_items のRLS
ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view plan items of their couple's plans" ON plan_items;
DROP POLICY IF EXISTS "Users can manage plan items of their couple's plans" ON plan_items;

CREATE POLICY "Users can view plan items of their couple's plans"
  ON plan_items FOR SELECT
  USING (
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

CREATE POLICY "Users can manage plan items of their couple's plans"
  ON plan_items FOR ALL
  USING (
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

-- plan_templates のRLS
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view public templates" ON plan_templates;
DROP POLICY IF EXISTS "Users can manage their own templates" ON plan_templates;

-- 公開テンプレートは全員が閲覧可能
CREATE POLICY "Anyone can view public templates"
  ON plan_templates FOR SELECT
  USING (is_public = true OR auth.uid() IS NOT NULL);

-- ユーザーは自分のテンプレートを管理可能
CREATE POLICY "Users can manage their own templates"
  ON plan_templates FOR ALL
  USING (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- plan_feedback のRLS
ALTER TABLE plan_feedback ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view feedback for their couple's plans" ON plan_feedback;
DROP POLICY IF EXISTS "Users can submit feedback for their couple's plans" ON plan_feedback;

CREATE POLICY "Users can view feedback for their couple's plans"
  ON plan_feedback FOR SELECT
  USING (
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

CREATE POLICY "Users can submit feedback for their couple's plans"
  ON plan_feedback FOR INSERT
  WITH CHECK (
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

-- コメント追加
COMMENT ON TABLE date_plans IS 'AIまたはユーザーが作成したデートプラン';
COMMENT ON TABLE plan_items IS 'デートプランの個別アイテム（アクティビティ、レストラン等）';
COMMENT ON TABLE plan_templates IS 'デートプランのテンプレート';
COMMENT ON TABLE plan_feedback IS 'デートプランへのフィードバック';

