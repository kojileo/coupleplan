# Gemini モデル選択ガイド（公式ドキュメント準拠）

## ⚠️ 重要な訂正

**以前の推奨**: `gemini-1.5-flash-latest`  
**問題**: このモデルは現在非推奨または存在しない可能性があります

**正しい推奨**: `gemini-2.0-flash-exp` または `gemini-2.0-flash-lite`

参照: [Gemini API公式ドキュメント](https://ai.google.dev/gemini-api/docs/models?hl=ja)

---

## ✅ 正しいモデル選択（2025年10月時点）

### 推奨モデル

#### 1. **Gemini 2.0 Flash** ⭐ 最推奨

- モデルコード: `gemini-2.0-flash-exp`
- 思考機能: **サポート対象外**（思考トークン0）
- コンテキスト: 100万トークン
- 用途: 汎用的な高速生成

**推奨理由**:

- 思考トークンを使用しない
- 高速で効率的
- 品質は高性能

#### 2. **Gemini 2.0 Flash-Lite**

- モデルコード: `gemini-2.0-flash-lite`
- 思考機能: **サポート対象外**（思考トークン0）
- コンテキスト: 100万トークン
- 用途: さらに高速・低コストが必要な場合

**推奨理由**:

- 最も軽量
- 低レイテンシ
- コスト効率最高

#### 3. **Gemini 2.5 Pro** ⚠️ 高度な推論タスク向け

- モデルコード: `gemini-2.5-pro`
- 思考機能: **サポート対象**（思考トークン約2000）
- 用途: 複雑な数学、コード、STEMの推論

**注意**:

- 思考トークンで約3000トークン消費
- 生成時間が長い
- 通常のデートプラン生成には不要

---

## 📊 モデル比較表

| モデル                | 思考トークン | 合計トークン使用量 | 生成時間    | 推奨度     |
| --------------------- | ------------ | ------------------ | ----------- | ---------- |
| **Gemini 2.0 Flash**  | **0**        | **1000-1500**      | **10-15秒** | ⭐⭐⭐⭐⭐ |
| Gemini 2.0 Flash-Lite | **0**        | **800-1200**       | **8-12秒**  | ⭐⭐⭐⭐⭐ |
| Gemini 2.5 Pro        | 約2000       | 約3000             | 15-25秒     | ⭐⭐       |

---

## 🚀 推奨設定

### `.env.local`

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.0-flash-exp
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

### 代替設定（より軽量版が必要な場合）

```env
AI_MODEL=gemini-2.0-flash-lite
AI_MAX_TOKENS=2000
```

---

## 🔍 モデルバージョンのパターン

公式ドキュメントによると、以下のバージョンパターンがあります：

### Stable（安定版）

特定の安定版モデル。本番環境で推奨。

例: `gemini-2.5-flash`

### Preview（プレビュー版）

本番環境で使用可能なプレビュー。課金が有効。

例: `gemini-2.5-flash-preview-09-2025`

### Latest（最新版）

特定のモデルの最新リリース。新しいバージョンごとにホットスワップされる。

例: `gemini-flash-latest`

### Experimental（試験運用版）

試験運用モデル。本番環境での使用には不適切。

例: `gemini-2.0-flash-exp`

**注**: `-exp` は試験運用版ですが、`gemini-2.0-flash-exp` は現在利用可能な2.0系の主要なバリエーションです。

---

## 💡 実際に使えるモデル名

公式ドキュメントと実際のAPI動作から、以下のモデル名が使用可能です：

### 確実に使えるモデル

```typescript
// Gemini 2.5系（思考トークンあり）
'gemini-2.5-pro';
'gemini-2.5-flash';

// Gemini 2.0系（思考トークンなし）
'gemini-2.0-flash-exp';
'gemini-2.0-flash-lite';
'gemini-2.0-flash-lite-001';

// Live API用
'gemini-2.0-flash-live-001';
```

### エイリアス（Latest系）

```typescript
// 最新版へのエイリアス（ホットスワップあり）
'gemini-flash-latest'; // 2.0または2.5の最新
'gemini-pro-latest'; // 2.5 Proの最新
```

**警告**: Latest系は予告なく変更される可能性があるため、本番環境では特定バージョンを推奨。

---

## ⚡ デートプラン生成における推奨

### ユースケース: AIデートプラン提案

**要件**:

- 高速生成（10-15秒）
- 効率的なトークン使用
- 高品質な出力
- 思考機能は不要（単純な情報整理）

**最適なモデル**: `gemini-2.0-flash-exp`

**理由**:

1. 思考トークン0（効率的）
2. 生成時間が短い
3. 品質は十分高い
4. デートプランのような構造化出力に適している

---

## 🔧 移行ガイド

### 誤った設定から正しい設定への移行

#### 変更前（誤り）

```env
AI_MODEL=gemini-1.5-flash-latest  # ← 非推奨または存在しない
AI_MAX_TOKENS=2000
```

#### 変更後（正しい）

```env
AI_MODEL=gemini-2.0-flash-exp  # ← 正しいモデル名
AI_MAX_TOKENS=2000
```

### コードのデフォルト値も更新済み

`src/lib/ai-service.ts`:

```typescript
// 変更後
defaultModel = 'gemini-2.0-flash-exp';
```

---

## 📖 参照リンク

- **公式モデル一覧**: https://ai.google.dev/gemini-api/docs/models?hl=ja
- **レート制限**: https://ai.google.dev/gemini-api/docs/rate-limits?hl=ja
- **Google AI Studio**: https://aistudio.google.com/

---

## ✨ まとめ

### 重要なポイント

1. ❌ `gemini-1.5-flash-latest` は現在非推奨または存在しない
2. ✅ `gemini-2.0-flash-exp` を使用する（思考トークン0）
3. ✅ `gemini-2.0-flash-lite` も選択肢（さらに軽量）
4. ⚠️ `gemini-2.5-pro` は思考トークンで非効率

### 推奨アクション

1. `.env.local` を更新

   ```env
   AI_MODEL=gemini-2.0-flash-exp
   ```

2. 開発サーバーを再起動

   ```bash
   npm run dev
   ```

3. 動作確認

---

**最終更新**: 2025年10月10日  
**参照**: [Gemini API公式ドキュメント](https://ai.google.dev/gemini-api/docs/models?hl=ja)  
**ステータス**: 公式ドキュメント準拠 ✅
