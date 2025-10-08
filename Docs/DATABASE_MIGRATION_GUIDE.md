# データベースマイグレーションガイド

## 概要

このガイドでは、CouplePlanアプリケーションの新しいデータベーススキーマをSupabaseに適用する方法を説明します。

## 前提条件

- Supabaseプロジェクトが作成されていること
- Supabaseダッシュボードへのアクセス権限があること

## マイグレーション手順

### 方法1: Supabase Studio（推奨）

Supabaseへの接続に問題がある場合や、手動で確実にセットアップしたい場合は、この方法を使用してください。

#### 1. Supabase Studioにアクセス

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左側のメニューから「SQL Editor」を選択

#### 2. カップル招待テーブルを作成

`supabase/migrations/create_couple_invitations.sql`の内容をコピーして、SQL Editorに貼り付けて実行します。

```sql
-- このファイルの内容を実行
-- supabase/migrations/create_couple_invitations.sql
```

#### 3. ストレージバケットとポリシーを作成

`supabase/migrations/create_storage_buckets.sql`の内容をコピーして、SQL Editorに貼り付けて実行します。

```sql
-- このファイルの内容を実行
-- supabase/migrations/create_storage_buckets.sql
```

#### 4. 確認

以下のクエリを実行して、テーブルとバケットが正しく作成されたことを確認します：

```sql
-- テーブルの確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'couple_invitations';

-- ストレージバケットの確認
SELECT * FROM storage.buckets
WHERE name IN ('avatars', 'plan-images', 'memories');
```

### 方法2: Prisma CLI（開発環境）

ローカル開発環境でPrisma CLIを使用する場合：

#### 1. Prisma Clientを生成

```bash
npx prisma generate
```

#### 2. データベーススキーマを反映

```bash
npx prisma db push
```

**注意**: この方法は、Supabaseへの接続が正常に機能している場合のみ使用できます。

## トラブルシューティング

### エラー: Can't reach database server

**症状**:

```
Error: P1001: Can't reach database server at `db.xxx.supabase.co:5432`
```

**解決策**:

1. `.env`ファイルの`DATABASE_URL`が正しく設定されているか確認
2. Supabaseプロジェクトが起動しているか確認
3. ファイアウォールやVPNの設定を確認
4. 上記の「方法1: Supabase Studio」を使用

### エラー: Table already exists

**症状**:

```
Error: relation "couple_invitations" already exists
```

**解決策**:
既にテーブルが作成されている場合は、マイグレーションをスキップして問題ありません。

### ストレージポリシーエラー

**症状**:

```
Error: policy "Users can upload own avatar" already exists
```

**解決策**:
既にポリシーが存在する場合は、`CREATE POLICY`文の前に`DROP POLICY IF EXISTS`を追加するか、既存のポリシーを削除してから再実行してください。

## データベーススキーマ

### couple_invitations テーブル

| カラム名        | データ型    | 説明                                   |
| --------------- | ----------- | -------------------------------------- |
| id              | UUID        | 主キー                                 |
| from_user_id    | UUID        | 招待を送信したユーザーID               |
| to_user_id      | UUID        | 招待を受信したユーザーID（オプション） |
| invitation_code | VARCHAR(6)  | 6桁の招待コード                        |
| status          | VARCHAR(20) | ステータス: active, used, expired      |
| expires_at      | TIMESTAMPTZ | 有効期限                               |
| created_at      | TIMESTAMPTZ | 作成日時                               |
| updated_at      | TIMESTAMPTZ | 更新日時                               |

### ストレージバケット

| バケット名  | 説明         | 公開設定 |
| ----------- | ------------ | -------- |
| avatars     | アバター画像 | 公開     |
| plan-images | プラン画像   | 公開     |
| memories    | 思い出画像   | 公開     |

## 次のステップ

マイグレーションが完了したら、以下を確認してください：

1. ✅ `couple_invitations`テーブルが作成されている
2. ✅ ストレージバケット（`avatars`, `plan-images`, `memories`）が作成されている
3. ✅ RLSポリシーが適用されている
4. ✅ アプリケーションが正常に動作する

## 参考資料

- [Supabase SQL Editor](https://supabase.com/docs/guides/database/sql-editor)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
