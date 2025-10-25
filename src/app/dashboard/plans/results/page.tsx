'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

import CoupleInviteBanner from '@/components/couple/CoupleInviteBanner';
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

      // 最新1件を取得（AI生成直後）
      const recentPlans = data.plans.slice(0, 1);
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-rose-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">AIが最適なプランを生成中...</h2>
          <p className="text-sm text-gray-500">少々お待ちください</p>
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">AIが最適なプランを生成！</h1>
          <p className="text-xl text-gray-600 mb-4">あなたの好みに合わせた最高のデートプランです</p>
        </div>

        {/* プラン表示（中央配置） */}
        {plans.length > 0 ? (
          <div className="flex justify-center mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300"
              >
                {/* プランヘッダー */}
                <div className="bg-gradient-to-r from-rose-500 to-purple-500 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                  <p className="text-white/90">{plan.description}</p>
                </div>

                {/* プラン詳細 */}
                <div className="p-8">
                  {/* 統計情報 */}
                  <div className="flex items-center justify-center gap-8 mb-8 p-6 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl mb-1">💰</div>
                      <div className="text-sm text-gray-500">予算</div>
                      <div className="text-xl font-bold text-gray-900">
                        {plan.budget?.toLocaleString()}円
                      </div>
                    </div>
                    <div className="h-12 w-px bg-gray-300"></div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">⏰</div>
                      <div className="text-sm text-gray-500">所要時間</div>
                      <div className="text-xl font-bold text-gray-900">
                        {Math.floor((plan.duration || 0) / 60)}時間
                      </div>
                    </div>
                    <div className="h-12 w-px bg-gray-300"></div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">📍</div>
                      <div className="text-sm text-gray-500">場所</div>
                      <div className="text-xl font-bold text-gray-900">{plan.location_city}</div>
                    </div>
                  </div>

                  {/* 好みタグ */}
                  {plan.preferences && plan.preferences.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-900 mb-3 text-lg text-center">
                        プランのテーマ
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {plan.preferences.map((pref, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-gradient-to-r from-rose-100 to-purple-100 text-rose-700 text-sm font-medium rounded-full"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full px-6 py-4 text-lg bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-xl hover:from-rose-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                      プラン詳細を見る
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => router.push(`/dashboard/plans/${plan.id}/customize`)}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        カスタマイズ
                      </button>
                      <button
                        onClick={handleCreateAnother}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        別のプランを生成
                      </button>
                    </div>
                  </div>
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
