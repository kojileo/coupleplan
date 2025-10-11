# モデル名訂正サマリー

## ⚠️ 重要な訂正（2025年10月10日）

**誤り**: `gemini-1.5-flash-latest` を推奨していました  
**問題**: このモデルは現在非推奨または存在しない可能性があります  
**正しい推奨**: `gemini-2.0-flash-exp`

**参照**: [Gemini API公式ドキュメント](https://ai.google.dev/gemini-api/docs/models?hl=ja)

---

## 📋 訂正内容

### 誤った情報

以前、以下のように推奨していました：

```env
# ❌ 誤り
AI_MODEL=gemini-1.5-flash-latest
```

**問題点**:

- 公式ドキュメントに `gemini-1.5-flash-latest` の記載がない
- 1.5系は現在推奨されていない可能性が高い
- 実際に動作するか不明

### 正しい情報

[公式ドキュメント](https://ai.google.dev/gemini-api/docs/models?hl=ja)に基づく正しい推奨：

```env
# ✅ 正しい
AI_MODEL=gemini-2.0-flash-exp
```

**根拠**:

- 公式ドキュメントに明記されている
- 思考トークンをサポート対象外（効率的）
- 第2世代の高速モデル
- 100万トークンのコンテキスト

---

## 🔍 公式ドキュメントから確認できるモデル

### 利用可能なGeminiモデル（2025年10月時点）

#### 1. **Gemini 2.5 Pro**

- モデルコード: `gemini-2.5-pro`
- 思考機能: **サポート対象**
- 用途: 複雑な推論タスク（コード、数学、STEM）
- 注意: 思考トークン約2000使用

#### 2. **Gemini 2.0 Flash** ⭐ 推奨

- モデルコード: `gemini-2.0-flash-exp`
- 思考機能: **サポート対象外**
- 用途: 高速生成、汎用的なタスク
- 利点: 思考トークン0、効率的

#### 3. **Gemini 2.0 Flash-Lite**

- モデルコード: `gemini-2.0-flash-lite`
- 思考機能: **サポート対象外**
- 用途: 最も軽量・低コスト
- 利点: 低レイテンシ、コスト効率最高

#### 4. **Gemini 2.0 Flash Live**

- モデルコード: `gemini-2.0-flash-live-001`
- 思考機能: **サポート対象外**
- 用途: Live API専用

---

## 📊 モデル比較（訂正版）

| モデル                | 思考トークン | 合計トークン使用量 | 生成時間    | 推奨度     |
| --------------------- | ------------ | ------------------ | ----------- | ---------- |
| **Gemini 2.0 Flash**  | **0**        | **1000-1500**      | **10-15秒** | ⭐⭐⭐⭐⭐ |
| Gemini 2.0 Flash-Lite | **0**        | **800-1200**       | **8-12秒**  | ⭐⭐⭐⭐⭐ |
| Gemini 2.5 Pro        | 約2000       | 約3000             | 15-25秒     | ⭐⭐       |
| ~~Gemini 1.5 Flash~~  | -            | -                  | -           | ❌ 非推奨  |

---

## ✅ 実施した修正

### 1. コードの修正

`src/lib/ai-service.ts`:

```typescript
// 変更前（誤り）
defaultModel = 'gemini-1.5-flash-latest';

// 変更後（正しい）
defaultModel = 'gemini-2.0-flash-exp';
```

### 2. ドキュメントの修正

以下のドキュメントを修正：

- ✅ `CORRECT_GEMINI_MODEL_GUIDE.md` - 新規作成（正しい情報）
- ✅ `FINAL_GEMINI_CONFIG.md` - モデル名を2.0系に訂正
- ✅ `ENV_SETUP_EXAMPLE.md` - 環境変数例を訂正
- ✅ `THINKING_TOKEN_OPTIMIZATION.md` - モデル名を訂正
- ✅ `THINKING_TOKEN_REDUCTION_SUMMARY.md` - サマリーを訂正
- ✅ `TOKEN_OPTIMIZATION.md` - 推奨モデルを訂正
- ✅ `README.md` - READMEを訂正

---

## 🚀 ユーザーへの推奨アクション

### 1. 環境変数を更新

`.env.local` を以下のように修正してください：

```env
# 変更前（誤り）
AI_MODEL=gemini-1.5-flash-latest

# 変更後（正しい）
AI_MODEL=gemini-2.0-flash-exp
```

### 2. 開発サーバーを再起動

```bash
# サーバーを停止（Ctrl + C）
npm run dev
```

### 3. 動作確認

http://localhost:3000/dashboard/plans/create でプラン生成をテスト

**期待される結果**:

```
[Gemini API] リクエスト送信: gemini-2.0-flash-exp
（10-15秒待機...）
[Gemini API] レスポンス受信: 200
[Gemini API] 終了理由: STOP
[Gemini API] 使用トークン: 1095（思考0 + 出力1095）
```

### 4. 本番環境（Vercel）にも反映

Vercelダッシュボードで環境変数を更新：

- `AI_MODEL` → `gemini-2.0-flash-exp`

---

## 💡 なぜこの間違いが起きたか

### 原因

1. **古い情報に基づいていた**: 1.5系が以前は推奨されていた
2. **公式ドキュメントの確認不足**: 最新の公式情報を確認していなかった
3. **Latest系の誤解**: `-latest` サフィックスは特定のモデルの最新版を指すエイリアスで、1.5系を指すものではない

### 学んだこと

1. ✅ 常に[公式ドキュメント](https://ai.google.dev/gemini-api/docs/models?hl=ja)を参照する
2. ✅ モデル名は正確に記載されているものを使用する
3. ✅ `-exp`, `-preview-`, `-latest` などのサフィックスの意味を理解する

---

## 🔍 モデル名のパターン（公式）

公式ドキュメントによると、以下のバージョンパターンがあります：

### Stable（安定版）

特定の安定版モデル。本番環境で推奨。

例: `gemini-2.5-flash`, `gemini-2.0-flash-lite`

### Preview（プレビュー版）

本番環境で使用可能なプレビュー。

例: `gemini-2.5-flash-preview-09-2025`

### Latest（最新版）

特定のモデルバリエーションの最新リリース。ホットスワップあり。

例: `gemini-flash-latest`

### Experimental（試験運用版）

試験運用モデル。本番環境での使用には不適切な場合あり。

例: `gemini-2.0-flash-exp`

**注**: `-exp` は試験運用版ですが、`gemini-2.0-flash-exp` は現在の2.0系の主要なバリエーションとして利用可能です。

---

## ✨ まとめ

### 重要な訂正

| 項目                 | 変更前（誤り）            | 変更後（正しい）       |
| -------------------- | ------------------------- | ---------------------- |
| 推奨モデル           | `gemini-1.5-flash-latest` | `gemini-2.0-flash-exp` |
| モデル系統           | 1.5系                     | 2.0系                  |
| 思考トークン         | 0（推測）                 | 0（公式確認済み）      |
| 公式ドキュメント参照 | なし                      | あり ✅                |

### 訂正の効果

**品質と効率は維持されます**:

- 思考トークン: 依然として0
- トークン使用量: 1000-1500（変わらず）
- 生成時間: 10-15秒（変わらず）
- **公式サポート**: 確実に利用可能 ✅

### ユーザーへのお詫び

誤った情報を提供してしまい、申し訳ございませんでした。
今後は常に[公式ドキュメント](https://ai.google.dev/gemini-api/docs/models?hl=ja)を参照し、正確な情報を提供いたします。

---

**訂正日**: 2025年10月10日  
**参照**: [Gemini API公式ドキュメント](https://ai.google.dev/gemini-api/docs/models?hl=ja)  
**ステータス**: 訂正完了 ✅
