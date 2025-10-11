-- データ移行・更新用SQL
-- スキーマ変更やデータ修正を行う際に使用

-- ============================================
-- 1. カラム追加のテンプレート
-- ============================================

-- 新しいカラムを追加する場合の例
/*
-- date_plansテーブルに新しいカラムを追加
ALTER TABLE date_plans 
ADD COLUMN IF NOT EXISTS new_column_name VARCHAR(100);

-- デフォルト値を設定
UPDATE date_plans 
SET new_column_name = 'default_value' 
WHERE new_column_name IS NULL;

-- NOT NULL制約を追加（データが埋まった後）
ALTER TABLE date_plans 
ALTER COLUMN new_column_name SET NOT NULL;

-- インデックスを追加（必要な場合）
CREATE INDEX IF NOT EXISTS idx_date_plans_new_column 
ON date_plans(new_column_name);
*/

-- ============================================
-- 2. データ型の変更
-- ============================================

-- 例: durationを時間単位に変更する場合
/*
-- ステップ1: 新しいカラムを追加
ALTER TABLE date_plans 
ADD COLUMN duration_hours DECIMAL(5, 2);

-- ステップ2: データを変換して移行
UPDATE date_plans 
SET duration_hours = duration / 60.0
WHERE duration IS NOT NULL;

-- ステップ3: 古いカラムを削除（確認後）
ALTER TABLE date_plans DROP COLUMN duration;

-- ステップ4: カラムをリネーム
ALTER TABLE date_plans 
RENAME COLUMN duration_hours TO duration;
*/

-- ============================================
-- 3. Enumの追加
-- ============================================

-- プランステータスのEnum型を作成（より安全な型管理）
/*
-- Enum型の作成
CREATE TYPE plan_status_enum AS ENUM ('draft', 'generating', 'completed', 'archived');

-- 既存のVARCHARカラムをEnum型に変換
ALTER TABLE date_plans 
ALTER COLUMN status TYPE plan_status_enum 
USING status::plan_status_enum;

-- 新しいステータスを追加する場合
ALTER TYPE plan_status_enum ADD VALUE 'cancelled';
*/

-- ============================================
-- 4. 一括データ更新
-- ============================================

-- 古いプランのステータスを一括更新
-- 例: 90日以上更新されていないドラフトを自動アーカイブ
UPDATE date_plans
SET status = 'archived'
WHERE status = 'draft'
  AND updated_at < NOW() - INTERVAL '90 days';

-- AI生成IDが空のプランに仮のIDを設定
UPDATE date_plans
SET ai_generation_id = 'manual_' || id::TEXT
WHERE ai_generated = false AND ai_generation_id IS NULL;

-- ============================================
-- 5. データの正規化
-- ============================================

-- 好みタグの正規化（重複削除）
UPDATE date_plans
SET preferences = (
  SELECT jsonb_agg(DISTINCT elem)
  FROM jsonb_array_elements(preferences) elem
)
WHERE jsonb_typeof(preferences) = 'array';

-- 場所データの正規化（空白削除、大文字小文字統一）
UPDATE date_plans
SET 
  location_prefecture = TRIM(location_prefecture),
  location_city = TRIM(location_city),
  location_station = TRIM(location_station);

-- ============================================
-- 6. バッチ更新（大量データ）
-- ============================================

-- 大量のレコードを更新する場合のテンプレート
-- パフォーマンスを考慮してバッチ処理

/*
DO $$
DECLARE
  v_batch_size INTEGER := 1000;
  v_updated INTEGER := 0;
BEGIN
  LOOP
    WITH batch AS (
      SELECT id
      FROM date_plans
      WHERE condition_here  -- 更新条件
      LIMIT v_batch_size
      FOR UPDATE SKIP LOCKED
    )
    UPDATE date_plans
    SET column_name = new_value
    FROM batch
    WHERE date_plans.id = batch.id;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    EXIT WHEN v_updated = 0;
    
    RAISE NOTICE 'Updated % rows', v_updated;
    COMMIT;  -- トランザクションをコミット
  END LOOP;
END $$;
*/

-- ============================================
-- 7. データの再計算
-- ============================================

-- プランの合計金額を再計算（アイテムから集計）
UPDATE date_plans dp
SET budget = (
  SELECT COALESCE(SUM(cost), 0)
  FROM plan_items
  WHERE plan_id = dp.id
)
WHERE EXISTS (
  SELECT 1 FROM plan_items WHERE plan_id = dp.id
);

-- プランの合計時間を再計算（アイテムから集計）
UPDATE date_plans dp
SET duration = (
  SELECT COALESCE(SUM(duration), 0)
  FROM plan_items
  WHERE plan_id = dp.id
)
WHERE EXISTS (
  SELECT 1 FROM plan_items WHERE plan_id = dp.id
);

-- ============================================
-- 8. データのバックアップ（移行前）
-- ============================================

-- 重要: 大きな変更を行う前に必ずバックアップを作成

-- テーブル全体をバックアップ
CREATE TABLE date_plans_backup_20251010 AS 
SELECT * FROM date_plans;

-- 特定条件のデータをバックアップ
CREATE TABLE date_plans_draft_backup AS 
SELECT * FROM date_plans WHERE status = 'draft';

-- バックアップからリストア（必要な場合）
/*
-- 既存データを削除
TRUNCATE date_plans CASCADE;

-- バックアップから復元
INSERT INTO date_plans SELECT * FROM date_plans_backup_20251010;

-- バックアップテーブルを削除（確認後）
DROP TABLE date_plans_backup_20251010;
*/

-- ============================================
-- 9. スキーマバージョン管理
-- ============================================

-- スキーマバージョンテーブルの作成
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by TEXT,
  migration_file TEXT
);

-- バージョン記録の挿入
-- INSERT INTO schema_version (version, description, migration_file)
-- VALUES (1, 'Initial schema', 'create_date_plans.sql');

-- 現在のスキーマバージョンを確認
SELECT * FROM schema_version ORDER BY version DESC LIMIT 1;

-- ============================================
-- 10. ロールバック用テンプレート
-- ============================================

-- 変更をロールバックする場合のテンプレート
/*
BEGIN;

-- 変更を試す
ALTER TABLE date_plans ADD COLUMN test_column TEXT;

-- 問題があればロールバック
ROLLBACK;

-- 問題なければコミット
COMMIT;
*/

