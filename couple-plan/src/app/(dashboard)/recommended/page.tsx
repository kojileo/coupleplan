import { Metadata } from 'next';

import { RecommendedPlansList } from '@/components/recommended-plans/recommended-plans-list';
import { getRecommendedPlans } from '@/lib/api/recommended-plans';
import { RecommendedPlan } from '@/types/plan';

export const metadata: Metadata = {
  title: 'おすすめプラン',
  description: 'カップル向けのおすすめデートプラン',
};

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default async function RecommendedPlansPage(): Promise<React.ReactElement> {
  let plans: RecommendedPlan[] = [];
  try {
    plans = await getRecommendedPlans();
  } catch (error) {
    console.error('おすすめプランの取得に失敗しました:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">おすすめプラン</h1>
      <p className="text-gray-600 mb-8">
        カップルプランが厳選した、特別な思い出作りにぴったりのデートプランをご紹介します。
        気に入ったプランは「このプランを使う」ボタンから簡単に自分のプランとして保存できます。
      </p>

      <RecommendedPlansList plans={plans} />
    </div>
  );
}
