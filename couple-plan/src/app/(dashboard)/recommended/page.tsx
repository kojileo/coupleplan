'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { PlanCard } from '@/components/features/plans/PlanCard';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

const CATEGORIES = [
  { value: '', label: 'すべて' },
  { value: '定番デート', label: '定番デート' },
  { value: '観光', label: '観光' },
  { value: 'グルメ', label: 'グルメ' },
  { value: 'アクティビティ', label: 'アクティビティ' },
  { value: '季節限定', label: '季節限定' },
  { value: '記念日', label: '記念日' },
];

export default function RecommendedPlansPage(): ReactElement {
  const { session } = useAuth();
  const [recommendedPlans, setRecommendedPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchPlans = async (): Promise<void> => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.plans.listPublic(session.access_token);
        if ('error' in response) throw new Error(response.error);
        // おすすめプランのみをフィルタリング
        const recommended = response.data?.filter((plan) => plan.isRecommended) || [];
        setRecommendedPlans(recommended);
      } catch (error) {
        console.error('おすすめプランの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchPlans();
  }, [session]);

  const filteredPlans = selectedCategory
    ? recommendedPlans.filter((plan) => plan.category === selectedCategory)
    : recommendedPlans;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-rose-950">おすすめプラン一覧</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="category" className="text-sm font-medium text-rose-950">
            カテゴリ:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-950"
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-rose-700">
            {selectedCategory
              ? '選択されたカテゴリのおすすめプランがありません'
              : 'おすすめプランがまだありません'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} isPublic={true} />
          ))}
        </div>
      )}
    </div>
  );
}
