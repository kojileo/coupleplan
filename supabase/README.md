# Supabase SQL管理

データベースの運用・保守・アップデート用のSQL集です。

---

## 📁 フォルダ構成

```
supabase/
├── README.md                    # このファイル
│
├── migrations/                  # データベーススキーマ（初期構築）
│   ├── create_couple_invitations.sql
│   └── create_date_plans.sql
│
├── rls-policies.sql            # Row Level Security ポリシー
│
├── maintenance/                # メンテナンス用SQL
│   ├── cleanup.sql            # データクリーンアップ
│   ├── backup.sql             # バックアップ・リストア
│   ├── monitoring.sql         # パフォーマンス監視
│   ├── dashboard.sql          # ダッシュボード統計（1つのJSON・最推奨）★
│   ├── statistics_simple.sql  # 統計情報（個別クエリ集）
│   └── statistics.sql         # 統計情報（詳細版・システムビュー使用）
│
├── admin/                      # 管理者用SQL
│   ├── user_management.sql    # ユーザー管理
│   ├── data_migration.sql     # データ移行・更新
│   ├── security_audit.sql     # セキュリティ監査
│   └── troubleshooting.sql    # トラブルシューティング
│
└── queries/                    # よく使うクエリ
    └── common_queries.sql     # 日常的なクエリ集
```

---

## 🚀 クイックガイド

### 初期セットアップ

1. **マイグレーション実行**（初回のみ）

   ```sql
   -- Supabase SQL Editorで実行
   \i migrations/create_couple_invitations.sql
   \i migrations/create_date_plans.sql
   \i rls-policies.sql
   ```

2. **動作確認**
   ```sql
   SELECT * FROM date_plans LIMIT 1;
   ```

### 日常的な運用

- **統計確認**: `maintenance/statistics.sql`
- **ユーザー管理**: `admin/user_management.sql`
- **よく使うクエリ**: `queries/common_queries.sql`

### 定期メンテナンス（推奨: 週1回）

1. **クリーンアップ実行**

   ```sql
   \i maintenance/cleanup.sql
   ```

2. **パフォーマンス監視**

   ```sql
   \i maintenance/monitoring.sql
   SELECT * FROM database_health_check();
   ```

3. **統計確認**
   ```sql
   \i maintenance/statistics.sql
   ```

### トラブルシューティング

問題が発生したら：

1. `admin/troubleshooting.sql` - データ整合性チェック
2. `maintenance/monitoring.sql` - パフォーマンス問題の診断
3. `admin/security_audit.sql` - セキュリティ問題のチェック

---

## 📊 各SQLファイルの用途

### migrations/ - データベーススキーマ

| ファイル                        | 用途                         | 実行タイミング |
| ------------------------------- | ---------------------------- | -------------- |
| `create_couple_invitations.sql` | 招待コードテーブル作成       | 初回のみ       |
| `create_date_plans.sql`         | デートプラン関連テーブル作成 | 初回のみ       |

### maintenance/ - メンテナンス

| ファイル                | 用途                                        | 実行タイミング    |
| ----------------------- | ------------------------------------------- | ----------------- |
| `cleanup.sql`           | 古いデータの削除、最適化                    | 週1回             |
| `backup.sql`            | バックアップ・リストア                      | 月1回または必要時 |
| `monitoring.sql`        | パフォーマンス監視                          | 日1回             |
| `dashboard.sql` ★       | **ダッシュボード統計（1つのJSON・最推奨）** | **随時**          |
| `statistics_simple.sql` | 統計情報（個別クエリ集）                    | 必要時            |
| `statistics.sql`        | 統計情報（詳細版）                          | 必要時            |

### admin/ - 管理者向け

| ファイル              | 用途             | 実行タイミング |
| --------------------- | ---------------- | -------------- |
| `user_management.sql` | ユーザー管理     | 必要時         |
| `data_migration.sql`  | データ移行・更新 | スキーマ変更時 |
| `security_audit.sql`  | セキュリティ監査 | 月1回          |
| `troubleshooting.sql` | 問題の診断と解決 | 問題発生時     |

### queries/ - よく使うクエリ

| ファイル             | 用途               | 実行タイミング |
| -------------------- | ------------------ | -------------- |
| `common_queries.sql` | 日常的なデータ取得 | 随時           |

---

## 🔧 よく使う機能

### 1. ヘルスチェック

```sql
-- データベース全体の健康状態を確認
\i maintenance/monitoring.sql
SELECT * FROM database_health_check();
```

### 2. ユーザー検索

```sql
-- メールアドレスでユーザーを検索
SELECT * FROM auth.users WHERE email = 'user@example.com';
```

### 3. プラン統計

```sql
-- ダッシュボード統計（最推奨 - 1つのJSONで全統計）
\i maintenance/dashboard.sql

-- または個別クエリ集（必要な部分だけ実行）
\i maintenance/statistics_simple.sql

-- または詳細版（システムビュー使用）
\i maintenance/statistics.sql
```

### 4. バックアップ

```sql
-- 特定カップルのデータをバックアップ
\i maintenance/backup.sql
SELECT backup_couple_data('couple-uuid-here');
```

---

## ⚠️ 重要な注意事項

### 実行前の確認

1. **本番環境での実行は慎重に**
   - 必ずバックアップを取る
   - まずステージング環境でテスト
   - トランザクション（BEGIN/COMMIT/ROLLBACK）を活用

2. **権限の確認**
   - 一部のクエリは管理者権限が必要
   - Supabaseでは一部のシステムテーブルにアクセス制限あり

3. **パフォーマンスへの影響**
   - 大量データの更新は分散実行
   - ピーク時間を避ける
   - VACUUM/ANALYZEはSupabaseが自動実行

---

## 🛡️ セキュリティベストプラクティス

### 実行時の安全対策

```sql
-- トランザクションで安全に実行
BEGIN;

-- 変更を実行
UPDATE date_plans SET status = 'archived' WHERE ...;

-- 結果を確認
SELECT COUNT(*) FROM date_plans WHERE status = 'archived';

-- 問題なければコミット、問題があればロールバック
COMMIT;  -- または ROLLBACK;
```

### 本番環境での推奨事項

1. **読み取り専用クエリを優先**
   - SELECT文は安全
   - UPDATE/DELETE は慎重に

2. **バックアップの自動化**
   - Supabaseの自動バックアップを有効化
   - 重要な変更前は手動バックアップ

3. **監査ログの有効化**
   - `admin/security_audit.sql` の監査ログ機能を活用

---

## 📖 使用例

### シナリオ1: 週次メンテナンス

```sql
-- 1. ダッシュボード統計の確認（最推奨）
\i maintenance/dashboard.sql

-- 2. クリーンアップ実行
\i maintenance/cleanup.sql

-- 3. ヘルスチェック
\i maintenance/monitoring.sql
SELECT * FROM database_health_check();
```

### シナリオ2: ユーザーサポート

```sql
-- 1. ユーザー情報の確認
\i queries/common_queries.sql
-- ユーザーメールで検索

-- 2. プラン履歴の確認
-- カップルIDでプラン一覧取得

-- 3. 問題の診断
\i admin/troubleshooting.sql
```

### シナリオ3: スキーマ変更

```sql
-- 1. バックアップ作成
\i maintenance/backup.sql

-- 2. マイグレーション実行
\i admin/data_migration.sql
-- 必要な変更を実行

-- 3. 整合性チェック
\i admin/troubleshooting.sql
```

---

## ✅ 定期実行推奨スケジュール

| タスク           | 頻度  | SQLファイル          |
| ---------------- | ----- | -------------------- |
| ヘルスチェック   | 毎日  | `monitoring.sql`     |
| クリーンアップ   | 週1回 | `cleanup.sql`        |
| 統計レポート     | 週1回 | `dashboard.sql` ★    |
| セキュリティ監査 | 月1回 | `security_audit.sql` |
| バックアップ確認 | 月1回 | `backup.sql`         |

---

## 🆘 サポート

問題が発生した場合：

1. **`COMMON_ERRORS.md`** - SQLエラーの解決方法
2. `admin/troubleshooting.sql` - データ診断
3. `Docs/TROUBLESHOOTING.md` - アプリケーション全体のトラブルシューティング
4. GitHub Issues - 未解決の問題を報告

---

**作成日**: 2025年10月10日  
**バージョン**: v1.0.0  
**管理**: データベース管理者
