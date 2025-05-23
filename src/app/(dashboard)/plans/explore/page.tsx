'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { PlanCard } from '@/components/features/plans/PlanCard';
import { api } from '@/lib/api';
import type { ExtendedPlan } from '@/types/plan';

const REGIONS = [
  { value: '', label: 'すべて' },
  { value: 'tokyo', label: '東京' },
  { value: 'osaka', label: '大阪' },
  { value: 'kyoto', label: '京都' },
  { value: 'fukuoka', label: '福岡' },
  { value: 'sapporo', label: '札幌' },
  { value: 'nagoya', label: '名古屋' },
  { value: 'yokohama', label: '横浜' },
  { value: 'kobe', label: '神戸' },
  { value: 'other', label: 'その他' },
];

const CATEGORIES = [
  { value: '', label: 'すべて' },
  { value: '定番デート', label: '定番デート' },
  { value: '観光', label: '観光' },
  { value: 'グルメ', label: 'グルメ' },
  { value: 'アクティビティ', label: 'アクティビティ' },
  { value: '季節限定', label: '季節限定' },
  { value: '記念日', label: '記念日' },
];

export default function ExplorePage(): ReactElement {
  const [plans, setPlans] = useState<ExtendedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async (): Promise<void> => {
      try {
        const response = await api.plans.listPublic();
        if ('error' in response) throw new Error(response.error);
        setPlans(response.data || []);
        setError(null);
      } catch (error) {
        console.error('プランの取得に失敗しました:', error);
        setError('プランの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    void fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const regionMatch = !selectedRegion || plan.region === selectedRegion;
    const categoryMatch = !selectedCategory || plan.category === selectedCategory;
    return regionMatch && categoryMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div
          role="status"
          aria-label="読み込み中"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-rose-950 text-center sm:text-left">
          プランを探す
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="region" className="text-sm font-medium text-rose-950">
              地域:
            </label>
            <select
              id="region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="rounded-md border text-rose-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {REGIONS.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="category" className="text-sm font-medium text-rose-950">
              カテゴリ:
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border text-rose-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {error}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-rose-700">
            {selectedRegion || selectedCategory
              ? '選択された条件に一致するプランがありません'
              : 'プランがまだありません'}
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
