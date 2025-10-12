# カップル連携オプショナル化 実装ガイド

## 概要

このドキュメントは、カップル連携をオプショナルにし、個人ユーザーでもAIプラン作成ができるようにした実装についての詳細を記載しています。

## 実装日

2025年1月12日

## 背景と目的

### 変更前の問題点

- カップル連携が必須のため、個人ユーザーがAIプラン作成を利用できない
- 新規ユーザーがすぐにサービスの価値を体験できない
- カップル連携のハードルが高く、ユーザー獲得の障壁となっていた

### 変更後の改善点

- 個人ユーザーでもAIプラン作成が可能
- カップル連携による追加価値が明確化
- 段階的な体験設計（個人→カップル連携→Premium）

## 実装内容

### 1. データベーススキーマの変更

**マイグレーションファイル**: `supabase/migrations/20250112_make_couple_id_optional.sql`

#### 主な変更点

- `date_plans.couple_id`を`NOT NULL`から`NULLABLE`に変更
- RLSポリシーを個人プラン・カップルプランの両方に対応
- パフォーマンス最適化のためのインデックス追加

#### マイグレーションの適用方法

```bash
# Supabase CLIを使用する場合
supabase db push

# または、Supabase管理画面のSQL Editorで実行
# ファイルの内容をコピー&ペースト
```

#### RLSポリシーの詳細

1. **閲覧権限**: 自分が作成したプラン OR 自分のカップルのプラン
2. **作成権限**: 認証済みユーザーは誰でもプラン作成可能（個人/カップル両方）
3. **更新権限**: 自分が作成したプラン OR 自分のカップルのプラン
4. **削除権限**: 自分が作成したプラン OR 自分のカップルのプラン

### 2. 型定義の更新

**ファイル**: `src/types/date-plan.ts`

#### 主な変更

```typescript
// Before
interface DatePlan {
  couple_id: string;
  ...
}

// After
interface DatePlan {
  couple_id: string | null; // nullの場合は個人プラン
  ...
}

// Before
interface AIGenerationRequest {
  couple_id: string;
  ...
}

// After
interface AIGenerationRequest {
  couple_id?: string | null; // オプショナル
  ...
}
```

### 3. API実装の変更

#### プラン生成API (`src/app/api/plans/generate/route.ts`)

**変更点**:

- カップル情報の取得を`.single()`から`.maybeSingle()`に変更
- カップルがない場合もエラーとせず、処理を継続
- 個人プランとして保存（`couple_id: null`）
- デート履歴の取得ロジックを個人/カップルで分岐

**動作**:

```typescript
// カップル連携済み
couple_id: "uuid" → カップルプランとして保存

// 個人ユーザー
couple_id: null → 個人プランとして保存
```

#### プラン一覧取得API (`src/app/api/plans/route.ts`)

**変更点**:

- カップル連携済みの場合: 個人プラン OR カップルプラン の両方を取得
- 個人ユーザーの場合: 自分が作成した個人プランのみ取得

**クエリ例**:

```sql
-- カップル連携済み
WHERE couple_id = 'uuid' OR (couple_id IS NULL AND created_by = 'user_id')

-- 個人ユーザー
WHERE created_by = 'user_id' AND couple_id IS NULL
```

#### プラン詳細API (`src/app/api/plans/[id]/route.ts`)

**変更点**:

- アクセス権限チェックを個人/カップルで分岐
- 個人プランの場合: `created_by`でチェック
- カップルプランの場合: カップルメンバーかチェック

### 4. フロントエンド実装

#### ユーティリティ関数 (`src/lib/couple-utils.ts`)

新規作成されたヘルパー関数:

1. **`getCoupleStatus()`**: カップル連携状態を取得
2. **`isCouplePlan()`**: プランがカップルプランかどうかを判定
3. **`requiresCoupleLink()`**: 機能がカップル連携必須かどうかを判定
4. **`getCoupleInviteMessage()`**: コンテキストに応じたメッセージを取得
5. **`canConvertToCouplePlan()`**: 個人プランをカップルプランに変換できるかチェック

#### UIコンポーネント

##### 1. `CoupleInviteBanner` (`src/components/couple/CoupleInviteBanner.tsx`)

**用途**: カップル連携を促すバナー

**表示場所**:

- ダッシュボード
- プラン作成後の結果画面
- 機能ロック時

**特徴**:

- カップル連携済みの場合は非表示
- コンテキストに応じたメッセージ表示
- ローカルストレージで非表示状態を保存

##### 2. `CoupleStatusCard` (`src/components/couple/CoupleStatusCard.tsx`)

**用途**: カップル連携状態を表示

**表示内容**:

- カップル連携中: パートナー名を表示
- 個人利用中: カップル連携を促すボタン

#### ダッシュボード統合

**ファイル**: `src/app/dashboard/page.tsx`

追加されたセクション:

1. カップル連携状態カード
2. カップル招待バナー

**表示順序**:

```
1. 使用状況表示
2. カップル連携状態カード
3. カップル招待バナー（カップル未連携の場合のみ）
4. 主要機能カード
```

## ユーザー体験フロー

### 個人ユーザーの場合

1. **サインアップ**
   - アカウント作成
   - ダッシュボードに遷移

2. **AIプラン作成**
   - カップル連携なしでも即座にプラン作成可能
   - 個人プランとして保存される

3. **プラン作成後**
   - カップル招待バナーが表示される
   - 「後で」を選択して、個人利用を継続可能

4. **カップル連携（オプション）**
   - パートナー連携画面から招待コード生成
   - パートナーが参加すると、プランを共有可能に

### カップルユーザーの場合

1. **カップル連携**
   - どちらか一方が招待コード生成
   - もう一方が招待コードで参加

2. **AIプラン作成**
   - カップルプランとして保存
   - 過去のカップルのデート履歴を活用

3. **追加機能の解放**
   - 共同編集機能（今後実装）
   - カップル向けDate Canvas（今後実装）
   - AI仲裁機能（今後実装）

## カップル連携による追加価値

| 機能               | 個人利用  | カップル連携 |
| ------------------ | --------- | ------------ |
| AIプラン作成       | ✅        | ✅           |
| プラン保存         | ✅        | ✅           |
| プラン一覧         | ✅ (個人) | ✅ (共有)    |
| 共同編集           | ❌        | ✅           |
| リアルタイム同期   | ❌        | ✅           |
| 承認ワークフロー   | ❌        | ✅           |
| Date Canvas        | ❌        | ✅           |
| AI仲裁             | ❌        | ✅           |
| カップルデート履歴 | ❌        | ✅           |

## テスト項目

### 1. 個人ユーザーのプラン作成

- [ ] カップル未連携でサインアップ
- [ ] ダッシュボードが正常に表示される
- [ ] AIプラン作成画面にアクセスできる
- [ ] プラン生成が成功する（couple_id is null）
- [ ] プラン一覧に個人プランが表示される
- [ ] プラン詳細画面が表示される

### 2. カップルユーザーのプラン作成

- [ ] カップル連携済みでログイン
- [ ] プラン生成が成功する（couple_id is set）
- [ ] プラン一覧にカップルプランが表示される
- [ ] パートナーからもプランが閲覧できる

### 3. プラン一覧の表示

- [ ] 個人ユーザー: 自分の個人プランのみ表示
- [ ] カップルユーザー: 個人プラン + カップルプランが表示
- [ ] フィルタリングが正常に動作

### 4. アクセス権限

- [ ] 個人プラン: 作成者のみ閲覧・編集可能
- [ ] カップルプラン: カップルメンバーが閲覧・編集可能
- [ ] 他人のプランは閲覧不可

### 5. UI表示

- [ ] ダッシュボードにカップル連携状態カードが表示される
- [ ] 個人ユーザーにカップル招待バナーが表示される
- [ ] カップル連携済みユーザーにはバナーが表示されない
- [ ] プラン作成後にカップル招待バナーが表示される

## データベースクエリ例

### 個人プランの取得

```sql
SELECT * FROM date_plans
WHERE created_by = 'user_id'
  AND couple_id IS NULL;
```

### カップルプランの取得

```sql
SELECT * FROM date_plans
WHERE couple_id = 'couple_id';
```

### 両方の取得（カップル連携済みユーザー）

```sql
SELECT * FROM date_plans
WHERE couple_id = 'couple_id'
   OR (couple_id IS NULL AND created_by = 'user_id')
ORDER BY created_at DESC;
```

## 注意点

### 1. 既存データの扱い

- 既存のプランは全て`couple_id`が設定されているため、影響なし
- マイグレーション実行前に既存データのバックアップ推奨

### 2. パフォーマンス

- `couple_id`にインデックスが追加されているため、クエリパフォーマンスは良好
- `WHERE couple_id IS NULL`の条件にも部分インデックスを作成済み

### 3. セキュリティ

- RLSポリシーが適切に設定されているため、権限外のアクセスは防止される
- 個人プランとカップルプランは明確に分離される

## 今後の拡張予定

### 1. 個人プランのカップルプラン化

個人プランをカップルプランに変換する機能:

```typescript
// 実装例
async function convertToCouplePlan(planId: string, coupleId: string) {
  await supabase
    .from('date_plans')
    .update({ couple_id: coupleId })
    .eq('id', planId)
    .is('couple_id', null);
}
```

### 2. プラン共有機能

個人プランをパートナーと一時的に共有する機能:

```typescript
interface PlanShare {
  plan_id: string;
  shared_with: string; // user_id
  expires_at: Date;
}
```

### 3. テンプレート化

個人プランをテンプレートとして保存し、再利用可能にする機能。

## トラブルシューティング

### マイグレーション失敗時

```bash
# ロールバック
supabase db reset

# 再度マイグレーション
supabase db push
```

### RLSポリシーエラー

```sql
-- ポリシーの確認
SELECT * FROM pg_policies WHERE tablename = 'date_plans';

-- ポリシーの削除（必要に応じて）
DROP POLICY "policy_name" ON date_plans;
```

### プラン取得エラー

```typescript
// デバッグログ
const { data, error } = await supabase.from('date_plans').select('*');

console.log('Data:', data);
console.log('Error:', error);
```

## まとめ

この実装により、以下が達成されました:

1. ✅ 個人ユーザーでもAIプラン作成が可能に
2. ✅ カップル連携による追加価値が明確化
3. ✅ 段階的な体験設計の実現
4. ✅ データベース・API・フロントエンドの一貫した実装
5. ✅ セキュリティとパフォーマンスの維持

これにより、新規ユーザーの獲得ハードルが下がり、カップル連携による追加価値を訴求できるプロダクトになりました。
