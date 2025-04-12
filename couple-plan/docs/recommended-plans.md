# おすすめプラン機能

## 概要
おすすめプラン機能は、カップルプランが厳選したデートプランを提供する機能です。
ユーザーは、これらのプランを参考にして自分のデートプランを作成することができます。

## 機能
1. おすすめプランの閲覧
   - カテゴリ別に表示
   - 画像付きのカード形式で表示
   - 予算、地域などの詳細情報を表示

2. プランの利用
   - 「このプランを使う」ボタンで簡単にプランを作成
   - 必要に応じて内容をカスタマイズ可能

## カテゴリ
- 定番デート：定番のデートスポットを巡るプラン
- 観光：観光スポットを巡るプラン
- グルメ：食事を中心としたプラン
- アクティビティ：体験型のプラン
- 季節限定：季節に応じたプラン
- 記念日：記念日向けの特別なプラン

## データ構造
```typescript
type RecommendedPlan = {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  region?: string | null;
  budget: number;
  imageUrl?: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};
```

## API
1. プラン一覧の取得
   ```typescript
   GET /api/recommended-plans
   ```

2. プランの詳細取得
   ```typescript
   GET /api/recommended-plans/:id
   ```

3. プランの作成（管理者のみ）
   ```typescript
   POST /api/recommended-plans
   ```

4. プランの更新（管理者のみ）
   ```typescript
   PUT /api/recommended-plans/:id
   ```

5. プランの削除（管理者のみ）
   ```typescript
   DELETE /api/recommended-plans/:id
   ```

## 管理者機能
- プランの作成、編集、削除は管理者のみが実行可能
- 管理者は`Profile`モデルの`isAdmin`フラグで識別

## 今後の拡張予定
1. フィルタリング機能
   - 地域による絞り込み
   - 予算による絞り込み
   - カテゴリによる絞り込み

2. 検索機能
   - キーワードによる検索
   - タグによる検索

3. お気に入り機能
   - おすすめプランのお気に入り登録
   - お気に入りプランの一覧表示

4. レコメンド機能
   - ユーザーの好みに基づいたプランの提案
   - 季節や時期に応じたプランの提案 