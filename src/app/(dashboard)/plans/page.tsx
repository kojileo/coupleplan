'use client';

import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { EmergencyButton } from '@/components/features/emergency/EmergencyButton';
import { PlanCard } from '@/components/features/plans/PlanCard';
import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

export default function MyPlansPage(): ReactElement {
  const router = useRouter();
  const { session } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async (): Promise<void> => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.plans.list(session.access_token);
        if ('error' in response) throw new Error(response.error);
        setPlans(response.data || []);
      } catch (error) {
        console.error('プランの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchPlans();
  }, [session]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-rose-950">マイプラン一覧</h1>
        <Button
          data-testid="header-create-button"
          onClick={(): void => {
            void router.push('/plans/new');
          }}
        >
          新規プラン作成
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div
            data-testid="loading-spinner"
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"
          />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-rose-700">プランがまだありません</p>
          <Button
            data-testid="empty-create-button"
            className="mt-4"
            onClick={(): void => {
              void router.push('/plans/new');
            }}
          >
            新規プラン作成
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} isPublic={false} />
          ))}
        </div>
      )}

      {/* 緊急ヘルプボタン */}
      <EmergencyButton />
    </div>
  );
}
