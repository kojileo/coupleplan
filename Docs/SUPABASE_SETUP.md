# Supabase + Prisma セットアップ手順書

CouplePlanアプリケーション用のSupabase + Prismaセットアップ手順書です。

## 📋 目次

1. [前提条件](#前提条件)
2. [Supabaseプロジェクトの作成](#supabaseプロジェクトの作成)
3. [Prismaの設定](#prismaの設定)
4. [データベーススキーマの設定](#データベーススキーマの設定)
5. [認証設定](#認証設定)
6. [環境変数の設定](#環境変数の設定)
7. [RLS（Row Level Security）の設定](#rlsrow-level-securityの設定)
8. [ストレージの設定](#ストレージの設定)
9. [リアルタイム機能の設定](#リアルタイム機能の設定)
10. [Prismaクエリの使用例](#prismaクエリの使用例)
11. [テストと検証](#テストと検証)
12. [トラブルシューティング](#トラブルシューティング)

## 前提条件

- Node.js 18以上
- npm または yarn
- Git
- Supabaseアカウント（[supabase.com](https://supabase.com)で作成）
- Prisma CLI（プロジェクトに含まれています）

## 1. Supabaseプロジェクトの作成

### 1.1 プロジェクト作成

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. 「New Project」をクリック
3. 以下の情報を入力：
   - **Organization**: 既存の組織を選択または新規作成
   - **Name**: `coupleplan`
   - **Database Password**: 強力なパスワードを生成（保存しておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
   - **Pricing Plan**: `Free` または `Pro` を選択

4. 「Create new project」をクリック
5. プロジェクトの作成完了まで待機（約2-3分）

### 1.2 プロジェクト情報の確認

プロジェクト作成後、以下を確認・保存：

- **Project URL**: `https://your-project-id.supabase.co`
- **API Key (anon)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **API Key (service_role)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Database Password**: 作成時に設定したパスワード

## 3. Prismaの設定

### 3.1 Prismaの初期化

プロジェクトには既にPrismaが設定されていますが、新規プロジェクトの場合は以下のコマンドで初期化します：

```bash
# Prismaの初期化（既に設定済みの場合はスキップ）
npx prisma init

# 依存関係のインストール
npm install @prisma/client prisma
```

### 3.2 環境変数の設定

`.env`ファイルにSupabaseの接続情報を設定：

```env
# Supabase接続情報
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. データベーススキーマの設定

### 4.1 Prismaスキーマの確認

`prisma/schema.prisma`ファイルが既に設定されています。このファイルには以下のモデルが定義されています：

- **Profile**: ユーザープロフィール
- **Couple**: カップル関係
- **DatePlan**: デートプラン
- **PlanSpot**: プランスポット
- **CollaborationSession**: 共同編集セッション
- **EditHistory**: 編集履歴
- **RelationshipPlan**: 関係修復プラン
- **Memory**: 思い出（Date Canvas用）
- **Subscription**: サブスクリプション
- **PaymentHistory**: 支払い履歴

### 4.2 データベースマイグレーション

Prismaを使用してデータベースにスキーマを適用：

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースにスキーマを適用（開発環境）
npx prisma db push

# または、本番環境用のマイグレーションファイルを作成
npx prisma migrate dev --name init
```

### 4.3 データベースの確認

```bash
# データベースの状態を確認
npx prisma db pull

# Prisma Studioでデータベースを可視化
npx prisma studio
```

### 4.4 シードデータの投入

```bash
# シードデータの実行
npm run seed
```

## 5. 認証設定

### 5.1 認証プロバイダーの設定

1. Supabase Dashboard → Authentication → Providers
2. 以下のプロバイダーを有効化：
   - **Email**: デフォルトで有効
   - **Google**: 必要に応じて設定
   - **GitHub**: 必要に応じて設定

### 5.2 認証設定の調整

Supabase Dashboard → Authentication → URL Configuration で以下を設定：

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/dashboard`, `http://localhost:3000/auth/callback`

### 5.3 メールテンプレートの設定

1. Authentication → Email Templates
2. 以下のテンプレートをカスタマイズ：
   - **Confirm signup**
   - **Reset password**
   - **Magic Link**

## 6. 環境変数の設定

### 6.1 .env.local ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# データベース接続（Prisma用）
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"

# アプリケーション設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CouplePlan

# 認証設定
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/dashboard
```

### 6.2 環境変数の確認

```bash
# 環境変数が正しく設定されているか確認
npm run dev
```

## 7. RLS（Row Level Security）の設定

### 7.1 RLSポリシーの作成

```sql
-- プロフィールテーブルのRLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロフィールのみアクセス可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- カップルテーブルのRLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- カップルのメンバーのみアクセス可能
CREATE POLICY "Couple members can view couple" ON couples
  FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

CREATE POLICY "Users can create couple" ON couples
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

-- デートプランテーブルのRLS
ALTER TABLE date_plans ENABLE ROW LEVEL SECURITY;

-- カップルメンバーのみプランにアクセス可能
CREATE POLICY "Couple members can view plans" ON date_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE id = date_plans.couple_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can create plans" ON date_plans
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM couples
      WHERE id = couple_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can update plans" ON date_plans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE id = date_plans.couple_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- プランスポットテーブルのRLS
ALTER TABLE plan_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can manage plan spots" ON plan_spots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM date_plans dp
      JOIN couples c ON dp.couple_id = c.id
      WHERE dp.id = plan_spots.plan_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- 共同編集セッションテーブルのRLS
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can manage collaboration" ON collaboration_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM date_plans dp
      JOIN couples c ON dp.couple_id = c.id
      WHERE dp.id = collaboration_sessions.plan_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- 編集履歴テーブルのRLS
ALTER TABLE edit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view edit history" ON edit_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM date_plans dp
      JOIN couples c ON dp.couple_id = c.id
      WHERE dp.id = edit_history.plan_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- 関係修復プランテーブルのRLS
ALTER TABLE relationship_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can manage relationship plans" ON relationship_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE id = relationship_plans.couple_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- 思い出テーブルのRLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can manage memories" ON memories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE id = memories.couple_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- サブスクリプションテーブルのRLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE id = subscriptions.couple_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- 支払い履歴テーブルのRLS
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view payment history" ON payment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN couples c ON s.couple_id = c.id
      WHERE s.id = payment_history.subscription_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );
```

## 8. ストレージの設定

### 8.1 ストレージバケットの作成

1. Supabase Dashboard → Storage
2. 以下のバケットを作成：

```sql
-- アバター画像用バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- プラン画像用バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('plan-images', 'plan-images', true);

-- 思い出画像用バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true);
```

### 8.2 ストレージポリシーの設定

```sql
-- アバター画像のポリシー
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- プラン画像のポリシー
CREATE POLICY "Couple members can upload plan images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'plan-images' AND
    EXISTS (
      SELECT 1 FROM date_plans dp
      JOIN couples c ON dp.couple_id = c.id
      WHERE dp.id::text = (storage.foldername(name))[1]
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Plan images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'plan-images');

-- 思い出画像のポリシー
CREATE POLICY "Couple members can upload memory images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories' AND
    EXISTS (
      SELECT 1 FROM memories m
      JOIN couples c ON m.couple_id = c.id
      WHERE m.id::text = (storage.foldername(name))[1]
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Memory images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'memories');
```

## 9. リアルタイム機能の設定

### 9.1 リアルタイムの有効化

```sql
-- 共同編集セッションのリアルタイム
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_sessions;

-- 編集履歴のリアルタイム
ALTER PUBLICATION supabase_realtime ADD TABLE edit_history;

-- デートプランのリアルタイム
ALTER PUBLICATION supabase_realtime ADD TABLE date_plans;

-- 思い出のリアルタイム
ALTER PUBLICATION supabase_realtime ADD TABLE memories;
```

## 10. Prismaクエリの使用例

### 10.1 基本的なCRUD操作

```typescript
// lib/prisma-queries.ts
import { prisma } from './db';

// プロフィールの作成
export async function createProfile(data: { id: string; name: string; email: string }) {
  return await prisma.profile.create({
    data: {
      id: data.id,
      name: data.name,
      email: data.email,
    },
  });
}

// カップルの作成
export async function createCouple(user1Id: string, user2Id: string) {
  return await prisma.couple.create({
    data: {
      user1Id,
      user2Id,
      status: 'pending',
    },
  });
}

// デートプランの作成
export async function createDatePlan(data: {
  title: string;
  description?: string;
  createdBy: string;
  coupleId: string;
  category?: string;
}) {
  return await prisma.datePlan.create({
    data: {
      title: data.title,
      description: data.description,
      createdBy: data.createdBy,
      coupleId: data.coupleId,
      category: data.category,
    },
    include: {
      creator: true,
      couple: true,
      planSpots: true,
    },
  });
}

// プランスポットの追加
export async function addPlanSpot(data: {
  planId: string;
  name: string;
  type: string;
  timeSlot?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  cost?: number;
}) {
  return await prisma.planSpot.create({
    data: {
      planId: data.planId,
      name: data.name,
      type: data.type,
      timeSlot: data.timeSlot,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      cost: data.cost,
    },
  });
}
```

### 10.2 複雑なクエリ

```typescript
// カップルのプラン一覧を取得
export async function getCouplePlans(coupleId: string) {
  return await prisma.datePlan.findMany({
    where: {
      coupleId,
    },
    include: {
      creator: true,
      planSpots: {
        orderBy: {
          orderIndex: 'asc',
        },
      },
      collaborationSessions: {
        where: {
          isActive: true,
        },
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// 思い出の検索
export async function searchMemories(coupleId: string, searchTerm: string) {
  return await prisma.memory.findMany({
    where: {
      coupleId,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } },
      ],
    },
    include: {
      creator: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
}

// 共同編集セッションの管理
export async function startCollaborationSession(planId: string, userId: string) {
  // 既存のセッションを終了
  await prisma.collaborationSession.updateMany({
    where: {
      planId,
      userId,
    },
    data: {
      isActive: false,
    },
  });

  // 新しいセッションを開始
  return await prisma.collaborationSession.create({
    data: {
      planId,
      userId,
      isActive: true,
    },
  });
}
```

### 10.3 トランザクション処理

```typescript
// プランとスポットを同時に作成
export async function createPlanWithSpots(data: {
  plan: {
    title: string;
    description?: string;
    createdBy: string;
    coupleId: string;
  };
  spots: Array<{
    name: string;
    type: string;
    timeSlot?: string;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    cost?: number;
  }>;
}) {
  return await prisma.$transaction(async (tx) => {
    // プランを作成
    const plan = await tx.datePlan.create({
      data: data.plan,
    });

    // スポットを作成
    const spots = await Promise.all(
      data.spots.map((spot, index) =>
        tx.planSpot.create({
          data: {
            ...spot,
            planId: plan.id,
            orderIndex: index,
          },
        })
      )
    );

    return {
      plan,
      spots,
    };
  });
}
```

## 11. テストと検証

### 11.1 Prisma接続テスト

```typescript
// lib/prisma-test.ts
import { prisma } from './db';

export async function testPrismaConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma接続成功');
    return true;
  } catch (error) {
    console.error('❌ Prisma接続失敗:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// データベースの状態確認
export async function checkDatabaseStatus() {
  try {
    const profileCount = await prisma.profile.count();
    const coupleCount = await prisma.couple.count();
    const planCount = await prisma.datePlan.count();

    console.log('📊 データベース統計:');
    console.log(`- プロフィール: ${profileCount}`);
    console.log(`- カップル: ${coupleCount}`);
    console.log(`- プラン: ${planCount}`);

    return true;
  } catch (error) {
    console.error('❌ データベース状態確認失敗:', error);
    return false;
  }
}
```

### 11.2 認証テスト

```typescript
// 認証テスト
export async function testAuth() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    console.log('✅ 認証テスト成功:', user?.email);
    return true;
  } catch (error) {
    console.error('❌ 認証テスト失敗:', error);
    return false;
  }
}
```

### 11.3 RLSテスト

```typescript
// RLSテスト
export async function testRLS() {
  try {
    // 認証が必要なテーブルへのアクセステスト
    const { data, error } = await supabase.from('date_plans').select('*').limit(1);

    if (error && error.code === 'PGRST301') {
      console.log('✅ RLS正常動作（認証が必要）');
      return true;
    }

    console.log('⚠️ RLS設定を確認してください');
    return false;
  } catch (error) {
    console.error('❌ RLSテスト失敗:', error);
    return false;
  }
}
```

## 12. 本番環境の設定

### 12.1 本番用環境変数

```env
# 本番環境用
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
DATABASE_URL="postgresql://postgres:[PROD-PASSWORD]@db.[PROD-PROJECT-REF].supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 12.2 本番用認証設定

1. Supabase Dashboard → Authentication → URL Configuration
2. 以下のURLを設定：
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: `https://your-domain.com/dashboard`

### 12.3 本番用Prisma設定

```bash
# 本番環境用マイグレーション
npx prisma migrate deploy

# 本番環境用クライアント生成
npx prisma generate
```

### 12.4 本番用ストレージ設定

```sql
-- 本番用ストレージポリシーの調整
-- 必要に応じてより厳格なポリシーを設定
```

## 13. トラブルシューティング

### 13.1 よくある問題

**問題**: Prisma接続エラー

```bash
# 解決策
1. DATABASE_URLが正しく設定されているか確認
2. Supabaseプロジェクトがアクティブか確認
3. データベースパスワードが正しいか確認
4. npx prisma db push でスキーマを同期
```

**問題**: 認証が動作しない

```bash
# 解決策
1. 環境変数が正しく設定されているか確認
2. Supabase Dashboard の認証設定を確認
3. リダイレクトURLが正しく設定されているか確認
```

**問題**: RLSエラーが発生する

```bash
# 解決策
1. RLSポリシーが正しく設定されているか確認
2. ユーザーが認証されているか確認
3. ポリシーの条件を確認
```

**問題**: ストレージにアクセスできない

```bash
# 解決策
1. ストレージバケットが作成されているか確認
2. ストレージポリシーが設定されているか確認
3. ファイルパスが正しいか確認
```

### 13.2 ログの確認

```typescript
// Prismaデバッグ用ログ設定
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Supabaseデバッグ用ログ設定
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    debug: true,
  },
});
```

### 13.3 パフォーマンス最適化

```typescript
// Prismaクエリの最適化
export async function getOptimizedPlans(coupleId: string) {
  return await prisma.datePlan.findMany({
    where: {
      coupleId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      planSpots: {
        select: {
          id: true,
          name: true,
          type: true,
          timeSlot: true,
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // ページネーション
  });
}
```

## 14. セキュリティチェックリスト

- [ ] RLSが全てのテーブルで有効化されている
- [ ] 適切なポリシーが設定されている
- [ ] サービスロールキーが適切に保護されている
- [ ] ストレージポリシーが設定されている
- [ ] 認証設定が本番環境用に調整されている
- [ ] 環境変数が適切に設定されている
- [ ] Prismaクライアントが適切に設定されている
- [ ] データベース接続が暗号化されている

## 15. 次のステップ

1. **Prismaクライアント統合**: アプリケーションでのPrisma使用
2. **認証フロー**: ログイン・サインアップ機能の実装
3. **データ操作**: Prismaを使用したCRUD操作の実装
4. **リアルタイム機能**: 共同編集機能の実装
5. **ファイルアップロード**: 画像アップロード機能の実装
6. **パフォーマンス最適化**: クエリの最適化とキャッシュ戦略

---

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. [Supabase Documentation](https://supabase.com/docs)
2. [Supabase Discord Community](https://discord.supabase.com)
3. [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**作成日**: 2024年12月
**バージョン**: 1.0.0
**対象**: CouplePlan アプリケーション
