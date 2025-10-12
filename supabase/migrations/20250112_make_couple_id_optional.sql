-- Migration: Make couple_id optional in date_plans table
-- Description: カップル連携をオプショナルにし、個人ユーザーでもプラン作成を可能に
-- Date: 2025-01-12

-- 1. couple_id を NULLABLE に変更
ALTER TABLE date_plans
ALTER COLUMN couple_id DROP NOT NULL;

-- 2. 既存のRLSポリシーを削除
DROP POLICY IF EXISTS "Users can view their own couple's plans" ON date_plans;
DROP POLICY IF EXISTS "Users can create plans for their couple" ON date_plans;
DROP POLICY IF EXISTS "Users can update their own couple's plans" ON date_plans;
DROP POLICY IF EXISTS "Users can delete their own couple's plans" ON date_plans;

-- 3. 新しいRLSポリシーを作成（個人プランとカップルプランの両方に対応）

-- 閲覧権限: 自分が作成したプラン OR 自分のカップルのプラン
CREATE POLICY "Users can view their plans"
ON date_plans FOR SELECT
USING (
  auth.uid() = created_by OR
  (couple_id IS NOT NULL AND couple_id IN (
    SELECT id FROM couples 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  ))
);

-- 作成権限: 認証済みユーザーは誰でもプラン作成可能
CREATE POLICY "Authenticated users can create plans"
ON date_plans FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND (
    -- 個人プランの場合（couple_idがnull）
    couple_id IS NULL OR
    -- カップルプランの場合は自分のカップルのみ
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  )
);

-- 更新権限: 自分が作成したプラン OR 自分のカップルのプラン
CREATE POLICY "Users can update their plans"
ON date_plans FOR UPDATE
USING (
  auth.uid() = created_by OR
  (couple_id IS NOT NULL AND couple_id IN (
    SELECT id FROM couples 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  ))
)
WITH CHECK (
  auth.uid() = created_by OR
  (couple_id IS NOT NULL AND couple_id IN (
    SELECT id FROM couples 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  ))
);

-- 削除権限: 自分が作成したプラン OR 自分のカップルのプラン
CREATE POLICY "Users can delete their plans"
ON date_plans FOR DELETE
USING (
  auth.uid() = created_by OR
  (couple_id IS NOT NULL AND couple_id IN (
    SELECT id FROM couples 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  ))
);

-- 4. インデックスを追加（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_date_plans_created_by ON date_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_date_plans_couple_id ON date_plans(couple_id) WHERE couple_id IS NOT NULL;

-- 5. コメントを追加
COMMENT ON COLUMN date_plans.couple_id IS 'カップルID（NULLの場合は個人プラン）';

