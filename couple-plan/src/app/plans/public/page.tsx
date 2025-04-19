'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

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

export default function PublicPlansPage(): ReactElement {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchPublicPlans = async (): Promise<void> => {
      try {
        const response = await api.plans.listPublic();
        if ('error' in response) throw new Error(response.error);
        setPlans(response.data || []);
      } catch (error) {
        console.error('公開プランの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchPublicPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const regionMatch = !selectedRegion || plan.region === selectedRegion;
    const categoryMatch = !selectedCategory || plan.category === selectedCategory;
    return regionMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-rose-950">公開されているデートプラン</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="region" className="text-sm font-medium text-rose-950">
                地域:
              </label>
              <select
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-950"
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div
              role="status"
              aria-label="読み込み中"
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"
            />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-rose-700">
              {selectedRegion || selectedCategory
                ? '選択された条件に一致するプランがありません'
                : '公開されているプランがまだありません'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-rose-950 mb-4">{plan.title}</h3>
                <p className="text-gray-600 line-clamp-2 mb-4">{plan.description}</p>
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
                <div className="text-center">
                  <Link
                    href="/signup"
                    className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    アカウント作成して詳細を見る
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-rose-600 hover:text-rose-900 font-medium">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
