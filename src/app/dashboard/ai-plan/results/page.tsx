'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface DatePlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  budget: string;
  rating: number;
  highlights: string[];
  spots: {
    name: string;
    type: string;
    time: string;
    description: string;
    image: string;
  }[];
  totalCost: number;
  totalTime: string;
}

export default function AIPlanResultsPage(): ReactElement {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plans] = useState<DatePlan[]>([
    {
      id: 'plan1',
      title: 'ロマンチックな渋谷デート',
      description: 'カフェ巡りから夜景まで、二人だけの特別な時間を過ごせるプラン',
      duration: '6時間',
      budget: '15,000円',
      rating: 4.8,
      highlights: ['人気カフェ巡り', '渋谷スカイからの夜景', '隠れ家レストラン'],
      spots: [
        {
          name: 'Blue Bottle Coffee 渋谷店',
          type: 'カフェ',
          time: '14:00-15:30',
          description: '香り高いコーヒーとおしゃれな空間でリラックスタイム',
          image: '/api/placeholder/300/200',
        },
        {
          name: '渋谷スカイ',
          type: '展望台',
          time: '16:00-17:30',
          description: '東京の絶景を360度楽しめる展望台',
          image: '/api/placeholder/300/200',
        },
        {
          name: '隠れ家イタリアン トラットリア',
          type: 'レストラン',
          time: '18:30-20:30',
          description: '本格的なイタリア料理とワインでディナータイム',
          image: '/api/placeholder/300/200',
        },
      ],
      totalCost: 15000,
      totalTime: '6時間',
    },
    {
      id: 'plan2',
      title: 'アートとグルメの新宿散策',
      description: '美術館から老舗レストランまで、文化的で美味しいデートプラン',
      duration: '8時間',
      budget: '20,000円',
      rating: 4.6,
      highlights: ['現代美術館', '老舗レストラン', '新宿御苑散策'],
      spots: [
        {
          name: '東京都現代美術館',
          type: '美術館',
          time: '10:00-12:00',
          description: '現代アートの展示を楽しみながら芸術に触れる',
          image: '/api/placeholder/300/200',
        },
        {
          name: '新宿御苑',
          type: '公園',
          time: '12:30-14:00',
          description: '都心のオアシスで自然を楽しむピクニック',
          image: '/api/placeholder/300/200',
        },
        {
          name: '老舗割烹 新宿店',
          type: 'レストラン',
          time: '18:00-20:00',
          description: '伝統的な日本料理で特別なディナー',
          image: '/api/placeholder/300/200',
        },
      ],
      totalCost: 20000,
      totalTime: '8時間',
    },
    {
      id: 'plan3',
      title: '自然と温泉の箱根デート',
      description: '箱根の自然を満喫しながら、温泉でリラックスできる贅沢プラン',
      duration: '12時間',
      budget: '35,000円',
      rating: 4.9,
      highlights: ['箱根ロープウェイ', '温泉旅館', '芦ノ湖クルーズ'],
      spots: [
        {
          name: '箱根ロープウェイ',
          type: '観光',
          time: '10:00-11:30',
          description: '富士山と芦ノ湖の絶景を空中散歩',
          image: '/api/placeholder/300/200',
        },
        {
          name: '芦ノ湖クルーズ',
          type: '観光',
          time: '12:00-13:30',
          description: '海賊船で芦ノ湖をクルーズ',
          image: '/api/placeholder/300/200',
        },
        {
          name: '箱根温泉旅館',
          type: '宿泊',
          time: '15:00-翌日',
          description: '露天風呂付き客室でゆったりと過ごす',
          image: '/api/placeholder/300/200',
        },
      ],
      totalCost: 35000,
      totalTime: '12時間',
    },
  ]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleViewDetails = (planId: string) => {
    window.location.href = `/dashboard/ai-plan/details/${planId}`;
  };

  const handleRegenerate = () => {
    window.location.href = '/dashboard/ai-plan';
  };

  const handleCustomize = (planId: string) => {
    window.location.href = `/dashboard/ai-plan/customize/${planId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">AIが提案するデートプラン</h1>
          <p className="text-xl text-gray-600">あなたの好みに合わせて3つのプランを生成しました</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'ring-4 ring-rose-500 transform scale-105'
                  : 'hover:shadow-2xl hover:transform hover:scale-105'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.title}</h3>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{plan.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {plan.duration}</span>
                  <span>💰 {plan.budget}</span>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">ハイライト</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.highlights.map((highlight, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-rose-100 text-rose-700 text-xs rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    variant={selectedPlan === plan.id ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {selectedPlan === plan.id ? '選択中' : '選択する'}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleViewDetails(plan.id)}
                      variant="outline"
                      className="text-sm"
                    >
                      詳細を見る
                    </Button>
                    <Button
                      onClick={() => handleCustomize(plan.id)}
                      variant="outline"
                      className="text-sm"
                    >
                      カスタマイズ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRegenerate} variant="outline" className="w-full sm:w-auto">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            別のプランを生成
          </Button>
          {selectedPlan && (
            <Button
              onClick={() => handleViewDetails(selectedPlan)}
              className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600"
            >
              選択したプランを確認
            </Button>
          )}
        </div>

        {/* フィードバック */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">プランはいかがでしたか？</h3>
          <p className="text-gray-600 mb-6">
            フィードバックをいただくことで、より良いプランを提案できるようになります
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="text-sm">
              👍 気に入った
            </Button>
            <Button variant="outline" className="text-sm">
              👎 改善が必要
            </Button>
            <Button variant="outline" className="text-sm">
              💡 提案がある
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
