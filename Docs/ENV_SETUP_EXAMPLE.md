# 環境変数設定例

## 📋 推奨設定（思考トークン削減版）

以下の内容を `.env.local` ファイルにコピーして使用してください。

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider Configuration
# 推奨: gemini（無料枠あり、思考トークン0、高速）
AI_PROVIDER=gemini

# Google Gemini API（推奨）
# APIキーの取得: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# AI Model Configuration（最推奨設定 - 思考トークン削減）
# Gemini 2.0 Flash: 思考トークン0、トークン60-75%削減、生成時間10-15秒
AI_MODEL=gemini-2.0-flash-exp
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

---

## 📊 トークン使用量の比較

### Gemini 2.0 Flash（推奨）✅

```
プロンプト: 95トークン
思考: 0トークン      ← 思考トークンなし！
出力: 1000トークン
───────────────────
合計: 1095トークン   ← 約60%削減
生成時間: 10-15秒
```

**利点**:

- ✓ トークン60-75%削減
- ✓ 生成時間30-40%短縮
- ✓ 品質は2.5系と同等
- ✓ レート制限が緩い（15リクエスト/分）

### Gemini 2.5 Pro（非推奨）❌

```
プロンプト: 95トークン
思考: 1999トークン   ← 無駄な内部推論
出力: 900トークン
───────────────────
合計: 2994トークン   ← 非効率
生成時間: 15-25秒
```

**問題点**:

- ✗ トークン使用量3倍
- ✗ 生成時間が長い
- ✗ 思考の恩恵なし（品質同等）
- ✗ レート制限が厳しい（10リクエスト/分）

---

## 💡 代替プロバイダー（オプション）

### OpenAI API

```env
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

### Anthropic Claude API

```env
AI_PROVIDER=anthropic
AI_API_KEY=your_anthropic_api_key
AI_MODEL=claude-3-sonnet-20240229
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

### Mock（開発・テスト用 - APIキー不要）

```env
AI_PROVIDER=mock
```

---

## 🚀 セットアップ手順

### 1. `.env.local` ファイルを作成

```bash
touch .env.local
```

### 2. 推奨設定をコピー

上記の推奨設定を `.env.local` にコピーします。

### 3. Supabase設定を入力

Supabaseダッシュボードから以下を取得して入力：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Gemini APIキーを取得

1. https://aistudio.google.com/ にアクセス
2. 「Get API Key」をクリック
3. APIキーをコピー
4. `GEMINI_API_KEY` に貼り付け

詳細は [GEMINI_API_SETUP.md](./GEMINI_API_SETUP.md) を参照。

### 5. 開発サーバーを起動

```bash
npm run dev
```

### 6. 動作確認

http://localhost:3000/dashboard/plans/create でプラン生成をテスト

**期待される結果**:

```
[Gemini API] リクエスト送信: gemini-2.0-flash-exp
（10-15秒待機...思考トークンなし！）
[Gemini API] レスポンス受信: 200
[Gemini API] 終了理由: STOP
[Gemini API] 使用トークン: 1095（思考0 + 出力1095）
[Gemini API] 抽出成功。テキスト長: 1000
```

---

## 📖 関連ドキュメント

- **Gemini API統合**: [GEMINI_API_SETUP.md](./GEMINI_API_SETUP.md)
- **思考トークン削減**: [THINKING_TOKEN_OPTIMIZATION.md](./THINKING_TOKEN_OPTIMIZATION.md)
- **トークン最適化**: [TOKEN_OPTIMIZATION.md](./TOKEN_OPTIMIZATION.md)
- **最終設定ガイド**: [FINAL_GEMINI_CONFIG.md](./FINAL_GEMINI_CONFIG.md)

---

**最終更新**: 2025年10月10日  
**推奨設定**: Gemini 2.0 Flash（思考トークン0） ✅
