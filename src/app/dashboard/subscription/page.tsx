'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CurrentSubscriptionResponse, CheckLimitResponse } from '@/types/subscription';

/**
 * サブスクリプション管理画面
 *
 * 現在のプラン情報、使用状況、Premium案内を表示
 * Phase 1.1ではPremium登録は未実装（案内のみ）
 */
export default function SubscriptionPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<CurrentSubscriptionResponse | null>(null);
  const [usageLimit, setUsageLimit] = useState<CheckLimitResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // 現在のプラン情報を取得
      const [currentResponse, limitResponse] = await Promise.all([
        fetch('/api/subscription/current'),
        fetch('/api/subscription/check-limit'),
      ]);

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentPlan(currentData);
      }

      if (limitResponse.ok) {
        const limitData = await limitResponse.json();
        setUsageLimit(limitData);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPremium = () => {
    alert(
      'Premium プランは近日公開予定です！\n\n' +
        '【Premium プラン特典】\n' +
        '✨ AIプラン生成: 無制限\n' +
        '✨ プラン保存: 無制限\n' +
        '✨ 優先サポート\n' +
        '✨ 今後の新機能に優先アクセス\n\n' +
        '月額 ¥480（予定）\n\n' +
        'リリース時にはメールでお知らせします！'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const plan = currentPlan?.plan;
  const isFree = plan?.name === 'free';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900">サブスクリプション</h1>
          <p className="text-gray-600 mt-2">プラン情報と使用状況</p>
        </div>

        <div className="space-y-6">
          {/* 現在のプラン */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">現在のプラン</h2>

            {plan && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{plan.display_name}</p>
                    <p className="text-gray-600">
                      {plan.price_monthly === 0
                        ? '無料'
                        : `月額 ¥${plan.price_monthly.toLocaleString()}`}
                    </p>
                  </div>
                  {isFree && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      現在のプラン
                    </span>
                  )}
                </div>

                {/* プラン機能 */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">プランに含まれる機能</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="mr-2">✓</span>
                      <span>
                        AIプラン生成:{' '}
                        {plan.daily_plan_limit
                          ? `${plan.daily_plan_limit}回/日、${plan.monthly_plan_limit}回/月`
                          : '無制限'}
                      </span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="mr-2">✓</span>
                      <span>
                        プラン保存:{' '}
                        {plan.max_saved_plans ? `${plan.max_saved_plans}件まで` : '無制限'}
                      </span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="mr-2">✓</span>
                      <span>共同編集機能</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="mr-2">✓</span>
                      <span>基本機能すべて</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 今月の使用状況 */}
          {usageLimit && isFree && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">今月の使用状況</h2>

              <div className="space-y-4">
                {/* 日次使用状況 */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>今日のAIプラン生成</span>
                    <span>
                      {usageLimit.used.daily} / {usageLimit.limits.daily}回
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(usageLimit.used.daily / (usageLimit.limits.daily || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    残り {usageLimit.remaining.daily}回（毎日0時にリセット）
                  </p>
                </div>

                {/* 月次使用状況 */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>今月のAIプラン生成</span>
                    <span>
                      {usageLimit.used.monthly} / {usageLimit.limits.monthly}回
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(usageLimit.used.monthly / (usageLimit.limits.monthly || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    残り {usageLimit.remaining.monthly}回（毎月1日にリセット）
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Premium案内 */}
          {isFree && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-md p-6 border-2 border-blue-200">
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-white rounded-full mb-4">
                  <span className="text-4xl">💎</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium プラン</h2>
                <p className="text-gray-700">もっと自由にデートプランを作成しませんか？</p>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-gray-600 mb-2">月額</p>
                  <p className="text-4xl font-bold text-blue-600">¥480</p>
                  <p className="text-sm text-gray-500 mt-1">（近日公開予定）</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Premium特典</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-0.5">✓</span>
                      <div>
                        <p className="font-medium text-gray-900">AIプラン生成: 無制限</p>
                        <p className="text-sm text-gray-600">いつでも何度でもプラン作成可能</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-0.5">✓</span>
                      <div>
                        <p className="font-medium text-gray-900">プラン保存: 無制限</p>
                        <p className="text-sm text-gray-600">お気に入りのプランをすべて保存</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-0.5">✓</span>
                      <div>
                        <p className="font-medium text-gray-900">優先サポート</p>
                        <p className="text-sm text-gray-600">お問い合わせに優先対応</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-0.5">✓</span>
                      <div>
                        <p className="font-medium text-gray-900">新機能に優先アクセス</p>
                        <p className="text-sm text-gray-600">AI仲裁機能などを優先的に利用</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleUpgradeToPremium}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors shadow-lg"
              >
                Premium プランに興味がある
              </button>

              <p className="text-xs text-gray-600 text-center mt-3">
                ※ Premium プランは近日公開予定です。公開時にメールでお知らせします。
              </p>
            </div>
          )}

          {/* Premium会員の場合 */}
          {!isFree && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                  <span className="text-5xl">💎</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium会員</h2>
                <p className="text-gray-600">すべての機能が無制限でご利用いただけます</p>
              </div>
            </div>
          )}

          {/* お問い合わせリンク */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-3">サポート</h3>
            <p className="text-sm text-gray-600 mb-4">
              プランに関するご質問やご要望がございましたら、お気軽にお問い合わせください。
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              お問い合わせ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
