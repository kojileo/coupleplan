# Supabase SQL よくあるエラー

Supabase環境でSQLを実行する際によくあるエラーと解決方法です。

---

## ❌ エラー1: column "tablename" does not exist

### エラーメッセージ

```
ERROR: 42703: column "tablename" does not exist
LINE 11: tablename,
```

### 原因

PostgreSQLのシステムビューでは、テーブル名/インデックス名のカラムは `tablename` ではなく **`relname`** です。

**対象ビュー**:

- `pg_stat_user_tables` → カラム名は `relname`
- `pg_stat_user_indexes` → カラム名は `relname`, `indexrelname`

### 解決策

```sql
-- ❌ 間違い
SELECT tablename FROM pg_stat_user_tables;
SELECT tablename, indexname FROM pg_stat_user_indexes;

-- ✅ 正しい
SELECT relname AS tablename FROM pg_stat_user_tables;
SELECT relname AS tablename, indexrelname AS indexname FROM pg_stat_user_indexes;
```

### 修正済み

以下のファイルはすべて修正済みです：

- ✅ `maintenance/statistics.sql` - pg_stat_user_tables
- ✅ `maintenance/monitoring.sql` - pg_stat_user_tables, pg_stat_user_indexes ★
- ✅ `maintenance/cleanup.sql` - pg_stat_user_tables
- ✅ `admin/troubleshooting.sql` - pg_stat_user_tables

**最新バージョンでは、すべてのシステムビューで正しいカラム名（`relname`, `indexrelname`）を使用しています。**

### 推奨

システムビューを使わない **`statistics_simple.sql`** の使用を推奨します。

```sql
-- エラーが出にくい簡易版
\i maintenance/statistics_simple.sql
```

---

## ❌ エラー2: permission denied for table

### エラーメッセージ

```
ERROR: permission denied for table pg_stat_statements
```

### 原因

Supabase環境では、一部のシステムテーブルやビューへのアクセスが制限されています。

### 解決策

制限されているテーブル・ビュー：

- `pg_stat_statements`（クエリ統計）
- 一部の `pg_catalog` テーブル
- レプリケーション関連のビュー

**対策**: アプリケーションテーブルのみを使用するクエリに変更

```sql
-- ❌ 使用不可（権限エラー）
SELECT * FROM pg_stat_statements;

-- ✅ 使用可能（アプリケーションテーブル）
SELECT * FROM date_plans;
```

---

## ❌ エラー3: COPY TO requires superuser privileges

### エラーメッセージ

```
ERROR: must be superuser to COPY to or from a file
```

### 原因

`COPY TO` コマンドはSupabase環境では使用できません（セキュリティ制限）。

### 解決策

**オプション1**: Supabaseダッシュボードからエクスポート

- Table Editor → Export as CSV

**オプション2**: `json_agg` を使用してクエリ結果をJSON形式で取得

```sql
-- ❌ COPY TO は使用不可
COPY (SELECT * FROM date_plans) TO '/tmp/export.csv';

-- ✅ JSON形式で取得
SELECT json_agg(row_to_json(t))
FROM (SELECT * FROM date_plans) t;
```

---

## ❌ エラー4: VACUUM cannot run inside a transaction block

### エラーメッセージ

```
ERROR: VACUUM cannot run inside a transaction block
```

### 原因

SupabaseではVACUUMコマンドは自動的に実行されます。手動実行は不要です。

### 解決策

```sql
-- ❌ 手動VACUUM不要
VACUUM ANALYZE date_plans;

-- ✅ Supabaseが自動実行
-- 何もしなくてOK
```

**注意**: `maintenance/cleanup.sql` のVACUUM部分はコメントアウト済みです。

---

## ❌ エラー5: function is_admin() does not exist

### エラーメッセージ

```
ERROR: function is_admin() does not exist
```

### 原因

カスタム関数が作成されていません。

### 解決策

```sql
-- 関数を作成
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND is_admin = true  -- profilesテーブルにis_adminカラムが必要
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**注意**: `profiles` テーブルに `is_admin` カラムが必要です。

---

## ❌ エラー6: ERROR: 42P01: relation does not exist

### エラーメッセージ

```
ERROR: 42P01: relation "profiles" does not exist
```

### 原因

テーブルがまだ作成されていない、またはスキーマが違います。

### 解決策

1. **テーブルが存在するか確認**

   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

2. **マイグレーションを実行**

   ```sql
   \i migrations/create_couple_invitations.sql
   \i migrations/create_date_plans.sql
   ```

3. **スキーマプレフィックスを明示**
   ```sql
   SELECT * FROM public.profiles;
   ```

---

## ❌ エラー7: violates row-level security policy

### エラーメッセージ

```
ERROR: new row violates row-level security policy
```

### 原因

RLS（Row Level Security）ポリシーにより、操作が拒否されています。

### 解決策

1. **認証状態を確認**

   ```sql
   SELECT auth.uid();  -- NULL でないことを確認
   ```

2. **RLSポリシーを確認**

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'date_plans';
   ```

3. **RLSを一時的に無効化（開発環境のみ）**
   ```sql
   -- 注意: 本番環境では絶対に実行しない
   ALTER TABLE date_plans DISABLE ROW LEVEL SECURITY;
   ```

---

## ✅ ベストプラクティス

### 1. Supabase環境での推奨SQL

**推奨**: システムビューを使わない簡易版

- ✅ `statistics_simple.sql` - アプリケーションテーブルのみ使用
- ✅ `common_queries.sql` - 基本的なクエリのみ
- ⚠️ `statistics.sql` - システムビュー使用（エラーの可能性）
- ⚠️ `monitoring.sql` - システムビュー使用（一部制限あり）

### 2. トランザクションの使用

```sql
-- 安全にクエリを実行
BEGIN;

-- 変更を実行
UPDATE date_plans SET status = 'archived' WHERE ...;

-- 結果を確認
SELECT COUNT(*) FROM date_plans WHERE status = 'archived';

-- 問題なければコミット
COMMIT;

-- 問題があればロールバック
-- ROLLBACK;
```

### 3. 権限エラーの回避

- アプリケーションテーブルを優先的に使用
- システムテーブルへのアクセスは最小限に
- Supabase APIを活用（REST API、Dashboard）

---

## 🔍 デバッグ方法

### エラーが発生したら

1. **エラーメッセージを確認**
   - エラーコード（例: 42703）
   - 行番号（LINE 11）
   - 詳細メッセージ

2. **該当箇所を特定**

   ```sql
   -- エラーが出た行を確認
   -- LINE 11 の内容をチェック
   ```

3. **カラム名を確認**

   ```sql
   -- テーブル構造を確認
   \d table_name

   -- または
   SELECT column_name
   FROM information_schema.columns
   WHERE table_name = 'your_table';
   ```

4. **簡易版を使用**
   - システムビューが原因の場合は `_simple.sql` を使用

---

## 📚 参考情報

### Supabase の制限事項

- スーパーユーザー権限が必要な操作は不可
- 一部のシステムビュー・テーブルはアクセス不可
- COPY TO/FROM ファイル操作は不可
- 手動VACUUM は不要（自動実行）

### PostgreSQL バージョン

Supabaseで使用されているPostgreSQLのバージョンを確認：

```sql
SELECT version();
```

---

## ✅ トラブルシューティングフロー

```
エラー発生
    ↓
1. エラーメッセージを確認
    ↓
2. このドキュメントで該当エラーを検索
    ↓
3. 解決策を試す
    ↓
4. それでも解決しない場合
    ↓
5. Supabase公式ドキュメントを参照
    ↓
6. GitHub Issuesで報告
```

---

**作成日**: 2025年10月10日  
**対象**: Supabase環境でのSQL実行  
**ステータス**: 随時更新
