'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DatePlan, DatePlanStatus } from '@/types/date-plan';

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<DatePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<DatePlanStatus | 'all'>('all');

  useEffect(() => {
    fetchPlans();
  }, [filterStatus]);

  const fetchPlans = async () => {
    try {
      setLoading(true);

      // 認証トークンを取得
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('ログインが必要です');
        return;
      }

      const statusParam = filterStatus !== 'all' ? `&status=${filterStatus}` : '';
      const response = await fetch(`/api/plans?limit=20${statusParam}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プランの取得に失敗しました');
      }

      setPlans(data.plans);
    } catch (err: any) {
      console.error('プラン取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: DatePlanStatus) => {
    const badges = {
      draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
      generating: { label: '生成中', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: '完了', color: 'bg-green-100 text-green-800' },
      archived: { label: 'アーカイブ', color: 'bg-blue-100 text-blue-800' },
    };
    return badges[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPlans}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">デートプラン</h1>
              <p className="text-gray-600">
                AIが提案したプランや、あなたが作成したプランを管理できます
              </p>
            </div>
            <Link
              href="/dashboard/plans/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + 新しいプランを作成
            </Link>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'draft'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              下書き
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              完了
            </button>
            <button
              onClick={() => setFilterStatus('archived')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              アーカイブ
            </button>
          </div>
        </div>

        {/* プラン一覧 */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/plans/${plan.id}`)}
              >
                {/* プランヘッダー */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        getStatusBadge(plan.status).color
                      }`}
                    >
                      {getStatusBadge(plan.status).label}
                    </span>
                    {plan.ai_generated && (
                      <span className="text-2xl" title="AI生成">
                        🤖
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {plan.title}
                  </h3>
                  {plan.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{plan.description}</p>
                  )}
                </div>

                {/* プラン詳細 */}
                <div className="p-6 space-y-2">
                  {plan.budget && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">💰</span>
                      <span>予算: {plan.budget.toLocaleString()}円</span>
                    </div>
                  )}
                  {plan.duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">⏰</span>
                      <span>
                        所要時間: {Math.floor(plan.duration / 60)}時間
                        {plan.duration % 60 > 0 && `${plan.duration % 60}分`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    <span>
                      {plan.location_prefecture} {plan.location_city}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>{new Date(plan.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>

                {/* 好みタグ */}
                {plan.preferences && plan.preferences.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="flex flex-wrap gap-1">
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
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">プランがまだありません</h3>
            <p className="text-gray-600 mb-6">
              AIに提案してもらうか、自分でプランを作成してみましょう
            </p>
            <Link
              href="/dashboard/plans/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              最初のプランを作成
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
