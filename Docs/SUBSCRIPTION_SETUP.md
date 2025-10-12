# サブスクリプション機能セットアップガイド

**作成日**: 2025年10月11日  
**所要時間**: 5-10分  
**難易度**: 簡単

---

## 📋 概要

このガイドでは、マネタイズ機能（AIプラン生成の制限機能）を有効化するための手順を説明します。

---

## ⚠️ 重要な注意事項

### 現在のエラーについて

ダッシュボードで以下のエラーが表示される場合：

```
Error: 認証が必要です
GET /api/subscription/check-limit 401
```

**原因**: データベースマイグレーションがまだ実行されていないため、`subscription_plans`、`user_subscriptions`、`plan_generation_usage` テーブルが存在しません。

**解決方法**: 以下の手順でマイグレーションを実行してください。

---

## 🚀 セットアップ手順

### Step 1: Supabaseダッシュボードにアクセス

1. ブラウザで Supabase プロジェクトを開く

   ```
   https://supabase.com/dashboard/project/[your-project-id]
   ```

2. 左メニューから **SQL Editor** を選択

3. **New query** をクリック

### Step 2: マイグレーションSQLをコピー

1. ローカルでマイグレーションファイルを開く

   ```bash
   # Windowsの場合
   notepad supabase\migrations\create_subscription_system.sql

   # または VS Code で開く
   code supabase/migrations/create_subscription_system.sql
   ```

2. ファイルの内容を**すべてコピー**

### Step 3: SQLを実行

1. Supabase SQL Editorに**貼り付け**

2. **Run**（または Ctrl+Enter / Cmd+Enter）をクリック

3. 実行結果を確認
   ```
   Success. No rows returned
   ```
   または
   ```
   3 rows affected
   ```
   のようなメッセージが表示されればOK

### Step 4: 動作確認

SQL Editorで以下のクエリを実行して確認：

```sql
-- 1. プランが正しく作成されているか確認
SELECT * FROM subscription_plans;
```

**期待される結果**:
| id | name | display_name | price_monthly | daily_plan_limit | monthly_plan_limit |
|----|------|--------------|---------------|------------------|-------------------|
| ... | free | Free | 0 | 3 | 10 |
| ... | premium | Premium | 480 | NULL | NULL |

```sql
-- 2. 既存ユーザーにFreeプランが割り当てられているか確認
SELECT
  u.email,
  sp.name AS plan_name,
  sp.display_name,
  us.status
FROM auth.users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id;
```

**期待される結果**:
すべてのユーザーに `free` プランが `active` 状態で割り当てられている

### Step 5: アプリケーションを再読み込み

1. ブラウザで `http://localhost:3000/dashboard` を**リロード**（F5 または Ctrl+R）

2. エラーが消えて、使用状況が表示されることを確認
   ```
   📊 AIプラン生成の残り回数
   今日: 3 / 3回
   今月: 10 / 10回
   ```

---

## ✅ 動作確認チェックリスト

### ダッシュボード画面

- [ ] エラーメッセージが表示されない
- [ ] 使用状況カードが表示される
  - 今日の残り: 3 / 3回
  - 今月の残り: 10 / 10回
- [ ] 💎「無制限で使う」リンクが表示される
- [ ] **新しいカード「サブスクリプション」**が表示される

### プラン作成画面

- [ ] `/dashboard/plans/create` にアクセス
- [ ] 使用状況が表示される
- [ ] プラン作成フォームが表示される
- [ ] プラン生成ボタンが有効

### プラン生成テスト

1. [ ] プラン作成画面で1回目の生成
   - 成功する
   - 残り回数が「2 / 3回」に減る

2. [ ] 2回目の生成
   - 成功する
   - 残り回数が「1 / 3回」に減る

3. [ ] 3回目の生成
   - 成功する
   - 残り回数が「0 / 3回」に減る

4. [ ] 4回目の生成を試みる
   - **モーダルが表示される**
   - 「本日の作成回数に達しました」メッセージ
   - 「明日また3回作成できます」案内
   - Premium案内が表示される

### サブスクリプション管理画面

- [ ] `/dashboard/subscription` にアクセス
- [ ] 「現在のプラン: Free」が表示される
- [ ] 使用状況のプログレスバーが表示される
- [ ] Premium案内が表示される
- [ ] 「Premium プランに興味がある」ボタンをクリック
  - アラートが表示される（近日公開予定の案内）

---

## 🐛 トラブルシューティング

### 問題1: マイグレーション実行時にエラー

**エラー**: `relation "subscription_plans" already exists`

**原因**: すでにテーブルが作成されている

**解決策**: 問題ありません。すでにマイグレーションが完了しています。

---

**エラー**: `permission denied for schema public`

**原因**: 権限不足

**解決策**:

1. Supabaseダッシュボード → Settings → Database
2. Connection stringをコピー
3. `psql`で接続してSQLを実行
4. または、Supabase CLIを使用

---

### 問題2: 新規ユーザーにプランが割り当てられない

**確認方法**:

```sql
-- トリガーが存在するか確認
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**解決策**:

```sql
-- トリガーを再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();

-- 手動で既存ユーザーにプランを割り当て
DO $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id
  FROM subscription_plans
  WHERE name = 'free' AND is_active = true
  LIMIT 1;

  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    SELECT u.id, free_plan_id, 'active'
    FROM auth.users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id
    WHERE us.id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;
```

---

### 問題3: 残り回数が表示されない

**原因**: キャッシュの問題

**解決策**:

1. ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）
2. ハードリロード
3. ブラウザの開発者ツール（F12）→ Networkタブで `/api/subscription/check-limit` のレスポンスを確認

---

### 問題4: 日次/月次のリセットが動作しない

**確認方法**:

```sql
-- 使用履歴を確認
SELECT
  user_id,
  generated_at,
  generation_date,
  generation_month
FROM plan_generation_usage
ORDER BY generated_at DESC
LIMIT 10;
```

**解決策**:

- `generation_date` と `generation_month` が正しく計算されているか確認
- タイムゾーンがJSTになっているか確認

---

## 📊 データベース構造の確認

### テーブル一覧

```sql
-- すべてのテーブルを確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'subscription%' OR table_name LIKE '%usage%'
ORDER BY table_name;
```

**期待される結果**:

```
subscription_plans
user_subscriptions
plan_generation_usage
```

### RLSポリシーの確認

```sql
-- RLSポリシーを確認
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'plan_generation_usage')
ORDER BY tablename, policyname;
```

---

## 🎯 次のステップ

セットアップが完了したら：

1. **新規ユーザーを作成してテスト**
   - サインアップ
   - 自動的にFreeプランが割り当てられることを確認

2. **AIプラン生成を3回実行**
   - 各生成後に残り回数が減ることを確認

3. **制限到達を確認**
   - 4回目の生成でモーダルが表示されることを確認

4. **サブスクリプション画面を確認**
   - `/dashboard/subscription` で詳細情報を確認

---

## 📞 サポート

問題が解決しない場合：

1. **ログを確認**
   - ブラウザの開発者ツール（F12）→ Console
   - Supabaseダッシュボード → Logs

2. **データベースを確認**
   - Supabaseダッシュボード → Table Editor
   - 各テーブルのデータを確認

3. **マイグレーションログを確認**
   - SQL Editorでの実行結果
   - エラーメッセージの詳細

---

**最終更新**: 2025年10月11日  
**バージョン**: 1.0
