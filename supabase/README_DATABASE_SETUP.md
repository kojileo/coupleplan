# CouplePlan データベースセットアップガイド

## 概要

このドキュメントでは、CouplePlanアプリケーションのデータベースセットアップについて説明します。

## セットアップファイル

### メインファイル

- **`database_setup_complete.sql`** - 完全なデータベースセットアップ用の統合SQLファイル

### 旧ファイル（参考用）

- `migrations/create_date_plans.sql` - デートプラン関連テーブル
- `migrations/create_couple_invitations.sql` - カップル招待テーブル
- `migrations/create_subscription_system.sql` - サブスクリプションシステム
- `rls-policies.sql` - 古いRLSポリシー
- `admin/data_migration.sql` - データ移行用

## セットアップ手順

### 1. 完全セットアップ（推奨）

```bash
# SupabaseダッシュボードのSQL Editorで実行
psql -f supabase/database_setup_complete.sql
```

または、SupabaseダッシュボードのSQL Editorに `database_setup_complete.sql` の内容をコピーして実行してください。

### 2. 段階的セットアップ（トラブルシューティング用）

問題が発生した場合は、以下の順序で個別に実行できます：

1. 基本テーブル作成
2. インデックス作成
3. トリガー設定
4. RLSポリシー設定
5. 初期データ投入

## 作成されるテーブル

### 基本テーブル

- **profiles** - ユーザープロフィール情報
- **couples** - カップル関係管理
- **couple_invitations** - パートナー連携招待

### デートプラン関連

- **date_plans** - AIまたはユーザーが作成したデートプラン
- **plan_items** - デートプランの個別アイテム
- **plan_templates** - デートプランのテンプレート
- **plan_feedback** - デートプランへのフィードバック

### サブスクリプション関連

- **subscription_plans** - サブスクリプションプランの定義
- **user_subscriptions** - ユーザーの現在のサブスクリプション状態
- **plan_generation_usage** - AIプラン生成の使用履歴

## セキュリティ設定

### Row Level Security (RLS)

すべてのテーブルでRLSが有効化され、適切なポリシーが設定されています：

- ユーザーは自分のデータのみアクセス可能
- カップル関係にあるユーザーは共有データにアクセス可能
- 公開テンプレートは全員が閲覧可能
- 招待コードは検証用に全員がアクセス可能

### 認証要件

- すべてのテーブルで認証済みユーザーのみアクセス可能
- 匿名ユーザーは招待コード検証のみ可能

## 初期データ

### サブスクリプションプラン

- **Free プラン**: 日次3回、月次10回のAIプラン生成制限
- **Premium プラン**: 無制限のAIプラン生成（将来実装）

### 自動機能

- 新規ユーザー作成時に自動的にFreeプランが割り当てられます
- 既存ユーザーには既存データを保持したままFreeプランが割り当てられます

## ヘルパー関数

### `get_user_plan_limits(user_id)`

ユーザーの現在のプラン制限状況を取得する関数です。

```sql
SELECT * FROM get_user_plan_limits('user-uuid-here');
```

戻り値：

- `plan_name`: プラン名（'free' または 'premium'）
- `daily_limit`: 日次制限（NULL = 無制限）
- `monthly_limit`: 月次制限（NULL = 無制限）
- `daily_used`: 今日使用した回数
- `monthly_used`: 今月使用した回数
- `daily_remaining`: 今日の残り回数
- `monthly_remaining`: 今月の残り回数
- `can_generate`: プラン生成可能かどうか

## トラブルシューティング

### よくある問題

1. **外部キー制約エラー**
   - テーブルを削除する順序を確認してください
   - `CASCADE` オプションで関連データも削除されます

2. **RLSポリシーエラー**
   - 認証状態を確認してください
   - ポリシーの条件を確認してください

3. **トリガーエラー**
   - 関数が正しく作成されているか確認してください
   - 権限設定を確認してください

### ロールバック

問題が発生した場合は、以下の手順でロールバックできます：

```sql
-- すべてのテーブルを削除
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

-- 関数も削除
DROP FUNCTION IF EXISTS create_user_subscription();
DROP FUNCTION IF EXISTS get_user_plan_limits(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## 更新履歴

- **2025-01-27**: 初版作成 - 完全なデータベースセットアップファイル
- **統合内容**:
  - 分散していたマイグレーションファイルを統合
  - 不足していた基本的なテーブルを追加
  - RLSポリシーを最新の要件に更新
  - データモデル図との整合性を確保

## 注意事項

1. **本番環境での実行前には必ずバックアップを取ってください**
2. **テスト環境で動作確認してから本番環境に適用してください**
3. **既存データがある場合は、データ移行が必要な場合があります**

## サポート

データベースセットアップで問題が発生した場合は、以下を確認してください：

1. Supabaseプロジェクトの設定
2. データベースの権限設定
3. ネットワーク接続
4. SQLファイルの構文エラー

問題が解決しない場合は、開発チームまでお問い合わせください。
