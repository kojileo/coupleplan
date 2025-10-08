# 画像アップロード トラブルシューティングガイド

## 🔍 問題診断チェックリスト

画像アップロードができない場合、以下の順番で確認してください。

### ステップ1: ストレージバケットの確認

#### 1.1 Supabase Studio でバケットが作成されているか確認

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左側のメニューから「**Storage**」を選択
4. 以下のバケットが存在するか確認：
   - `avatars`
   - `plan-images`
   - `memories`

#### 1.2 バケットが存在しない場合

**方法A: UIから作成（推奨）**

1. Storage → 「New bucket」をクリック
2. バケット名: `avatars`
3. 「Public bucket」をONに設定
4. 「Create bucket」をクリック
5. 同様に`plan-images`と`memories`も作成

**方法B: SQLで作成**

SQL Editorで以下を実行：

```sql
-- バケットの作成
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('plan-images', 'plan-images', true),
  ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;
```

### ステップ2: ストレージポリシーの確認

#### 2.1 ポリシーが設定されているか確認

SQL Editorで以下のクエリを実行：

```sql
-- ストレージポリシーの確認
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects';
```

#### 2.2 ポリシーが不足している場合

`supabase/migrations/create_storage_buckets.sql`の全内容をSQL Editorで実行してください。

### ステップ3: 画像アップロード時のエラーを確認

#### 3.1 ブラウザのコンソールを開く

1. ブラウザで開発者ツールを開く（F12）
2. 「Console」タブを選択
3. 画像をアップロードしてエラーメッセージを確認

#### 3.2 よくあるエラーとその解決策

| エラーメッセージ                             | 原因                       | 解決策                   |
| -------------------------------------------- | -------------------------- | ------------------------ |
| `new row violates row-level security policy` | RLSポリシーが厳しすぎる    | ポリシーを緩和または修正 |
| `Bucket not found`                           | バケットが作成されていない | ステップ1を実行          |
| `Policy not found`                           | ポリシーが設定されていない | ステップ2を実行          |
| `File too large`                             | ファイルサイズ超過         | 5MB以下の画像を使用      |
| `Invalid file type`                          | 対応していないファイル形式 | JPEG/PNG/WebP/GIFを使用  |

### ステップ4: 簡易版ポリシーで試す（デバッグ用）

もしポリシーが厳しすぎて動作しない場合、一時的に以下の簡易版を試してください：

```sql
-- 【警告】デバッグ用の緩いポリシー - 本番環境では使用しないこと

-- 既存のアバターポリシーを削除
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- 簡易版: 認証済みユーザーは誰でもアバターをアップロード可能
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );
```

**注意**: この簡易版で動作することを確認したら、後で元の厳格なポリシーに戻してください。

### ステップ5: アップロード処理のデバッグ

#### 5.1 コンソールログの追加

プロフィール画面でアバターアップロード時にコンソールログを確認：

```typescript
// ブラウザのコンソールで以下を実行
// 認証状態の確認
const {
  data: { session },
} = await window.supabase.auth.getSession();
console.log('認証セッション:', session);

// ユーザーIDの確認
console.log('ユーザーID:', session?.user?.id);
```

#### 5.2 手動でアップロードテスト

ブラウザのコンソールで以下を実行：

```javascript
// 手動アップロードテスト
const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const userId = 'your-user-id'; // 実際のユーザーIDに置き換え

const { data, error } = await window.supabase.storage
  .from('avatars')
  .upload(`${userId}/test.jpg`, testFile, {
    contentType: 'image/jpeg',
    upsert: true,
  });

console.log('結果:', { data, error });
```

### ステップ6: ストレージバケットのRLS確認

#### 6.1 バケットのRLS状態を確認

```sql
-- バケットのRLS状態を確認
SELECT * FROM storage.buckets WHERE name IN ('avatars', 'plan-images', 'memories');
```

#### 6.2 RLSが有効化されているか確認

ストレージバケットのRLSはデフォルトで**有効**になっています。もし無効になっている場合は以下を実行：

```sql
-- storage.objectsテーブルのRLSを有効化（通常は既に有効）
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### ステップ7: 画像アップロードAPIのテスト

#### 7.1 APIエンドポイントを直接テスト

開発者ツールのNetworkタブで以下を確認：

1. `/api/profile/avatar` へのPOSTリクエストが送信されているか
2. レスポンスのステータスコードとボディ

#### 7.2 curlでテスト

```bash
# PowerShellで実行
$headers = @{
    "Authorization" = "Bearer YOUR_ACCESS_TOKEN"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/profile/avatar" `
  -Method POST `
  -Headers $headers `
  -Form @{avatar="@path/to/image.jpg"}
```

## 🛠️ よくある修正方法

### 修正1: ポリシーを完全にリセット

```sql
-- すべてのストレージポリシーを削除
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    END LOOP;
END$$;

-- その後、create_storage_buckets.sql を実行
```

### 修正2: バケットを再作成

```sql
-- バケットを削除（すべてのファイルも削除されます）
DELETE FROM storage.buckets WHERE name = 'avatars';

-- バケットを再作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

### 修正3: 最もシンプルなポリシー（一時的）

デバッグのために、最もシンプルなポリシーを試します：

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- 誰でもアップロード可能（デバッグ用のみ！）
CREATE POLICY "Anyone can upload to avatars" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars');
```

**警告**: この設定は非常に緩いため、動作確認後は必ず元の厳格なポリシーに戻してください。

## 📋 完全なセットアップ手順（推奨）

画像アップロード機能を確実に動作させるための完全な手順：

### 1. Supabase Storageの設定（UIから）

1. Supabase Dashboard → Storage
2. 「New bucket」で`avatars`バケットを作成
3. 「Public bucket」をONに設定
4. 作成完了

### 2. ポリシーの設定（SQL Editorから）

`supabase/migrations/create_storage_buckets.sql`の全内容を実行

### 3. 動作確認

1. アプリケーションを起動: `npm run dev`
2. プロフィール画面にアクセス
3. 画像をアップロード
4. エラーが出る場合はブラウザコンソールを確認

### 4. トラブルシューティング

- エラーメッセージをコピー
- 上記のチェックリストを確認
- 必要に応じて簡易版ポリシーで動作確認

## 🎯 成功の確認方法

以下の手順で成功を確認：

1. ✅ バケットが作成されている
2. ✅ ポリシーが設定されている
3. ✅ 画像がアップロードできる
4. ✅ アップロードした画像がプロフィールに表示される
5. ✅ 画像を削除できる

---

**作成日**: 2025年10月8日
**対象**: CouplePlan 画像アップロード機能
