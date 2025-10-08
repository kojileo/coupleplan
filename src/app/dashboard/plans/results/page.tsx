'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatePlanDetail } from '@/types/date-plan';

function PlanResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const generationId = searchParams.get('generation_id');

  const [plans, setPlans] = useState<DatePlanDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generationId) {
      router.push('/dashboard/plans/create');
      return;
    }

    // プラン一覧を取得（AI生成直後なのでステータスがdraftのものを取得）
    fetchPlans();
  }, [generationId, router]);

  const fetchPlans = async () => {
    try {
      // 認証トークンを取得
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('ログインが必要です');
        return;
      }

      const response = await fetch('/api/plans?status=draft&limit=10', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プランの取得に失敗しました');
      }

      // 最新3件を取得（AI生成直後）
      const recentPlans = data.plans.slice(0, 3);
      setPlans(recentPlans);
    } catch (err: any) {
      console.error('プラン取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    router.push(`/dashboard/plans/${planId}`);
  };

  const handleCreateAnother = () => {
    router.push('/dashboard/plans/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AIがプランを生成しています...
          </h2>
          <p className="text-gray-600">少々お待ちください（最大30秒）</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard/plans/create')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              最初からやり直す
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div className="text-green-500 text-5xl mb-4">✨</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AIがプランを生成しました！</h1>
          <p className="text-gray-600">
            あなたにぴったりの{plans.length}つのデートプランを提案します
          </p>
        </div>

        {/* プラン一覧 */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectPlan(plan.id)}
              >
                {/* プランヘッダー */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      プラン {index + 1}
                    </span>
                    {plan.ai_generated && <span className="text-2xl">🤖</span>}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{plan.description}</p>
                </div>

                {/* プラン詳細 */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">💰</span>
                    <span>予算: {plan.budget?.toLocaleString()}円</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">⏰</span>
                    <span>所要時間: {Math.floor((plan.duration || 0) / 60)}時間</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    <span>
                      {plan.location_prefecture} {plan.location_city}
                    </span>
                  </div>
                  {plan.preferences && plan.preferences.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {plan.preferences.slice(0, 3).map((pref, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {pref}
                        </span>
                      ))}
                      {plan.preferences.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{plan.preferences.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ボタン */}
                <div className="p-6 pt-0">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    このプランを見る
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">プランが見つかりませんでした</p>
            <button
              onClick={handleCreateAnother}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              新しいプランを作成
            </button>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleCreateAnother}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            別のプランを作成
          </button>
          <button
            onClick={() => router.push('/dashboard/plans')}
            className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            プラン一覧を見る
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <PlanResultsContent />
    </Suspense>
  );
}
