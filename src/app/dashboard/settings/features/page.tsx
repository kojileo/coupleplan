'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  isUnlocked: boolean;
  isPremium: boolean;
  requiredPlan: string;
  icon: string;
  benefits: string[];
  usage?: {
    current: number;
    limit: number;
    percentage: number;
  };
  unlockDate?: number;
  trialAvailable: boolean;
  trialDays?: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export default function FeaturesPage(): ReactElement {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const categories = [
    { id: 'all', name: 'すべて', icon: '📋' },
    { id: 'ai', name: 'AI機能', icon: '🤖' },
    { id: 'collaboration', name: '共同編集', icon: '👥' },
    { id: 'analytics', name: '分析・レポート', icon: '📊' },
    { id: 'customization', name: 'カスタマイズ', icon: '🎨' },
    { id: 'premium', name: 'プレミアム', icon: '⭐' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // 機能データのシミュレーション
      const mockFeatures: Feature[] = [
        {
          id: 'ai_unlimited',
          name: '無制限AIデートプラン生成',
          description: 'AIがあなたの好みに合わせて無制限にデートプランを提案します',
          category: 'ai',
          isUnlocked: true,
          isPremium: true,
          requiredPlan: 'premium',
          icon: '🤖',
          benefits: [
            '無制限のプラン生成',
            '高度なパーソナライゼーション',
            'リアルタイム最適化',
            '季節・天候対応',
          ],
          usage: {
            current: 45,
            limit: -1,
            percentage: 0,
          },
          unlockDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
          trialAvailable: false,
        },
        {
          id: 'ai_basic',
          name: '基本AIデートプラン生成',
          description: '月3回までAIデートプランを生成できます',
          category: 'ai',
          isUnlocked: true,
          isPremium: false,
          requiredPlan: 'free',
          icon: '🤖',
          benefits: [
            '月3回のプラン生成',
            '基本的なパーソナライゼーション',
            'シンプルなインターフェース',
          ],
          usage: {
            current: 2,
            limit: 3,
            percentage: 66.7,
          },
          trialAvailable: false,
        },
        {
          id: 'realtime_collaboration',
          name: 'リアルタイム共同編集',
          description: 'パートナーとリアルタイムでデートプランを編集できます',
          category: 'collaboration',
          isUnlocked: true,
          isPremium: true,
          requiredPlan: 'premium',
          icon: '👥',
          benefits: ['リアルタイム同期', '同時編集対応', '変更履歴管理', 'コメント機能'],
          usage: {
            current: 23,
            limit: -1,
            percentage: 0,
          },
          unlockDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
          trialAvailable: false,
        },
        {
          id: 'basic_collaboration',
          name: '基本共同編集',
          description: 'パートナーとデートプランを共有・編集できます',
          category: 'collaboration',
          isUnlocked: true,
          isPremium: false,
          requiredPlan: 'free',
          icon: '👥',
          benefits: ['プラン共有', '基本的な編集機能', 'コメント機能'],
          usage: {
            current: 5,
            limit: 5,
            percentage: 100,
          },
          trialAvailable: false,
        },
        {
          id: 'advanced_analytics',
          name: '高度な関係分析',
          description: 'AIがあなたの関係性を深く分析し、改善提案を行います',
          category: 'analytics',
          isUnlocked: false,
          isPremium: true,
          requiredPlan: 'premium',
          icon: '📊',
          benefits: ['感情分析', 'コミュニケーションパターン分析', '関係性スコア', '改善提案'],
          trialAvailable: true,
          trialDays: 7,
        },
        {
          id: 'basic_analytics',
          name: '基本分析',
          description: 'デートの履歴と基本的な統計を表示します',
          category: 'analytics',
          isUnlocked: true,
          isPremium: false,
          requiredPlan: 'free',
          icon: '📊',
          benefits: ['デート履歴', '基本統計', 'シンプルなグラフ'],
          trialAvailable: false,
        },
        {
          id: 'custom_themes',
          name: 'カスタムテーマ',
          description: 'アプリの見た目を自由にカスタマイズできます',
          category: 'customization',
          isUnlocked: false,
          isPremium: true,
          requiredPlan: 'premium',
          icon: '🎨',
          benefits: ['カラーテーマ', 'フォント変更', 'レイアウト調整', '背景画像設定'],
          trialAvailable: true,
          trialDays: 3,
        },
        {
          id: 'priority_support',
          name: '優先サポート',
          description: '24時間以内の優先サポートを受けることができます',
          category: 'premium',
          isUnlocked: false,
          isPremium: true,
          requiredPlan: 'premium',
          icon: '⭐',
          benefits: ['24時間以内の対応', '優先チケット', '電話サポート', '専任サポート担当'],
          trialAvailable: false,
        },
        {
          id: 'unlimited_memories',
          name: '無制限思い出記録',
          description: 'Date Canvasで無制限に思い出を記録できます',
          category: 'premium',
          isUnlocked: true,
          isPremium: true,
          requiredPlan: 'premium',
          icon: '💝',
          benefits: ['無制限の思い出記録', '高画質画像保存', '動画サポート', '音声メモ'],
          usage: {
            current: 156,
            limit: 1000,
            percentage: 15.6,
          },
          unlockDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
          trialAvailable: false,
        },
        {
          id: 'limited_memories',
          name: '基本思い出記録',
          description: '50個まで思い出を記録できます',
          category: 'premium',
          isUnlocked: true,
          isPremium: false,
          requiredPlan: 'free',
          icon: '💝',
          benefits: ['50個の思い出記録', '基本画像保存', 'テキストメモ'],
          usage: {
            current: 12,
            limit: 50,
            percentage: 24,
          },
          trialAvailable: false,
        },
      ];

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
            '基本分析',
            '50個の思い出記録',
            '5GBストレージ',
          ],
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
            '無制限思い出記録',
            'カスタムテーマ',
            '優先サポート',
          ],
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
            '無制限思い出記録',
            'カスタムテーマ',
            '優先サポート',
            '2ヶ月分お得',
          ],
        },
      ];

      // データ読み込みのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFeatures(mockFeatures);
      setAvailablePlans(mockPlans);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleTrialStart = async (featureId: string) => {
    try {
      // トライアル開始のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFeatures((prev) =>
        prev.map((feature) =>
          feature.id === featureId
            ? { ...feature, isUnlocked: true, unlockDate: Date.now() }
            : feature
        )
      );

      alert('トライアルを開始しました！');
    } catch (error) {
      alert('トライアルの開始に失敗しました。');
    }
  };

  const handleUpgrade = (feature: Feature) => {
    setSelectedFeature(feature);
    setShowUpgradeModal(true);
  };

  const filteredFeatures = features.filter((feature) => {
    if (selectedCategory !== 'all' && feature.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const getCategoryIcon = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.icon || '📋';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">機能情報を読み込み中...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">機能解放</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* カテゴリフィルター */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">カテゴリ</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 機能一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`bg-white rounded-2xl shadow-xl p-6 transition-all ${
                feature.isUnlocked ? 'border-2 border-green-200' : 'border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{feature.name}</h3>
                    <span className="text-sm text-gray-500">
                      {getCategoryName(feature.category)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {feature.isUnlocked ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      解放済み
                    </span>
                  ) : feature.isPremium ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      プレミアム
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      基本
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{feature.description}</p>

              {/* 使用量表示 */}
              {feature.usage && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">使用量</span>
                    <span className="text-sm text-gray-500">
                      {feature.usage.limit === -1
                        ? '無制限'
                        : `${feature.usage.current}/${feature.usage.limit}`}
                    </span>
                  </div>
                  {feature.usage.limit !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          feature.usage.percentage >= 90
                            ? 'bg-red-500'
                            : feature.usage.percentage >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${feature.usage.percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {/* メリット一覧 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">主な機能</h4>
                <ul className="space-y-1">
                  {feature.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                  {feature.benefits.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{feature.benefits.length - 3}個の機能
                    </li>
                  )}
                </ul>
              </div>

              {/* アクションボタン */}
              <div className="mt-6">
                {feature.isUnlocked ? (
                  <div className="text-center">
                    <span className="text-green-600 font-medium">
                      {feature.unlockDate
                        ? `解放日: ${new Date(feature.unlockDate).toLocaleDateString()}`
                        : '利用可能'}
                    </span>
                  </div>
                ) : feature.trialAvailable ? (
                  <Button
                    onClick={() => handleTrialStart(feature.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    {feature.trialDays}日間トライアル
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(feature)}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    アップグレード
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* アップグレードモーダル */}
      {showUpgradeModal && selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-4 w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{selectedFeature.name}を解放</h3>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">{selectedFeature.description}</p>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">含まれる機能</h4>
                <ul className="space-y-1">
                  {selectedFeature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-blue-800">
                      <span className="text-blue-500">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {availablePlans
                .filter((plan) => plan.id !== 'free')
                .map((plan) => (
                  <div
                    key={plan.id}
                    className={`border-2 rounded-lg p-4 ${
                      plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <div className="text-center mb-2">
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          人気
                        </span>
                      </div>
                    )}

                    <h4 className="font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {formatCurrency(plan.price, plan.currency)}
                      <span className="text-sm text-gray-500">
                        /{plan.billingCycle === 'monthly' ? '月' : '年'}
                      </span>
                    </div>

                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span className="text-green-500">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setShowUpgradeModal(false)}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  alert('アップグレードページに移動します');
                  setShowUpgradeModal(false);
                }}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                アップグレード
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
