'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface Subscription {
  id: string;
  coupleId: string;
  planName: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  startDate: number;
  nextBillingDate: number;
  trialEndDate?: number;
  cancellationDate?: number;
  features: string[];
  limits: {
    aiPlans: number;
    collaborations: number;
    memories: number;
    storage: number;
  };
  usage: {
    aiPlans: number;
    collaborations: number;
    memories: number;
    storage: number;
  };
}

interface BillingHistory {
  id: string;
  date: number;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoiceUrl?: string;
}

interface CoupleInfo {
  id: string;
  partner1: {
    name: string;
    email: string;
    role: 'primary' | 'secondary';
  };
  partner2: {
    name: string;
    email: string;
    role: 'primary' | 'secondary';
  };
  createdAt: number;
  lastActive: number;
}

export default function SubscriptionManagementPage(): ReactElement {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [pauseDuration, setPauseDuration] = useState('1');

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
        startDate: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90日前
        nextBillingDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15日後
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
        usage: {
          aiPlans: 45,
          collaborations: 23,
          memories: 156,
          storage: 3.2,
        },
      };

      // 請求履歴のシミュレーション
      const mockBillingHistory: BillingHistory[] = [
        {
          id: 'bill_1',
          date: Date.now() - 15 * 24 * 60 * 60 * 1000,
          amount: 980,
          currency: 'JPY',
          status: 'succeeded',
          description: 'プレミアムプラン - 月額料金',
          invoiceUrl: '/invoices/inv_1.pdf',
        },
        {
          id: 'bill_2',
          date: Date.now() - 45 * 24 * 60 * 60 * 1000,
          amount: 980,
          currency: 'JPY',
          status: 'succeeded',
          description: 'プレミアムプラン - 月額料金',
          invoiceUrl: '/invoices/inv_2.pdf',
        },
        {
          id: 'bill_3',
          date: Date.now() - 75 * 24 * 60 * 60 * 1000,
          amount: 980,
          currency: 'JPY',
          status: 'succeeded',
          description: 'プレミアムプラン - 月額料金',
          invoiceUrl: '/invoices/inv_3.pdf',
        },
      ];

      // カップル情報のシミュレーション
      const mockCoupleInfo: CoupleInfo = {
        id: 'couple123',
        partner1: {
          name: '田中太郎',
          email: 'tanaka@example.com',
          role: 'primary',
        },
        partner2: {
          name: '佐藤花子',
          email: 'sato@example.com',
          role: 'secondary',
        },
        createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
        lastActive: Date.now() - 2 * 24 * 60 * 60 * 1000,
      };

      // データ読み込みのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubscription(mockSubscription);
      setBillingHistory(mockBillingHistory);
      setCoupleInfo(mockCoupleInfo);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleCancelSubscription = async () => {
    if (!cancellationReason.trim()) {
      alert('キャンセル理由を入力してください');
      return;
    }

    try {
      // サブスクリプションキャンセルのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'cancelled',
          cancellationDate: Date.now(),
        });
      }

      alert('サブスクリプションをキャンセルしました。現在のプランは次回請求日まで有効です。');
      setShowCancelModal(false);
      setCancellationReason('');
    } catch (error) {
      alert('キャンセルに失敗しました。もう一度お試しください。');
    }
  };

  const handlePauseSubscription = async () => {
    try {
      // サブスクリプション一時停止のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'paused',
        });
      }

      alert(`${pauseDuration}ヶ月間サブスクリプションを一時停止しました。`);
      setShowPauseModal(false);
      setPauseDuration('1');
    } catch (error) {
      alert('一時停止に失敗しました。もう一度お試しください。');
    }
  };

  const handleResumeSubscription = async () => {
    try {
      // サブスクリプション再開のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'active',
        });
      }

      alert('サブスクリプションを再開しました。');
    } catch (error) {
      alert('再開に失敗しました。もう一度お試しください。');
    }
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
      case 'paused':
        return 'bg-gray-100 text-gray-800';
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
      case 'paused':
        return '一時停止中';
      default:
        return status;
    }
  };

  const getBillingStatusColor = (status: string) => {
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

  const getBillingStatusLabel = (status: string) => {
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
          <p className="text-gray-600">サブスクリプション情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!subscription || !coupleInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">サブスクリプション情報が見つかりませんでした</p>
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
              <h1 className="text-2xl font-bold text-gray-900">サブスクリプション管理</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* サブスクリプション概要 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">現在のサブスクリプション</h2>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}
              >
                {getStatusLabel(subscription.status)}
              </span>
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
                {formatDate(subscription.startDate)}
              </div>
              <div className="text-lg text-gray-600">開始日</div>
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
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">使用量</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">AIプラン生成</span>
                  <span className="text-sm text-gray-500">
                    {subscription.usage.aiPlans}/
                    {subscription.limits.aiPlans === -1 ? '∞' : subscription.limits.aiPlans}
                  </span>
                </div>
                {subscription.limits.aiPlans !== -1 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(subscription.usage.aiPlans / subscription.limits.aiPlans) * 100}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">共同編集</span>
                  <span className="text-sm text-gray-500">
                    {subscription.usage.collaborations}/
                    {subscription.limits.collaborations === -1
                      ? '∞'
                      : subscription.limits.collaborations}
                  </span>
                </div>
                {subscription.limits.collaborations !== -1 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(subscription.usage.collaborations / subscription.limits.collaborations) * 100}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">思い出</span>
                  <span className="text-sm text-gray-500">
                    {subscription.usage.memories}/{subscription.limits.memories}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${(subscription.usage.memories / subscription.limits.memories) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">ストレージ</span>
                  <span className="text-sm text-gray-500">
                    {subscription.usage.storage}GB/{subscription.limits.storage}GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(subscription.usage.storage / subscription.limits.storage) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-4">
            {subscription.status === 'active' && (
              <>
                <Button
                  onClick={() => setShowPauseModal(true)}
                  variant="outline"
                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                >
                  一時停止
                </Button>
                <Button
                  onClick={() => setShowCancelModal(true)}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  キャンセル
                </Button>
              </>
            )}
            {subscription.status === 'paused' && (
              <Button
                onClick={handleResumeSubscription}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                再開
              </Button>
            )}
            <Button
              onClick={() => (window.location.href = '/dashboard/settings/billing')}
              variant="outline"
            >
              プラン変更
            </Button>
          </div>
        </div>

        {/* カップル情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">カップル情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">パートナー1</h4>
              <div className="text-sm text-gray-600">
                <div>名前: {coupleInfo.partner1.name}</div>
                <div>メール: {coupleInfo.partner1.email}</div>
                <div>役割: {coupleInfo.partner1.role === 'primary' ? '主管理者' : '副管理者'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">パートナー2</h4>
              <div className="text-sm text-gray-600">
                <div>名前: {coupleInfo.partner2.name}</div>
                <div>メール: {coupleInfo.partner2.email}</div>
                <div>役割: {coupleInfo.partner2.role === 'primary' ? '主管理者' : '副管理者'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 請求履歴 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">請求履歴</h3>
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
                {billingHistory.map((bill) => (
                  <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{formatDate(bill.date)}</td>
                    <td className="py-3 px-4 text-gray-600">{bill.description}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {formatCurrency(bill.amount, bill.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getBillingStatusColor(bill.status)}`}
                      >
                        {getBillingStatusLabel(bill.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {bill.invoiceUrl && (
                        <Button
                          onClick={() => window.open(bill.invoiceUrl, '_blank')}
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

      {/* キャンセルモーダル */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">サブスクリプションをキャンセル</h3>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                サブスクリプションをキャンセルすると、次回請求日まで現在のプランを利用できます。
                その後、フリープランに戻ります。
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キャンセル理由（任意）
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="キャンセル理由を教えてください（改善の参考にさせていただきます）"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleCancelSubscription}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                キャンセルする
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 一時停止モーダル */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">サブスクリプションを一時停止</h3>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                サブスクリプションを一時停止すると、指定した期間中は課金が停止されます。
                期間終了後、自動的に再開されます。
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">停止期間</label>
                <select
                  value={pauseDuration}
                  onChange={(e) => setPauseDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">1ヶ月</option>
                  <option value="2">2ヶ月</option>
                  <option value="3">3ヶ月</option>
                  <option value="6">6ヶ月</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={() => setShowPauseModal(false)} variant="outline" className="flex-1">
                キャンセル
              </Button>
              <Button
                onClick={handlePauseSubscription}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                一時停止する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
