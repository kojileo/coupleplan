import Link from 'next/link';

import { RecommendedPlan } from '@/types/plan';

interface RecommendedPlansListProps {
  plans: RecommendedPlan[];
}

export function RecommendedPlansList({ plans }: RecommendedPlansListProps): React.ReactElement {
  // カテゴリごとにプランをグループ化
  const plansByCategory = plans.reduce((acc: Record<string, RecommendedPlan[]>, plan) => {
    if (!acc[plan.category]) {
      acc[plan.category] = [];
    }
    acc[plan.category].push(plan);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(plansByCategory).map(([category, categoryPlans]) => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-rose-800 mb-6">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-rose-900 mb-2">{plan.title}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.locations[0]?.name && (
                      <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded">
                        {plan.locations[0].name}
                      </span>
                    )}
                    {plan.region && (
                      <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded">
                        {plan.region}
                      </span>
                    )}
                    <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded">
                      ¥{plan.budget.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href={`/plans/new?template=${plan.id}`}
                    className="block w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    このプランを使う
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
