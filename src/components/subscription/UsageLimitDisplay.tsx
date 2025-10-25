'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CheckLimitResponse, SubscriptionError } from '@/types/subscription';

/**
 * UsageLimitDisplay コンポーネント
 *
 * AIプラン生成の残り回数を表示するコンポーネント
 * Freeプランユーザーに対して、日次・月次の制限と残り回数を表示
 * Premiumプランユーザーには表示しない
 */
export function UsageLimitDisplay() {
  const [limit, setLimit] = useState<CheckLimitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLimit();
  }, []);

  const fetchLimit = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/check-limit');

      if (!response.ok) {
        // 404エラー（テーブル未作成）の場合は静かに失敗
        if (response.status === 404 || response.status === 401) {
          console.warn('Subscription system not yet initialized');
          setLimit(null);
          return;
        }

        const errorData: SubscriptionError = await response.json();
        throw new Error(errorData.error || '制限情報の取得に失敗しました');
      }

      const data: CheckLimitResponse = await response.json();
      setLimit(data);
    } catch (err) {
      console.error('Error fetching limit:', err);
      // エラーは表示せず、コンポーネントを非表示にする（Graceful degradation）
      setLimit(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // ローディング中
  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // エラー時は表示しない（サイレントに失敗）
  if (error || !limit) {
    return null;
  }

  // Premiumユーザーには表示しない
  if (limit.plan === 'premium' || limit.limits.daily === null) {
    return null;
  }

  // 制限に余裕がある場合の背景色
  const bgColor = limit.canGenerate
    ? 'bg-blue-50 border-blue-200'
    : 'bg-yellow-50 border-yellow-300';

  return (
    <div className={`border rounded-lg p-4 mb-4 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">📊 AIプラン生成の残り回数</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              今日: <span className="font-semibold text-blue-600">{limit.remaining.daily}</span> /{' '}
              {limit.limits.daily}回
            </p>
            <p className="text-sm text-gray-700">
              今月: <span className="font-semibold text-blue-600">{limit.remaining.monthly}</span> /{' '}
              {limit.limits.monthly}回
            </p>
          </div>

          {!limit.canGenerate && (
            <p className="text-xs text-yellow-700 mt-2">
              ⚠️ 制限に達しました。{limit.remaining.daily === 0 ? '明日' : '来月'}また利用できます。
            </p>
          )}
        </div>

        <div className="ml-4">
          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
          >
            💎 サブスクリプションを確認
          </Link>
        </div>
      </div>

      {/* リフレッシュボタン（開発用） */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={fetchLimit}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          再読み込み
        </button>
      )}
    </div>
  );
}
