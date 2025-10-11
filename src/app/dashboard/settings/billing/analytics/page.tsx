'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface BillingMetrics {
  period: string;
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    churn: number;
    mrr: number; // Monthly Recurring Revenue
  };
  usage: {
    aiPlans: number;
    collaborations: number;
    memories: number;
    storage: number;
  };
  conversion: {
    trialToPaid: number;
    freeToPaid: number;
    planUpgrade: number;
  };
}

interface RevenueData {
  date: string;
  revenue: number;
  subscriptions: number;
}

interface PlanDistribution {
  planId: string;
  planName: string;
  count: number;
  percentage: number;
  revenue: number;
}

interface ChurnData {
  month: string;
  churnRate: number;
  lostSubscriptions: number;
  totalSubscriptions: number;
}

export default function BillingAnalyticsPage(): ReactElement {
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);
  const [churnData, setChurnData] = useState<ChurnData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [selectedChart, setSelectedChart] = useState<string>('revenue');

  const periods = [
    { id: '7d', name: '7日間' },
    { id: '30d', name: '30日間' },
    { id: '90d', name: '90日間' },
    { id: '1y', name: '1年間' },
  ];

  const charts = [
    { id: 'revenue', name: '収益', icon: '💰' },
    { id: 'subscriptions', name: 'サブスクリプション', icon: '👥' },
    { id: 'usage', name: '使用量', icon: '📊' },
    { id: 'churn', name: 'チャーン率', icon: '📉' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // 課金指標のシミュレーション
      const mockMetrics: BillingMetrics = {
        period: '30日間',
        revenue: {
          total: 2450000,
          monthly: 980000,
          growth: 12.5,
        },
        subscriptions: {
          total: 1250,
          active: 1180,
          churn: 5.6,
          mrr: 980000,
        },
        usage: {
          aiPlans: 15420,
          collaborations: 8930,
          memories: 45600,
          storage: 1250,
        },
        conversion: {
          trialToPaid: 23.5,
          freeToPaid: 8.2,
          planUpgrade: 15.3,
        },
      };

      // 収益データのシミュレーション
      const mockRevenueData: RevenueData[] = [
        { date: '2024-01-01', revenue: 850000, subscriptions: 850 },
        { date: '2024-01-08', revenue: 920000, subscriptions: 920 },
        { date: '2024-01-15', revenue: 880000, subscriptions: 880 },
        { date: '2024-01-22', revenue: 950000, subscriptions: 950 },
        { date: '2024-01-29', revenue: 980000, subscriptions: 980 },
      ];

      // プラン分布のシミュレーション
      const mockPlanDistribution: PlanDistribution[] = [
        {
          planId: 'free',
          planName: 'フリープラン',
          count: 2500,
          percentage: 66.7,
          revenue: 0,
        },
        {
          planId: 'premium_monthly',
          planName: 'プレミアム（月額）',
          count: 800,
          percentage: 21.3,
          revenue: 784000,
        },
        {
          planId: 'premium_yearly',
          planName: 'プレミアム（年額）',
          count: 450,
          percentage: 12.0,
          revenue: 4410000,
        },
      ];

      // チャーンデータのシミュレーション
      const mockChurnData: ChurnData[] = [
        { month: '2023-10', churnRate: 6.2, lostSubscriptions: 45, totalSubscriptions: 725 },
        { month: '2023-11', churnRate: 5.8, lostSubscriptions: 42, totalSubscriptions: 724 },
        { month: '2023-12', churnRate: 7.1, lostSubscriptions: 52, totalSubscriptions: 732 },
        { month: '2024-01', churnRate: 5.6, lostSubscriptions: 41, totalSubscriptions: 732 },
      ];

      // データ読み込みのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMetrics(mockMetrics);
      setRevenueData(mockRevenueData);
      setPlanDistribution(mockPlanDistribution);
      setChurnData(mockChurnData);
      setIsLoading(false);
    };

    loadData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">分析データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">データが見つかりませんでした</p>
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
              <h1 className="text-2xl font-bold text-gray-900">課金指標分析</h1>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 主要指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">総収益</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(metrics.revenue.total)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600">
                +{formatPercentage(metrics.revenue.growth)}
              </span>
              <span className="text-sm text-gray-500">前月比</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">月次収益</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(metrics.revenue.monthly)}
            </div>
            <div className="text-sm text-gray-500">MRR</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">アクティブサブスク</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatNumber(metrics.subscriptions.active)}
            </div>
            <div className="text-sm text-gray-500">
              総数: {formatNumber(metrics.subscriptions.total)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">チャーン率</h3>
              <span className="text-2xl">📉</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatPercentage(metrics.subscriptions.churn)}
            </div>
            <div className="text-sm text-gray-500">月次</div>
          </div>
        </div>

        {/* チャート選択 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">分析チャート</h2>
          <div className="flex flex-wrap gap-2">
            {charts.map((chart) => (
              <button
                key={chart.id}
                onClick={() => setSelectedChart(chart.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedChart === chart.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{chart.icon}</span>
                {chart.name}
              </button>
            ))}
          </div>
        </div>

        {/* 収益チャート */}
        {selectedChart === 'revenue' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">収益推移</h3>
            <div className="h-64 flex items-end space-x-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t-lg w-full mb-2"
                    style={{
                      height: `${(data.revenue / Math.max(...revenueData.map((d) => d.revenue))) * 200}px`,
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 text-center">
                    <div className="font-medium">{formatCurrency(data.revenue)}</div>
                    <div>{new Date(data.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* サブスクリプションチャート */}
        {selectedChart === 'subscriptions' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">サブスクリプション推移</h3>
            <div className="h-64 flex items-end space-x-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-green-500 rounded-t-lg w-full mb-2"
                    style={{
                      height: `${(data.subscriptions / Math.max(...revenueData.map((d) => d.subscriptions))) * 200}px`,
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 text-center">
                    <div className="font-medium">{formatNumber(data.subscriptions)}</div>
                    <div>{new Date(data.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用量チャート */}
        {selectedChart === 'usage' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">使用量分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatNumber(metrics.usage.aiPlans)}
                </div>
                <div className="text-sm text-gray-600">AIプラン生成</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatNumber(metrics.usage.collaborations)}
                </div>
                <div className="text-sm text-gray-600">共同編集</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatNumber(metrics.usage.memories)}
                </div>
                <div className="text-sm text-gray-600">思い出記録</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {formatNumber(metrics.usage.storage)}GB
                </div>
                <div className="text-sm text-gray-600">ストレージ使用量</div>
              </div>
            </div>
          </div>
        )}

        {/* チャーン率チャート */}
        {selectedChart === 'churn' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">チャーン率推移</h3>
            <div className="h-64 flex items-end space-x-4">
              {churnData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-red-500 rounded-t-lg w-full mb-2"
                    style={{
                      height: `${(data.churnRate / Math.max(...churnData.map((d) => d.churnRate))) * 200}px`,
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 text-center">
                    <div className="font-medium">{formatPercentage(data.churnRate)}</div>
                    <div>{data.month}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* プラン分布 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">プラン分布</h3>
          <div className="space-y-4">
            {planDistribution.map((plan) => (
              <div
                key={plan.planId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{plan.planName}</h4>
                    <p className="text-sm text-gray-600">
                      {formatNumber(plan.count)}ユーザー ({formatPercentage(plan.percentage)})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatCurrency(plan.revenue)}</div>
                  <div className="text-sm text-gray-600">収益</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* コンバージョン指標 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">コンバージョン指標</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatPercentage(metrics.conversion.trialToPaid)}
              </div>
              <div className="text-sm text-gray-600">トライアル→有料</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {formatPercentage(metrics.conversion.freeToPaid)}
              </div>
              <div className="text-sm text-gray-600">フリー→有料</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {formatPercentage(metrics.conversion.planUpgrade)}
              </div>
              <div className="text-sm text-gray-600">プランアップグレード</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
