-- データベースバックアップ・リストア用SQL
-- 重要なデータをバックアップ・復元する

-- ============================================
-- バックアップの作成
-- ============================================

-- 注意: Supabaseでは自動バックアップが提供されています
-- このSQLは追加の手動バックアップや特定データのエクスポート用です

-- ============================================
-- 1. カップルデータのバックアップ
-- ============================================

-- カップル情報をJSON形式でエクスポート
COPY (
  SELECT json_agg(row_to_json(t))
  FROM (
    SELECT 
      id,
      user1_id,
      user2_id,
      relationship_status,
      anniversary_date,
      created_at,
      updated_at
    FROM couples
    ORDER BY created_at
  ) t
) TO '/tmp/backup_couples.json';

-- ============================================
-- 2. デートプランのバックアップ
-- ============================================

-- 全デートプランをエクスポート
COPY (
  SELECT json_agg(row_to_json(t))
  FROM (
    SELECT 
      dp.*,
      (
        SELECT json_agg(pi ORDER BY pi.order_index)
        FROM plan_items pi
        WHERE pi.plan_id = dp.id
      ) AS items,
      (
        SELECT json_agg(pf)
        FROM plan_feedback pf
        WHERE pf.plan_id = dp.id
      ) AS feedback
    FROM date_plans dp
    ORDER BY dp.created_at
  ) t
) TO '/tmp/backup_date_plans.json';

-- ============================================
-- 3. 特定カップルのデータバックアップ
-- ============================================

-- パラメータ化されたバックアップ（カップルIDを指定）
-- 使用例: SELECT backup_couple_data('couple-uuid-here');

CREATE OR REPLACE FUNCTION backup_couple_data(p_couple_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'couple', (
      SELECT row_to_json(c)
      FROM couples c
      WHERE c.id = p_couple_id
    ),
    'plans', (
      SELECT json_agg(
        json_build_object(
          'plan', dp,
          'items', (
            SELECT json_agg(pi ORDER BY pi.order_index)
            FROM plan_items pi
            WHERE pi.plan_id = dp.id
          ),
          'feedback', (
            SELECT json_agg(pf)
            FROM plan_feedback pf
            WHERE pf.plan_id = dp.id
          )
        )
      )
      FROM date_plans dp
      WHERE dp.couple_id = p_couple_id
      ORDER BY dp.created_at
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 使用例:
-- SELECT backup_couple_data('your-couple-uuid-here');

-- ============================================
-- 4. データの整合性チェック（バックアップ前の確認）
-- ============================================

-- 孤立レコードの確認
SELECT 
  'plan_items without plan' AS issue,
  COUNT(*) AS count
FROM plan_items
WHERE plan_id NOT IN (SELECT id FROM date_plans)
UNION ALL
SELECT 
  'plan_feedback without plan' AS issue,
  COUNT(*) AS count
FROM plan_feedback
WHERE plan_id NOT IN (SELECT id FROM date_plans)
UNION ALL
SELECT 
  'date_plans without couple' AS issue,
  COUNT(*) AS count
FROM date_plans
WHERE couple_id NOT IN (SELECT id FROM couples);

-- ============================================
-- 5. バックアップ情報の記録
-- ============================================

-- バックアップ履歴テーブルの作成（初回のみ）
CREATE TABLE IF NOT EXISTS backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type VARCHAR(50) NOT NULL,
  table_name VARCHAR(100),
  record_count INTEGER,
  backup_size_bytes BIGINT,
  backup_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- バックアップ履歴の記録（手動挿入）
-- INSERT INTO backup_history (backup_type, table_name, record_count, notes)
-- VALUES ('full', 'date_plans', (SELECT COUNT(*) FROM date_plans), 'Monthly backup');

-- ============================================
-- 6. リストア用テンプレート
-- ============================================

-- リストア前のバックアップ作成（安全のため）
-- ステップ1: 既存データをバックアップテーブルに移動

/*
-- 例: date_plansのバックアップ
CREATE TABLE date_plans_backup AS SELECT * FROM date_plans;

-- リストア（必要な場合）
-- ステップ1: 既存データを削除
TRUNCATE date_plans CASCADE;

-- ステップ2: バックアップから復元
INSERT INTO date_plans SELECT * FROM date_plans_backup;

-- ステップ3: バックアップテーブルを削除（確認後）
DROP TABLE date_plans_backup;
*/

-- ============================================
-- 7. データのエクスポート（CSV形式）
-- ============================================

-- プラン一覧をCSVでエクスポート
-- 注意: ローカル環境でのみ使用可能（Supabaseでは制限あり）

/*
COPY (
  SELECT 
    dp.id,
    dp.title,
    dp.budget,
    dp.duration,
    dp.status,
    dp.location_prefecture,
    dp.location_city,
    dp.created_at,
    c.user1_id,
    c.user2_id
  FROM date_plans dp
  JOIN couples c ON dp.couple_id = c.id
  ORDER BY dp.created_at DESC
) TO '/tmp/date_plans_export.csv' WITH CSV HEADER;
*/

-- ============================================
-- 8. 増分バックアップ
-- ============================================

-- 最終バックアップ以降の変更のみバックアップ
-- 使用例: SELECT * FROM get_changes_since('2025-10-01');

CREATE OR REPLACE FUNCTION get_changes_since(p_since TIMESTAMPTZ)
RETURNS TABLE (
  table_name TEXT,
  record_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'date_plans' AS table_name,
    COUNT(*) AS record_count
  FROM date_plans
  WHERE updated_at > p_since
  UNION ALL
  SELECT 
    'plan_items' AS table_name,
    COUNT(*) AS record_count
  FROM plan_items
  WHERE updated_at > p_since
  UNION ALL
  SELECT 
    'plan_templates' AS table_name,
    COUNT(*) AS record_count
  FROM plan_templates
  WHERE updated_at > p_since;
END;
$$ LANGUAGE plpgsql;

-- 使用例:
-- SELECT * FROM get_changes_since(NOW() - INTERVAL '1 day');

