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
  // 1つの最適なプランのみを表示
  const [plan] = useState<DatePlan>({
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
  });

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
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">AIが提案する最適なプラン</h1>
          <p className="text-xl text-gray-600">
            あなたの好みに合わせて、最適なデートプランを生成しました
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-100 rounded-full">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-purple-700">Gemini 2.5 思考モード搭載</span>
          </div>
        </div>

        {/* プランカード（中央配置） */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
            <div className="p-8">
              {/* タイトルと評価 */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.title}</h3>
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-bold text-gray-700">{plan.rating}</span>
                </div>
              </div>

              {/* 説明 */}
              <p className="text-lg text-gray-600 mb-6">{plan.description}</p>

              {/* 予算と時間 */}
              <div className="flex items-center justify-center gap-8 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="text-sm text-gray-500">所要時間</div>
                  <div className="text-lg font-bold text-gray-900">{plan.duration}</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-sm text-gray-500">予算</div>
                  <div className="text-lg font-bold text-gray-900">{plan.budget}</div>
                </div>
              </div>

              {/* ハイライト */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">プランのハイライト</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {plan.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-rose-100 to-purple-100 text-rose-700 text-sm font-medium rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="space-y-3 mt-8">
                <Button
                  onClick={() => handleViewDetails(plan.id)}
                  className="w-full py-4 text-lg bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600"
                >
                  プラン詳細を見る
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleCustomize(plan.id)}
                    variant="outline"
                    className="py-3"
                  >
                    カスタマイズ
                  </Button>
                  <Button onClick={handleRegenerate} variant="outline" className="py-3">
                    別のプランを生成
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フィードバック（中央配置） */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              プランはいかがでしたか？
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              フィードバックをいただくことで、より良いプランを提案できるようになります
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
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
    </div>
  );
}
