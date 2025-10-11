# Duration型不一致問題の修正

## 📋 問題の概要

**エラー**: `invalid input syntax for type integer: "1.5"`

AIが生成したデートプランをデータベースに保存する際、`duration`フィールドの型不一致エラーが発生しました。

---

## 🔍 問題の詳細分析

### 1. エラーログ

```
アイテム保存エラー: {
  code: '22P02',
  details: null,
  hint: null,
  message: 'invalid input syntax for type integer: "1.5"'
}
```

**エラーコード**: `22P02` = PostgreSQLの型変換エラー

### 2. データベーススキーマ

```sql
-- supabase/migrations/create_date_plans.sql
CREATE TABLE plan_items (
  ...
  duration INTEGER, -- minutes  ← 分単位の整数
  ...
);
```

**データベースの期待値**: 分単位の整数（例: 90分）

### 3. AIの出力

```json
{
  "duration": 1.5, // ← 時間単位の小数（1.5時間）
  "name": "コニカミノルタ プラネタリウム...",
  "start_time": "14:00",
  "cost": 3000
}
```

**AIの出力**: 時間単位の小数（例: 1.5時間 = 90分）

### 4. 型不一致

| 項目         | データベース  | AI出力 | 状態 |
| ------------ | ------------- | ------ | ---- |
| duration型   | INTEGER       | FLOAT  | ❌   |
| duration単位 | 分（minutes） | 時間   | ❌   |
| duration例   | 90            | 1.5    | ❌   |

---

## ✅ 解決策

### 修正内容

APIエンドポイントで**時間→分**の変換を追加：

```typescript
// src/app/api/plans/generate/route.ts

// プラン全体のduration変換
duration: Math.round(plan.duration * 60),  // 4時間 → 240分

// アイテムのduration変換
duration: Math.round((item.duration || 0) * 60),  // 1.5時間 → 90分
```

**変換ロジック**:

1. AIの出力（時間単位）を60倍
2. `Math.round()`で整数化
3. データベースに保存

---

## 📊 変換例

### プラン全体

| AI出力（時間） | 計算           | DB保存値（分） |
| -------------- | -------------- | -------------- |
| 4              | 4 × 60 = 240   | 240            |
| 6.5            | 6.5 × 60 = 390 | 390            |
| 3              | 3 × 60 = 180   | 180            |

### プランアイテム

| AI出力（時間） | 計算           | DB保存値（分） |
| -------------- | -------------- | -------------- |
| 1.5            | 1.5 × 60 = 90  | 90             |
| 2.0            | 2.0 × 60 = 120 | 120            |
| 0.5            | 0.5 × 60 = 30  | 30             |

---

## 🎯 修正箇所

### 1. プラン保存時の変換

**ファイル**: `src/app/api/plans/generate/route.ts`

**変更前**:

```typescript
duration: plan.duration,
```

**変更後**:

```typescript
// durationを時間→分に変換（データベースは分単位の整数）
duration: Math.round(plan.duration * 60),
```

### 2. アイテム保存時の変換

**ファイル**: `src/app/api/plans/generate/route.ts`

**変更前**:

```typescript
duration: item.duration,
```

**変更後**:

```typescript
// durationを時間→分に変換（データベースは分単位の整数）
duration: Math.round((item.duration || 0) * 60),
```

---

## 🔍 フロントエンドでの表示

### プラン詳細画面

**ファイル**: `src/app/dashboard/plans/[id]/page.tsx`

```typescript
// プラン全体の表示（すでに分単位対応済み）
{Math.floor((plan.duration || 0) / 60)}時間
{(plan.duration || 0) % 60 > 0 && `${(plan.duration || 0) % 60}分`}

// アイテムの表示（すでに分単位対応済み）
<span>{item.duration}分</span>
```

**結論**: フロントエンドは最初から分単位を期待していた ✅

---

## 🧪 検証

### テストケース

#### 入力データ（AIレスポンス）

```json
{
  "plans": [
    {
      "title": "横浜デート",
      "duration": 4, // 4時間
      "items": [
        {
          "name": "プラネタリウム",
          "duration": 1.5 // 1.5時間
        },
        {
          "name": "赤レンガ倉庫",
          "duration": 1.0 // 1時間
        }
      ]
    }
  ]
}
```

#### 期待される保存値

```sql
-- date_plans テーブル
duration = 240  -- 4 × 60 = 240分

-- plan_items テーブル
duration = 90   -- 1.5 × 60 = 90分
duration = 60   -- 1.0 × 60 = 60分
```

#### 期待される表示

- プラン全体: **4時間**
- アイテム1: **90分**
- アイテム2: **60分**

---

## 💡 なぜこの設計なのか

### データベースが分単位の理由

1. **精度**: 時間単位より細かい制御が可能
2. **計算**: 整数演算で扱いやすい
3. **標準**: 多くのシステムが分単位を採用

### AIが時間単位を出力する理由

1. **自然**: 人間の感覚に近い（1.5時間など）
2. **柔軟**: 小数で表現できる
3. **簡潔**: プロンプトが短くなる

### 変換を行う理由

**ベストプラクティス**: AIの自然な出力とDBの効率的な保存を両立

---

## 🎉 修正の効果

### Before（修正前）

```
❌ エラー: invalid input syntax for type integer: "1.5"
❌ プラン保存失敗
❌ ユーザーに空のレスポンス
```

### After（修正後）

```
✅ duration正常変換: 1.5時間 → 90分
✅ データベース保存成功
✅ プラン正常表示
```

---

## 📖 関連ドキュメント

- **データベーススキーマ**: `supabase/migrations/create_date_plans.sql`
- **API実装**: `src/app/api/plans/generate/route.ts`
- **フロントエンド表示**: `src/app/dashboard/plans/[id]/page.tsx`

---

## ✨ まとめ

### 問題の本質

**型と単位の二重不一致**:

1. 型不一致: FLOAT（小数） vs INTEGER（整数）
2. 単位不一致: 時間 vs 分

### 解決方法

**バックエンドで変換**:

```typescript
duration: Math.round(value * 60);
```

### 教訓

1. ✅ AIの出力形式とDBスキーマの整合性を確認
2. ✅ 単位変換はバックエンドで一元管理
3. ✅ フロントエンドは表示に専念
4. ✅ エラーログから根本原因を特定

---

**修正日**: 2025年10月10日  
**修正ファイル**: `src/app/api/plans/generate/route.ts`  
**ステータス**: 修正完了 ✅
