# マネタイズ機能実装ガイド

**作成日**: 2025年10月11日  
**対象**: AIプラン生成制限機能（Phase 1.1 - Stripe連携なし）  
**実装期間**: 2-3週間  
**前提条件**: 認証システム、AIプラン生成機能が実装済み

---

## 📋 目次

1. [概要](#概要)
2. [実装の全体像](#実装の全体像)
3. [Step 1: データベース実装](#step-1-データベース実装)
4. [Step 2: バックエンドAPI実装](#step-2-バックエンドapi実装)
5. [Step 3: フロントエンド実装](#step-3-フロントエンド実装)
6. [Step 4: テストと調整](#step-4-テストと調整)
7. [デプロイ手順](#デプロイ手順)
8. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### 目的

無料プラン（Free）のユーザーに対して、AIプラン生成の利用回数制限を設けることで：

- API費用（Gemini API）の管理
- 将来的なPremiumプランへの誘導
- サービスの持続可能性の確保

### プラン設定

| プラン      | 日次制限 | 月次制限 | プラン保存数 | 価格                |
| ----------- | -------- | -------- | ------------ | ------------------- |
| **Free**    | 3回/日   | 10回/月  | 5件          | ¥0                  |
| **Premium** | 無制限   | 無制限   | 無制限       | ¥480/月（将来実装） |

### 制限ロジック

- **日次制限優先**: 1日3回まで
- **月次制限**: 月10回まで（日次を使い切っても翌日また3回）
- **リセットタイミング**:
  - 日次: 毎日0時（JST）
  - 月次: 毎月1日0時（JST）

---

## 実装の全体像

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                    フロントエンド                        │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ UsageLimitDisplay│  │ LimitReachedModal│            │
│  │    (残り回数表示)  │  │   (制限到達時)    │            │
│  └────────┬─────────┘  └────────┬─────────┘            │
│           │                     │                       │
│           └─────────┬───────────┘                       │
│                     ↓                                   │
└─────────────────────┼───────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────┐
│              バックエンドAPI                             │
│  ┌──────────────────┴─────────────────┐                │
│  │  /api/subscription/check-limit     │ ← 制限チェック  │
│  │  /api/subscription/usage           │ ← 使用履歴記録  │
│  │  /api/subscription/current         │ ← プラン情報取得│
│  └──────────────────┬─────────────────┘                │
└─────────────────────┼───────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────┐
│                 データベース                             │
│  ┌────────────────────────────────────────┐            │
│  │ subscription_plans                     │            │
│  │  - free: 3回/日, 10回/月               │            │
│  │  - premium: 無制限                     │            │
│  └──────────────┬─────────────────────────┘            │
│  ┌──────────────┴─────────────────────────┐            │
│  │ user_subscriptions                     │            │
│  │  - user_id → plan_id                   │            │
│  └──────────────┬─────────────────────────┘            │
│  ┌──────────────┴─────────────────────────┐            │
│  │ plan_generation_usage                  │            │
│  │  - user_id, generated_at               │            │
│  │  - generation_date (JST)               │            │
│  │  - generation_month (JST)              │            │
│  └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### 実装の流れ

```
Week 1: データベース実装 (2-3日)
  ↓
Week 2: API実装 (3-4日)
  ↓
Week 3: フロントエンド実装 (4-5日)
  ↓
Week 4: テストと調整 (2-3日)
```

---

## Step 1: データベース実装

### 所要時間: 2-3日

### 1.1 マイグレーション実行

```bash
# マイグレーションファイルを確認
cat supabase/migrations/create_subscription_system.sql

# Supabaseダッシュボードで実行
# または
psql -h [your-supabase-host] -U postgres -d postgres -f supabase/migrations/create_subscription_system.sql
```

### 1.2 作成されるテーブル

#### `subscription_plans` - プラン定義

```sql
- id (UUID)
- name (TEXT): 'free', 'premium'
- display_name (TEXT): 'Free', 'Premium'
- price_monthly (INTEGER): 0, 480
- daily_plan_limit (INTEGER): 3, NULL
- monthly_plan_limit (INTEGER): 10, NULL
- max_saved_plans (INTEGER): 5, NULL
- features (JSONB)
- is_active (BOOLEAN)
- created_at, updated_at
```

#### `user_subscriptions` - ユーザーのサブスク状態

```sql
- id (UUID)
- user_id (UUID) → auth.users
- plan_id (UUID) → subscription_plans
- status (TEXT): 'active', 'canceled', 'expired'
- stripe_customer_id (TEXT) -- 将来用
- stripe_subscription_id (TEXT) -- 将来用
- current_period_start, current_period_end
- cancel_at_period_end (BOOLEAN)
- created_at, updated_at
```

#### `plan_generation_usage` - 使用履歴

```sql
- id (UUID)
- user_id (UUID) → auth.users
- plan_id (UUID) → date_plans
- generated_at (TIMESTAMPTZ)
- generation_date (DATE) -- JST基準、自動生成
- generation_month (DATE) -- JST基準、自動生成
```

### 1.3 動作確認

```sql
-- プランが正しく作成されているか確認
SELECT * FROM subscription_plans;
-- 期待値: free と premium の2レコード

-- 既存ユーザーにFreeプランが割り当てられているか確認
SELECT
  u.email,
  sp.name AS plan_name,
  us.status
FROM auth.users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id;

-- トリガーが正しく動作するか確認
-- 新規ユーザーを作成して、自動的にFreeプランが割り当てられることを確認
```

---

## Step 2: バックエンドAPI実装

### 所要時間: 3-4日

### 2.1 ディレクトリ構成

```
src/app/api/subscription/
├── check-limit/
│   └── route.ts      # 制限チェックAPI
├── usage/
│   └── route.ts      # 使用履歴記録API
└── current/
    └── route.ts      # 現在のプラン取得API
```

### 2.2 実装ファイル

#### `/api/subscription/check-limit/route.ts`

**機能**: 現在のユーザーがAIプラン生成可能かをチェック

**レスポンス例**:

```json
{
  "canGenerate": true,
  "remaining": {
    "daily": 2,
    "monthly": 8
  },
  "used": {
    "daily": 1,
    "monthly": 2
  },
  "limits": {
    "daily": 3,
    "monthly": 10
  },
  "plan": "free"
}
```

実装内容は`Docs/開発計画.md`の「Step 2: バックエンドAPI実装」を参照。

#### `/api/subscription/usage/route.ts`

**機能**: AIプラン生成後に使用履歴を記録

**リクエスト**:

```json
{
  "planId": "uuid-of-generated-plan" // optional
}
```

**レスポンス例**:

```json
{
  "success": true,
  "canGenerate": true,
  "remaining": {
    "daily": 1,
    "monthly": 7
  }
}
```

#### `/api/subscription/current/route.ts`

**機能**: 現在のサブスクリプション情報を取得

**レスポンス例**:

```json
{
  "subscription": {
    "id": "uuid",
    "status": "active",
    "created_at": "2025-10-11T00:00:00Z"
  },
  "plan": {
    "name": "free",
    "display_name": "Free",
    "price_monthly": 0,
    "daily_plan_limit": 3,
    "monthly_plan_limit": 10,
    "features": {...}
  }
}
```

### 2.3 動作確認

```bash
# 制限チェック
curl -X GET http://localhost:3000/api/subscription/check-limit \
  -H "Cookie: your-session-cookie"

# 使用履歴記録
curl -X POST http://localhost:3000/api/subscription/usage \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"planId": "test-plan-id"}'

# プラン情報取得
curl -X GET http://localhost:3000/api/subscription/current \
  -H "Cookie: your-session-cookie"
```

---

## Step 3: フロントエンド実装

### 所要時間: 4-5日

### 3.1 ディレクトリ構成

```
src/components/subscription/
├── UsageLimitDisplay.tsx     # 残り回数表示コンポーネント
├── LimitReachedModal.tsx     # 制限到達モーダル
└── SubscriptionBadge.tsx     # プランバッジ（オプション）
```

### 3.2 コンポーネント実装

#### `UsageLimitDisplay.tsx`

**配置場所**: AIプラン作成画面（`/dashboard/plans/create`）

**表示内容**:

- 今日の残り回数: X / 3回
- 今月の残り回数: Y / 10回
- Premium案内リンク

**実装のポイント**:

- useEffectで初回レンダリング時に`/api/subscription/check-limit`を呼び出し
- Premiumユーザーには表示しない（plan === 'premium'の場合）
- ローディング状態の表示

#### `LimitReachedModal.tsx`

**配置場所**: AIプラン作成画面（制限到達時に表示）

**表示内容**:

- 日次制限到達時: "明日また3回作成できます"
- 月次制限到達時: "来月にリセットされます"
- Premium案内（詳細ボタン → 将来的に登録ページへ）

**実装のポイント**:

- isOpen, onClose, limitType, remaining をpropsで受け取る
- 背景クリックで閉じる
- ESCキーで閉じる

### 3.3 AIプラン生成フローへの統合

**修正ファイル**: `src/app/dashboard/plans/create/page.tsx`

**修正箇所**: プラン生成ボタンのonClick処理

```typescript
const handleGeneratePlan = async () => {
  // 1. 制限チェック
  const limitResponse = await fetch('/api/subscription/check-limit');
  const limitData = await limitResponse.json();

  if (!limitData.canGenerate) {
    // 制限到達モーダルを表示
    const limitType = limitData.remaining.daily === 0 ? 'daily' : 'monthly';
    setShowLimitModal(true);
    setLimitType(limitType);
    setRemaining(limitData.remaining);
    return;
  }

  // 2. プラン生成処理（既存のコード）
  setGenerating(true);
  try {
    const response = await fetch('/api/plans/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    // 3. 使用履歴を記録 ← NEW
    await fetch('/api/subscription/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: data.plan.id }),
    });

    // 4. 生成完了処理
    router.push(`/dashboard/plans/${data.plan.id}`);
  } catch (error) {
    console.error('Error generating plan:', error);
  } finally {
    setGenerating(false);
  }
};
```

### 3.4 ダッシュボードへの統合

**修正ファイル**: `src/app/dashboard/page.tsx`

**追加内容**: 使用状況の表示

```tsx
import { UsageLimitDisplay } from '@/components/subscription/UsageLimitDisplay';

export default function Dashboard() {
  return (
    <div>
      {/* 既存のコンテンツ */}

      {/* 使用状況表示 */}
      <UsageLimitDisplay />

      {/* 既存のコンテンツ */}
    </div>
  );
}
```

---

## Step 4: テストと調整

### 所要時間: 2-3日

### 4.1 テストケース

#### 基本機能テスト

- [ ] 新規ユーザー登録時にFreeプランが自動割り当てされる
- [ ] 日次制限（3回）が正しく機能する
  - 1回目、2回目、3回目の生成が成功
  - 4回目の生成時に制限モーダルが表示される
- [ ] 月次制限（10回）が正しく機能する
  - 日をまたいで合計10回まで生成可能
  - 11回目で制限モーダルが表示される
- [ ] 残り回数の表示が正しい
  - リアルタイムで更新される
  - リロード後も正しい値が表示される

#### リセット機能テスト

- [ ] 日付変更時（0時JST）に日次カウントがリセットされる
  - 23:59に3回使い切る
  - 0:00になったら再度3回使える
- [ ] 月初（1日0時JST）に月次カウントがリセットされる
  - 月末に10回使い切る
  - 月初になったら再度10回使える

#### エッジケーステスト

- [ ] タイムゾーン処理（JST基準）が正しい
  - サーバーがUTCでも正しくJSTで判定される
- [ ] 同時リクエスト処理
  - 2つのタブで同時に生成しても正しくカウントされる
  - 競合状態にならない
- [ ] ネットワークエラー時のリトライ
  - APIエラー時に適切なエラーメッセージが表示される
  - リトライ可能
- [ ] データベース接続エラー処理
  - Graceful degradation
  - ユーザーに適切なフィードバック

#### パフォーマンステスト

- [ ] 大量ユーザー想定のテスト
  - 1000ユーザー同時アクセス
  - レスポンスタイム < 500ms
- [ ] データベースインデックスの効果
  - generation_date, generation_monthのインデックスが効いている
  - EXPLAIN ANALYZEで確認

### 4.2 テスト手順

```bash
# 1. ローカル環境でテスト
npm run dev

# 2. 新規ユーザーを作成
# → Freeプランが自動割り当てされることを確認

# 3. AIプラン生成を3回実行
# → 残り回数が正しく減ることを確認

# 4. 4回目の生成を試みる
# → 制限モーダルが表示されることを確認

# 5. データベースで確認
psql -c "SELECT * FROM plan_generation_usage WHERE user_id = 'your-user-id'"

# 6. 時間をシミュレート（開発環境）
# → generation_dateを手動で変更して日付リセットをテスト
```

### 4.3 バグ修正とチューニング

- [ ] 発見されたバグの修正
- [ ] UXの改善
- [ ] パフォーマンスチューニング
- [ ] エラーメッセージの改善

---

## デプロイ手順

### 5.1 Supabase本番環境

```bash
# 1. マイグレーションファイルを本番環境で実行
# Supabaseダッシュボード → SQL Editor → New query
# create_subscription_system.sql の内容をペースト → Run

# 2. RLSポリシーの確認
# Supabaseダッシュボード → Authentication → Policies
# subscription_plans, user_subscriptions, plan_generation_usage のポリシーを確認

# 3. トリガーの動作確認
# テストユーザーを作成して、Freeプランが自動割り当てされることを確認
```

### 5.2 Vercel本番環境

```bash
# 1. 環境変数の確認
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# GEMINI_API_KEY

# 2. デプロイ
vercel --prod

# 3. 動作確認
# 本番環境でプラン生成を実行
# 制限機能が正しく動作することを確認
```

### 5.3 監視設定

```bash
# 1. Supabaseダッシュボードで使用状況を監視
# Database → Logs
# plan_generation_usage テーブルの挿入ログを確認

# 2. Vercelで APIエラーを監視
# Vercel Dashboard → Logs
# /api/subscription/* のエラーログを確認

# 3. ユーザーフィードバックの収集
# お問い合わせフォーム、アプリ内フィードバック
```

---

## トラブルシューティング

### 問題1: 新規ユーザーにFreeプランが割り当てられない

**原因**: トリガーが正しく動作していない

**解決策**:

```sql
-- トリガーの確認
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- トリガーの再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();
```

### 問題2: 日次/月次のリセットが正しく動作しない

**原因**: タイムゾーン処理が正しくない

**解決策**:

```sql
-- generation_date, generation_monthの値を確認
SELECT
  user_id,
  generated_at,
  generation_date,
  generation_month
FROM plan_generation_usage
ORDER BY generated_at DESC
LIMIT 10;

-- JSTで正しく計算されているか確認
SELECT
  now() AS utc_now,
  now() AT TIME ZONE 'Asia/Tokyo' AS jst_now,
  DATE(now() AT TIME ZONE 'Asia/Tokyo') AS jst_date;
```

### 問題3: 制限が正しくカウントされない

**原因**: `/api/subscription/usage`が呼ばれていない

**解決策**:

- プラン生成フロー（`handleGeneratePlan`）を確認
- 使用履歴記録の呼び出しが正しく実装されているか確認
- ネットワークタブでAPIリクエストを確認

### 問題4: パフォーマンスが悪い

**原因**: インデックスが効いていない

**解決策**:

```sql
-- インデックスの確認
SELECT * FROM pg_indexes
WHERE tablename = 'plan_generation_usage';

-- 実行計画の確認
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM plan_generation_usage
WHERE user_id = 'test-user-id'
AND generation_date = CURRENT_DATE;

-- インデックスの再作成（必要に応じて）
REINDEX TABLE plan_generation_usage;
```

---

## 参考資料

- **ビジネス要件定義書**: `Docs/design/ビジネス要件定義書.md` - セクション6.7
- **開発計画書**: `Docs/開発計画.md` - マネタイズ機能実装計画
- **UC-007ユースケース**: `Docs/usecase/UC-007_段階的マネタイズ制御.md`
- **マイグレーションファイル**: `supabase/migrations/create_subscription_system.sql`

---

## 次のステップ（Phase 1.2以降）

Phase 1.1完了後、6-12ヶ月後に実装予定:

- [ ] Stripe連携実装
- [ ] Premium会員登録機能
- [ ] サブスクリプション管理画面
- [ ] 決済履歴表示
- [ ] プラン変更・キャンセル機能
- [ ] 中間プラン（Lite ¥300/月）の追加検討

---

**最終更新**: 2025年10月11日  
**バージョン**: 1.0  
**作成者**: 開発チーム
