'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { PlanCard } from '@/components/features/plans/PlanCard';
import { useAuth } from '@/contexts/AuthContext';
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

export default function PublicPlansPage(): ReactElement {
  const { session } = useAuth();
  const [publicPlans, setPublicPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    const fetchPlans = async (): Promise<void> => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const publicResponse = await api.plans.listPublic(session.access_token);
        if ('error' in publicResponse) throw new Error(publicResponse.error);
        setPublicPlans(publicResponse.data || []);
      } catch (error) {
        console.error('公開プランの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchPlans();
  }, [session]);

  const filteredPlans = selectedRegion
    ? publicPlans.filter((plan) => plan.region === selectedRegion)
    : publicPlans;

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
        <h1 className="text-2xl font-bold text-rose-950">公開プラン一覧</h1>
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
      </div>

      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-rose-700">
            {selectedRegion
              ? '選択された地域の公開プランがありません'
              : '公開プランがまだありません'}
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
