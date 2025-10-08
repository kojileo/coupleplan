'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DatePlanDetail, PlanItem } from '@/types/date-plan';

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [plan, setPlan] = useState<DatePlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
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

      const response = await fetch(`/api/plans/${planId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プランの取得に失敗しました');
      }

      setPlan(data);
    } catch (err: any) {
      console.error('プラン取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('このプランを削除してもよろしいですか？')) {
      return;
    }

    try {
      setDeleting(true);

      // 認証トークンを取得
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'プランの削除に失敗しました');
      }

      router.push('/dashboard/plans');
    } catch (err: any) {
      console.error('プラン削除エラー:', err);
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getTotalCost = () => {
    if (!plan?.items) return 0;
    return plan.items.reduce((sum, item) => sum + (item.cost || 0), 0);
  };

  const getTotalDuration = () => {
    if (!plan?.items) return 0;
    return plan.items.reduce((sum, item) => sum + (item.duration || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error || 'プランが見つかりません'}</p>
          <button
            onClick={() => router.push('/dashboard/plans')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            プラン一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link
            href="/dashboard/plans"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← プラン一覧に戻る
          </Link>
        </div>

        {/* プラン情報カード */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          {/* タイトルセクション */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {plan.ai_generated && (
                    <span className="text-2xl" title="AI生成">
                      🤖
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      plan.status === 'draft'
                        ? 'bg-gray-100 text-gray-800'
                        : plan.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {plan.status === 'draft'
                      ? '下書き'
                      : plan.status === 'completed'
                        ? '完了'
                        : 'アーカイブ'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{plan.title}</h1>
                {plan.description && <p className="text-gray-600 text-lg">{plan.description}</p>}
              </div>
            </div>

            {/* メタ情報 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">予算</p>
                <p className="text-lg font-semibold text-gray-900">
                  {plan.budget?.toLocaleString()}円
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">所要時間</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.floor((plan.duration || 0) / 60)}時間
                  {(plan.duration || 0) % 60 > 0 && `${(plan.duration || 0) % 60}分`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">場所</p>
                <p className="text-lg font-semibold text-gray-900">{plan.location_city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">作成日</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(plan.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>

            {/* 好みタグ */}
            {plan.preferences && plan.preferences.length > 0 && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-500 mb-2">好み</p>
                <div className="flex flex-wrap gap-2">
                  {plan.preferences.map((pref, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 特別な要望 */}
            {plan.special_requests && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-500 mb-2">特別な要望</p>
                <p className="text-gray-700">{plan.special_requests}</p>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="p-6 bg-gray-50 flex gap-3">
            <button
              onClick={() => router.push(`/dashboard/plans/${planId}/customize`)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ✏️ カスタマイズ
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? '削除中...' : '削除'}
            </button>
          </div>
        </div>

        {/* プランアイテム */}
        {plan.items && plan.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">デートスケジュール</h2>
              <div className="mt-2 flex gap-6 text-sm text-gray-600">
                <span>合計費用: {getTotalCost().toLocaleString()}円</span>
                <span>
                  合計時間: {Math.floor(getTotalDuration() / 60)}時間
                  {getTotalDuration() % 60 > 0 && `${getTotalDuration() % 60}分`}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {plan.items.map((item, index) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    {/* タイムライン */}
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      {index < plan.items.length - 1 && (
                        <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                      )}
                    </div>

                    {/* アイテム情報 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {item.type}
                          </span>
                        </div>
                        {item.start_time && (
                          <span className="text-sm font-medium text-gray-700 ml-4">
                            {item.start_time}
                          </span>
                        )}
                      </div>

                      {item.description && <p className="text-gray-600 mb-3">{item.description}</p>}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {item.location && (
                          <div className="flex items-center text-gray-600">
                            <span className="mr-1">📍</span>
                            <span>{item.location}</span>
                          </div>
                        )}
                        {item.duration && (
                          <div className="flex items-center text-gray-600">
                            <span className="mr-1">⏰</span>
                            <span>{item.duration}分</span>
                          </div>
                        )}
                        {item.cost !== undefined && (
                          <div className="flex items-center text-gray-600">
                            <span className="mr-1">💰</span>
                            <span>{item.cost.toLocaleString()}円</span>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                          <p className="text-sm text-gray-700">📝 {item.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* フィードバックセクション */}
        {plan.feedback && plan.feedback.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">フィードバック</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {plan.feedback.map((fb) => (
                <div key={fb.id} className="p-6">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < fb.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(fb.submitted_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  {fb.comment && <p className="text-gray-700">{fb.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
