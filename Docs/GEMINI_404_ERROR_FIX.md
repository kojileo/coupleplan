# Gemini API 404エラー 修正ガイド

## エラー内容

```
AI生成エラー: Error [AIGenerationError]: Gemini APIエラー: 404
```

## 原因

404エラー（Not Found）が発生する主な原因:

1. **モデル名が正しくない**
2. **APIエンドポイントのバージョンが古い**
3. **APIキーが無効**

## 修正内容（完了済み）✅

### 1. APIエンドポイントを v1beta → v1 に変更

**変更前:**

```typescript
`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`;
```

**変更後:**

```typescript
`https://generativelanguage.googleapis.com/v1/models/${config.model}:generateContent?key=${apiKey}`;
```

### 2. デフォルトモデル名を最新版に変更

**変更前:**

```typescript
defaultModel = 'gemini-pro';
```

**変更後:**

```typescript
defaultModel = 'gemini-1.5-pro-latest';
```

### 3. 詳細なエラーログを追加

404エラー時に以下の情報が表示されるようになりました:

- モデル名
- エンドポイントURL（APIキーは非表示）
- エラー詳細

## 環境変数の設定

`.env.local` を以下のように設定してください:

### 推奨設定

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-pro-latest
AI_MAX_TOKENS=8000
AI_TEMPERATURE=0.7
```

### 代替設定（レガシーモデル）

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-pro
AI_MAX_TOKENS=8000
AI_TEMPERATURE=0.7
```

## 利用可能なモデル

| モデル名                  | 説明                | 推奨      |
| ------------------------- | ------------------- | --------- |
| `gemini-1.5-pro-latest`   | 最新版、最も高性能  | ⭐ 推奨   |
| `gemini-1.5-flash-latest` | 高速版、コスト効率◎ | ✅ OK     |
| `gemini-pro`              | レガシー版          | ⚠️ 非推奨 |

## 動作確認手順

### 1. 環境変数を確認

```bash
# Windowsの場合
echo $env:AI_MODEL
echo $env:GEMINI_API_KEY

# Mac/Linuxの場合
echo $AI_MODEL
echo $GEMINI_API_KEY
```

### 2. 開発サーバーを再起動

```bash
# サーバーを停止（Ctrl + C）
npm run dev
```

### 3. デバッグログを確認

ターミナルに以下のようなログが表示されます:

```
[Gemini API] リクエスト送信: gemini-1.5-pro-latest
[Gemini API] レスポンス受信: 200
```

エラーの場合:

```
[Gemini API] リクエスト送信: gemini-1.5-pro-latest
[Gemini API] レスポンス受信: 404
[Gemini API] エラー詳細: {
  status: 404,
  statusText: 'Not Found',
  url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent?key=API_KEY_HIDDEN',
  error: { ... }
}
```

### 4. プラン生成をテスト

1. http://localhost:3000/dashboard/plans/create にアクセス
2. フォームに入力
3. 「プランを生成」をクリック
4. エラーが表示されないか確認

## トラブルシューティング

### エラー: "Gemini APIの応答にテキストが含まれていません"

**原因**: レスポンスの構造が期待と異なる

**解決策**:

1. **ターミナルのログを確認**:

   ```
   [Gemini API] レスポンス全体: {...}
   [Gemini API] 候補[0]: {...}
   ```

   この詳細ログでレスポンス構造を確認

2. **修正済み**: コードは複数のレスポンス形式に対応済み
   - `candidate.content.parts[0].text`
   - `candidate.text`
   - 直接文字列

3. **それでもエラーが出る場合**:
   - ログに表示されたレスポンス構造を報告
   - モデル名を変更して試す

### エラーが続く場合

#### 1. APIキーを確認

Google AI Studio (https://aistudio.google.com/) で:

- APIキーが有効か確認
- 新しいAPIキーを生成して試す
- プロジェクトの課金設定を確認（無料枠内でも設定が必要な場合あり）

#### 2. モデル名を変更して試す

`.env.local` で以下を試してください:

```env
# 試す順序
AI_MODEL=gemini-1.5-pro-latest    # まずこれ
AI_MODEL=gemini-1.5-flash-latest  # ダメなら高速版
AI_MODEL=gemini-pro               # それでもダメならレガシー
```

#### 3. モックモードで動作確認

```env
AI_PROVIDER=mock
```

モックモードで動作すれば、問題はGemini API側にあります。

#### 4. ネットワークを確認

```bash
# PowerShellの場合
Test-NetConnection generativelanguage.googleapis.com -Port 443

# Mac/Linuxの場合
curl -I https://generativelanguage.googleapis.com/
```

#### 5. ファイアウォール/プロキシを確認

企業ネットワークの場合、Gemini APIへのアクセスがブロックされている可能性があります。

## よくある質問

### Q: 修正後も404エラーが出る

**A**: 以下を確認:

1. 開発サーバーを再起動したか？
2. 環境変数が正しく設定されているか？
3. `.env.local` ファイルがプロジェクトルートにあるか？
4. `AI_MODEL` に余計な空白や改行が含まれていないか？

### Q: どのモデルを使えばいい？

**A**: `gemini-1.5-pro-latest` を推奨します。

- 最も高性能
- 日本語対応が優秀
- コンテキストウィンドウが大きい

高速レスポンスが必要な場合は `gemini-1.5-flash-latest` も検討してください。

### Q: APIキーは無料？

**A**: はい、以下の無料枠があります:

- 1分間: 15リクエスト
- 1日: 1,500リクエスト

小規模〜中規模のサービスなら十分です。

### Q: 本番環境でも404エラーが出る

**A**: Vercelの環境変数を確認:

1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. `AI_PROVIDER`, `GEMINI_API_KEY`, `AI_MODEL` が正しく設定されているか確認
3. 設定変更後、プロジェクトを再デプロイ

## 関連ドキュメント

- [GEMINI_API_SETUP.md](./GEMINI_API_SETUP.md) - 詳細なセットアップガイド
- [AI_DATE_PLAN_IMPLEMENTATION.md](./AI_DATE_PLAN_IMPLEMENTATION.md) - AI機能の実装詳細
- [開発計画.md](./開発計画.md) - プロジェクト全体の計画

## サポート

問題が解決しない場合は、以下の情報を含めて報告してください:

1. エラーメッセージの全文
2. 環境変数の設定（APIキーは除く）
3. ターミナルに表示されたデバッグログ
4. 使用しているモデル名
5. 開発環境（Windows/Mac/Linux、Node.jsバージョン）

---

**最終更新**: 2025年10月9日  
**修正バージョン**: v0.3.1
