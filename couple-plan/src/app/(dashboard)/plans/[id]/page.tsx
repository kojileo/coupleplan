'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import PublishDialog from '@/components/features/plans/PublishDialog';
import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function PlanDetailPage({ params }: Props): ReactElement {
  const router = useRouter();
  const { session } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [planId, setPlanId] = useState<string>('');

  // params を解決して planId を設定
  useEffect(() => {
    void params.then(({ id }) => setPlanId(id));
  }, [params]);

  // planId が解決されたらプランデータを取得
  useEffect(() => {
    if (!planId) return;

    const fetchPlan = async (): Promise<void> => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.plans.get(session.access_token, planId);
        if ('error' in response) throw new Error(response.error);
        setPlan(response.data || null);
      } catch (error) {
        console.error('プランの取得に失敗しました:', error);
        void router.push('/plans');
      } finally {
        setLoading(false);
      }
    };

    void fetchPlan();
  }, [session, planId, router]);

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (!session || !confirm('このプランを削除してもよろしいですか？')) return;

    try {
      const response = await api.plans.delete(session.access_token, planId);
      if ('error' in response) throw new Error(response.error);
      void router.push('/plans');
    } catch (error) {
      console.error('プランの削除に失敗しました:', error);
      alert('プランの削除に失敗しました');
    }
  };

  const handleCreateFromPlan = async (): Promise<void> => {
    if (!session || !plan) return;

    try {
      // 既存のプランのデータをコピーして新しいプランを作成
      const newPlan = {
        title: `${plan.title} (コピー)`,
        description: plan.description,
        date: plan.date ? new Date(plan.date).toISOString() : null,
        locations: plan.locations?.map(location => ({
          url: location.url,
          name: location.name || null
        })) || [],
        region: plan.region || null,
        budget: plan.budget,
        isPublic: false,
        category: plan.category || null,
      };

      console.log('Creating new plan with data:', newPlan); // デバッグ用ログ

      const response = await api.plans.create(session.access_token, newPlan);
      console.log('API Response:', response); // デバッグ用ログ

      if ('error' in response) {
        console.error('API Error:', response.error, response); // デバッグ用ログ
        throw new Error(response.error);
      }
      
      if (!response.data?.id) {
        console.error('No plan ID in response:', response); // デバッグ用ログ
        throw new Error('プランの作成に失敗しました');
      }
      
      // 新しく作成したプランの編集ページに遷移
      void router.push(`/plans/${response.data.id}/edit`);
    } catch (error) {
      console.error('プランの作成に失敗しました:', error);
      alert('プランの作成に失敗しました');
    }
  };

  // プランの作成者かどうかを判定
  const isOwner = session?.user?.id === plan?.userId;

  // planId が未解決 or データ取得中はローディング表示
  if (!planId || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"
        />
      </div>
    );
  }

  if (!plan) {
    return <div />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-rose-950">{plan.title}</h1>
        <div className="flex gap-4">
          {!isOwner && (
            <Button
              variant="outline"
              onClick={handleCreateFromPlan}
            >
              このプランから作成
            </Button>
          )}
          {isOwner && ( // 作成者の場合のみボタンを表示
            <>
              <Button variant="outline" onClick={(): void => setIsPublishDialogOpen(true)}>
                公開設定
              </Button>
              <Button
                variant="outline"
                onClick={(): void => {
                  void router.push(`/plans/${planId}/edit`);
                }}
              >
                編集
              </Button>
              <Button
                variant="outline"
                onClick={(e): void => {
                  void handleDelete(e);
                }}
              >
                削除
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-rose-800 mb-2">説明</h2>
          <p className="text-rose-900 whitespace-pre-wrap">{plan.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-rose-800 mb-2">日付</h2>
            <p className="text-rose-900">
              {plan.date ? new Date(plan.date).toLocaleDateString() : '未設定'}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-rose-800 mb-2">予算</h2>
            <p className="text-rose-900">¥{plan.budget.toLocaleString()}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-rose-800 mb-2">場所URL</h2>
            <div className="space-y-2">
              {plan.locations && plan.locations.length > 0 ? (
                plan.locations.map((location) => (
                  <div key={location.id} className="flex items-center gap-2">
                    <a
                      href={location.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {location.name || new URL(location.url).hostname}
                    </a>
                  </div>
                ))
              ) : (
                '未設定'
              )}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-rose-800 mb-2">地域</h2>
            <p className="text-rose-900">
              {plan.region ? (
                <span>
                  {plan.region === 'tokyo' && '東京'}
                  {plan.region === 'osaka' && '大阪'}
                  {plan.region === 'kyoto' && '京都'}
                  {plan.region === 'fukuoka' && '福岡'}
                  {plan.region === 'sapporo' && '札幌'}
                  {plan.region === 'nagoya' && '名古屋'}
                  {plan.region === 'yokohama' && '横浜'}
                  {plan.region === 'kobe' && '神戸'}
                  {plan.region === 'other' && 'その他'}
                </span>
              ) : (
                '未設定'
              )}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-rose-100">
          <div className="flex justify-between text-sm text-rose-600">
            <span>作成日: {new Date(plan.createdAt).toLocaleDateString()}</span>
            <span>更新日: {new Date(plan.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {isOwner && ( // 作成者の場合のみダイアログを表示
        <PublishDialog
          planId={planId}
          isOpen={isPublishDialogOpen}
          onClose={(): void => setIsPublishDialogOpen(false)}
        />
      )}
    </div>
  );
}
