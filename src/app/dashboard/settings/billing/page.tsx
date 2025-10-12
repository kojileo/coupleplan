'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface Subscription {
  id: string;
  coupleId: string;
  planName: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: number;
  trialEndDate?: number;
  features: string[];
  limits: {
    aiPlans: number;
    collaborations: number;
    memories: number;
    storage: number; // GB
  };
  usage: {
    aiPlans: number;
    collaborations: number;
    memories: number;
    storage: number; // GB
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  date: number;
  description: string;
  invoiceUrl?: string;
}

interface UsageMetrics {
  period: string;
  aiPlans: {
    used: number;
    limit: number;
    percentage: number;
  };
  collaborations: {
    used: number;
    limit: number;
    percentage: number;
  };
  memories: {
    used: number;
    limit: number;
    percentage: number;
  };
  storage: {
    used: number;
    limit: number;
    percentage: number;
  };
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    aiPlans: number;
    collaborations: number;
    memories: number;
    storage: number;
  };
  popular?: boolean;
}

export default function BillingPage(): ReactElement {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // サブスクリプション情報のシミュレーション
      const mockSubscription: Subscription = {
        id: 'sub_123',
        coupleId: 'couple123',
        planName: 'プレミアムプラン',
        planId: 'premium_monthly',
        status: 'active',
        price: 980,
        currency: 'JPY',
        billingCycle: 'monthly',
        nextBillingDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15日後
        features: [
          '無制限AIデートプラン生成',
          'リアルタイム共同編集',
          '高度な関係分析',
          '優先サポート',
          'カスタムテーマ',
        ],
        limits: {
          aiPlans: -1, // 無制限
          collaborations: -1, // 無制限
          memories: 1000,
          storage: 10,
        },
        usage: {
          aiPlans: 45,
          collaborations: 23,
          memories: 156,
          storage: 3.2,
        },
      };

      // 支払い履歴のシミュレーション
      const mockPayments: Payment[] = [
        {
          id: 'pay_1',
          amount: 980,
          currency: 'JPY',
          status: 'succeeded',
          date: Date.now() - 15 * 24 * 60 * 60 * 1000,
          description: 'プレミアムプラン - 月額料金',
          invoiceUrl: '/invoices/inv_1.pdf',
        },
        {
          id: 'pay_2',
          amount: 980,
          currency: 'JPY',
          status: 'succeeded',
          date: Date.now() - 45 * 24 * 60 * 60 * 1000,
          description: 'プレミアムプラン - 月額料金',
          invoiceUrl: '/invoices/inv_2.pdf',
        },
        {
          id: 'pay_3',
          amount: 980,
          currency: 'JPY',
          status: 'succeeded',
          date: Date.now() - 75 * 24 * 60 * 60 * 1000,
          description: 'プレミアムプラン - 月額料金',
          invoiceUrl: '/invoices/inv_3.pdf',
        },
      ];

      // 使用量メトリクスのシミュレーション
      const mockUsageMetrics: UsageMetrics = {
        period: '今月',
        aiPlans: {
          used: 45,
          limit: -1,
          percentage: 0,
        },
        collaborations: {
          used: 23,
          limit: -1,
          percentage: 0,
        },
        memories: {
          used: 156,
          limit: 1000,
          percentage: 15.6,
        },
        storage: {
          used: 3.2,
          limit: 10,
          percentage: 32,
        },
      };

      // 利用可能プランのシミュレーション
      const mockPlans: Plan[] = [
        {
          id: 'free',
          name: 'フリープラン',
          price: 0,
          currency: 'JPY',
          billingCycle: 'monthly',
          features: [
            '月3回までAIデートプラン生成',
            '基本的な共同編集',
            '5GBストレージ',
            'コミュニティサポート',
          ],
          limits: {
            aiPlans: 3,
            collaborations: 5,
            memories: 50,
            storage: 5,
          },
        },
        {
          id: 'premium_monthly',
          name: 'プレミアムプラン',
          price: 980,
          currency: 'JPY',
          billingCycle: 'monthly',
          features: [
            '無制限AIデートプラン生成',
            'リアルタイム共同編集',
            '高度な関係分析',
            '優先サポート',
            'カスタムテーマ',
          ],
          limits: {
            aiPlans: -1,
            collaborations: -1,
            memories: 1000,
            storage: 10,
          },
          popular: true,
        },
        {
          id: 'premium_yearly',
          name: 'プレミアムプラン',
          price: 9800,
          currency: 'JPY',
          billingCycle: 'yearly',
          features: [
            '無制限AIデートプラン生成',
            'リアルタイム共同編集',
            '高度な関係分析',
            '優先サポート',
            'カスタムテーマ',
            '2ヶ月分お得',
          ],
          limits: {
            aiPlans: -1,
            collaborations: -1,
            memories: 1000,
            storage: 10,
          },
        },
      ];

      // データ読み込みのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubscription(mockSubscription);
      setPayments(mockPayments);
      setUsageMetrics(mockUsageMetrics);
      setAvailablePlans(mockPlans);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handlePlanChange = async () => {
    if (!selectedPlan) return;

    setIsChangingPlan(true);

    try {
      // プラン変更のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert('プランを変更しました。次回請求日から新しいプランが適用されます。');
      setShowPlanChangeModal(false);
      setSelectedPlan('');
    } catch (error) {
      alert('プラン変更に失敗しました。もう一度お試しください。');
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    // 請求書ダウンロードのシミュレーション
    alert('請求書をダウンロードします');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'cancelled':
        return 'キャンセル済み';
      case 'past_due':
        return '支払い遅延';
      case 'trialing':
        return 'トライアル中';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '成功';
      case 'pending':
        return '処理中';
      case 'failed':
        return '失敗';
      case 'refunded':
        return '返金済み';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">課金情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={() => window.history.back()} variant="outline" size="sm">
                ← 戻る
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">課金管理</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* サブスクリプション情報 */}
        {subscription && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">現在のプラン</h2>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}
                >
                  {getStatusLabel(subscription.status)}
                </span>
                <Button onClick={() => setShowPlanChangeModal(true)} variant="outline" size="sm">
                  プラン変更
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{subscription.planName}</div>
                <div className="text-lg text-gray-600">
                  {formatCurrency(subscription.price, subscription.currency)}
                  <span className="text-sm text-gray-500">
                    /{subscription.billingCycle === 'monthly' ? '月' : '年'}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatDate(subscription.nextBillingDate)}
                </div>
                <div className="text-lg text-gray-600">次回請求日</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {subscription.features.length}
                </div>
                <div className="text-lg text-gray-600">利用可能機能</div>
              </div>
            </div>

            {/* 機能一覧 */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">利用可能機能</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 使用量 */}
            {usageMetrics && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">今月の使用量</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">AIプラン生成</span>
                      <span className="text-sm text-gray-500">
                        {usageMetrics.aiPlans.limit === -1
                          ? '無制限'
                          : `${usageMetrics.aiPlans.used}/${usageMetrics.aiPlans.limit}`}
                      </span>
                    </div>
                    {usageMetrics.aiPlans.limit !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${usageMetrics.aiPlans.percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">共同編集</span>
                      <span className="text-sm text-gray-500">
                        {usageMetrics.collaborations.limit === -1
                          ? '無制限'
                          : `${usageMetrics.collaborations.used}/${usageMetrics.collaborations.limit}`}
                      </span>
                    </div>
                    {usageMetrics.collaborations.limit !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${usageMetrics.collaborations.percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">思い出</span>
                      <span className="text-sm text-gray-500">
                        {usageMetrics.memories.used}/{usageMetrics.memories.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${usageMetrics.memories.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">ストレージ</span>
                      <span className="text-sm text-gray-500">
                        {usageMetrics.storage.used}GB/{usageMetrics.storage.limit}GB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${usageMetrics.storage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 支払い履歴 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">支払い履歴</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">日付</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">説明</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">金額</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">ステータス</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{formatDate(payment.date)}</td>
                    <td className="py-3 px-4 text-gray-600">{payment.description}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}
                      >
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.invoiceUrl && (
                        <Button
                          onClick={() => handleDownloadInvoice(payment.invoiceUrl!)}
                          variant="outline"
                          size="sm"
                        >
                          請求書
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* プラン変更モーダル */}
      {showPlanChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">プランを変更</h3>

            {/* 期間選択 */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedPeriod === 'monthly'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  月額
                </button>
                <button
                  onClick={() => setSelectedPeriod('yearly')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedPeriod === 'yearly'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  年額（2ヶ月分お得）
                </button>
              </div>
            </div>

            {/* プラン一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {availablePlans
                .filter((plan) => plan.billingCycle === selectedPeriod)
                .map((plan) => (
                  <div
                    key={plan.id}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="text-center mb-4">
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          人気
                        </span>
                      </div>
                    )}

                    <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold text-gray-900 mb-4">
                      {formatCurrency(plan.price, plan.currency)}
                      <span className="text-sm text-gray-500">
                        /{plan.billingCycle === 'monthly' ? '月' : '年'}
                      </span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">制限</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          AIプラン: {plan.limits.aiPlans === -1 ? '無制限' : plan.limits.aiPlans}
                        </div>
                        <div>
                          共同編集:{' '}
                          {plan.limits.collaborations === -1
                            ? '無制限'
                            : plan.limits.collaborations}
                        </div>
                        <div>思い出: {plan.limits.memories}</div>
                        <div>ストレージ: {plan.limits.storage}GB</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setShowPlanChangeModal(false)}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handlePlanChange}
                disabled={!selectedPlan || isChangingPlan}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {isChangingPlan ? '変更中...' : 'プランを変更'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
