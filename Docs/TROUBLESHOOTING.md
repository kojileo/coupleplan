# トラブルシューティング

よくある問題と解決方法をまとめています。

---

## 🤖 AI生成関連のエラー

### エラー1: `MAX_TOKENS_ERROR`

**症状**:

```
レスポンスがトークン制限に達しました
```

**原因**: `AI_MAX_TOKENS` が不足

**解決策**:

```env
# .env.local
AI_MODEL=gemini-2.5-flash-lite
AI_MAX_TOKENS=2000  # 2000以上を推奨
```

### エラー2: `RATE_LIMIT_ERROR`

**症状**:

```
レート制限に達しました。しばらく待ってから再試行してください
```

**原因**: API呼び出し頻度が高すぎる

**解決策**:

- 1分間15リクエスト以下に制限
- 自動リトライ機能が動作（実装済み）
- 少し待ってから再試行

### エラー3: 思考トークンで非効率

**症状**:

```
⚠️ 思考トークン（1999）が使用されています
```

**原因**: `gemini-2.5-pro` を使用している

**解決策**:

```env
# より効率的なモデルに変更
AI_MODEL=gemini-2.5-flash-lite  # 推奨（思考トークン0）
AI_MAX_TOKENS=2000
```

**モデル比較**:

| モデル                | トークン使用量 | 思考トークン |
| --------------------- | -------------- | ------------ |
| gemini-2.5-flash-lite | 659-889        | 0            |
| gemini-2.0-flash-exp  | 1000-1500      | 0            |
| gemini-2.5-pro        | 約3000         | 約2000       |

---

## 🗄️ データベース関連のエラー

### エラー4: Duration型不一致

**症状**:

```
invalid input syntax for type integer: "1.5"
```

**原因**: AIが時間単位（1.5時間）を出力、DBは分単位（整数）を期待

**解決**: 実装済み（自動変換）

```typescript
// 時間 → 分に自動変換
duration: Math.round(plan.duration * 60); // 1.5時間 → 90分
```

### エラー5: order_index が null

**症状**:

```
null value in column "order_index" violates not-null constraint
```

**原因**: AIの出力に `order_index` が含まれていない

**解決**: 実装済み（自動生成）

```typescript
// order_indexを自動生成
item.order_index = index + 1; // 1, 2, 3...
```

### エラー6: RLS ポリシーエラー

**症状**:

```
new row violates row-level security policy
```

**原因**: Row Level Securityが正しく設定されていない

**解決策**:

1. Supabase SQL Editorで `supabase/database_setup_complete.sql` を実行
2. 認証状態を確認（ログイン済みか）
3. カップル関係が正しく設定されているか確認

---

## 🔐 認証関連のエラー

### エラー7: メール認証が届かない

**症状**: サインアップ後にメール認証メールが届かない

**解決策**:

1. **開発環境**: Supabaseダッシュボード → Authentication → Users でメール認証を手動で有効化
2. **本番環境**: Supabaseの Email Templates を設定
3. スパムフォルダを確認

### エラー8: セッションエラー

**症状**:

```
No active session
```

**原因**: ログインセッションが切れている

**解決策**:

- 再ログイン
- ブラウザのキャッシュクリア
- Cookie設定を確認

---

## 🚀 デプロイ関連のエラー

### エラー9: Vercelビルドエラー

**症状**:

```
Build failed with error
```

**解決策**:

1. ローカルでビルド確認

   ```bash
   npm run build
   ```

2. 環境変数が設定されているか確認
   - Vercelダッシュボード → Settings → Environment Variables

3. Node.jsバージョンを確認
   ```json
   // package.json
   "engines": {
     "node": ">=18"
   }
   ```

### エラー10: 環境変数が反映されない

**症状**: Vercelで環境変数を設定したのに動作しない

**解決策**:

1. 環境変数を設定後、**再デプロイ**が必要
2. プレビュー環境と本番環境で設定を分ける
3. `NEXT_PUBLIC_` プレフィックスの有無を確認

---

## 💡 パフォーマンス改善

### 問題11: AI生成が遅い

**症状**: プラン生成に30秒以上かかる

**解決策**:

1. モデルを変更

   ```env
   AI_MODEL=gemini-2.5-flash-lite  # 最速
   ```

2. トークン数を調整

   ```env
   AI_MAX_TOKENS=2000  # 適切な値
   ```

3. タイムアウト設定を確認（自動調整済み）

**生成時間の目安**:

- gemini-2.5-flash-lite: 5-10秒
- gemini-2.0-flash-exp: 10-15秒
- gemini-2.5-pro: 15-25秒

---

## 🔍 デバッグ方法

### ログの確認

**開発環境**:

```bash
# ターミナルでログを確認
npm run dev

# 以下のようなログが表示される
[Gemini API] リクエスト送信: gemini-2.5-flash-lite
[Gemini API] レスポンス受信: 200
[Gemini API] 使用トークン: 889
```

**本番環境**:

- Vercelダッシュボード → Logs

### トークン使用量の確認

レスポンスに含まれる `usageMetadata`:

```json
{
  "promptTokenCount": 201,
  "candidatesTokenCount": 688,
  "totalTokenCount": 889
}
```

---

## 🆘 それでも解決しない場合

### 1. ログの確認

開発者ツール（F12）でコンソールとネットワークタブを確認

### 2. データベースの状態確認

Supabaseダッシュボードで：

- Table Editor → データを直接確認
- SQL Editor → クエリ実行

### 3. 環境のリセット

```bash
# node_modules削除
rm -rf node_modules

# 再インストール
npm install

# .env.localの再設定
# キャッシュクリア
```

### 4. GitHub Issuesで報告

以下の情報を含めて報告：

- エラーメッセージ
- 再現手順
- 環境（OS、ブラウザ、Node.jsバージョン）
- ログ

---

## 📚 関連ドキュメント

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - 初期セットアップ
- **[README.md](./README.md)** - ドキュメント一覧

---

## ✅ トラブルシューティング チェックリスト

問題が発生したら、以下を順番に確認：

1. [ ] `.env.local` が正しく設定されているか
2. [ ] 開発サーバーを再起動したか
3. [ ] ブラウザのキャッシュをクリアしたか
4. [ ] APIキーが有効か（期限切れでないか）
5. [ ] Supabaseプロジェクトが起動しているか
6. [ ] データベースセットアップが完了しているか（`database_setup_complete.sql`実行済み）
7. [ ] エラーログを確認したか
8. [ ] 最新のコードをpullしたか

---

**最終更新**: 2025年10月10日  
**バージョン**: v1.0.0
