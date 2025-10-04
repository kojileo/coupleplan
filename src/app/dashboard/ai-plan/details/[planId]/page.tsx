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
    address: string;
    cost: number;
    duration: string;
  }[];
  totalCost: number;
  totalTime: string;
  transportation: {
    method: string;
    cost: number;
    time: string;
  }[];
  tips: string[];
}

export default function PlanDetailsPage({ params }: { params: { planId: string } }): ReactElement {
  const [plan] = useState<DatePlan>({
    id: params.planId,
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
        image: '/api/placeholder/400/300',
        address: '東京都渋谷区恵比寿1-32-26',
        cost: 2000,
        duration: '1時間30分',
      },
      {
        name: '渋谷スカイ',
        type: '展望台',
        time: '16:00-17:30',
        description: '東京の絶景を360度楽しめる展望台',
        image: '/api/placeholder/400/300',
        address: '東京都渋谷区渋谷2-1-1',
        cost: 2000,
        duration: '1時間30分',
      },
      {
        name: '隠れ家イタリアン トラットリア',
        type: 'レストラン',
        time: '18:30-20:30',
        description: '本格的なイタリア料理とワインでディナータイム',
        image: '/api/placeholder/400/300',
        address: '東京都渋谷区恵比寿3-5-1',
        cost: 11000,
        duration: '2時間',
      },
    ],
    totalCost: 15000,
    totalTime: '6時間',
    transportation: [
      {
        method: 'JR山手線',
        cost: 200,
        time: '15分',
      },
      {
        method: '徒歩',
        cost: 0,
        time: '5分',
      },
    ],
    tips: [
      '渋谷スカイは事前予約が必要です',
      'レストランは2週間前の予約をおすすめします',
      '雨の日は屋内施設を中心に調整可能です',
    ],
  });

  const handleStartPlan = () => {
    window.location.href = '/dashboard/collaboration';
  };

  const handleCustomize = () => {
    window.location.href = `/dashboard/ai-plan/customize/${plan.id}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: plan.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('リンクをコピーしました');
    }
  };

  const handleSave = () => {
    // プランを保存する処理
    alert('プランを保存しました');
    // プラン一覧画面に遷移
    setTimeout(() => {
      window.location.href = '/dashboard/plans';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{plan.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>⏱️ {plan.totalTime}</span>
                <span>💰 {plan.budget}</span>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{plan.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <Button onClick={handleSave} variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                保存
              </Button>
              <Button onClick={handleShare} variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                共有
              </Button>
            </div>
          </div>

          {/* ハイライト */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">ハイライト</h3>
            <div className="flex flex-wrap gap-2">
              {plan.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-rose-100 text-rose-700 text-sm rounded-full"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* スポット詳細 */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">デートスポット</h2>
          {plan.spots.map((spot, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{spot.name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {spot.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>⏱️ {spot.time}</span>
                    <span>💰 ¥{spot.cost.toLocaleString()}</span>
                    <span>🕐 {spot.duration}</span>
                  </div>
                  <p className="text-gray-600 mb-3">{spot.description}</p>
                  <p className="text-sm text-gray-500">📍 {spot.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 交通手段 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">交通手段</h3>
          <div className="space-y-3">
            {plan.transportation.map((transport, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{transport.method}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>💰 ¥{transport.cost.toLocaleString()}</span>
                  <span>⏱️ {transport.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ヒント */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">💡 デートのヒント</h3>
          <ul className="space-y-2">
            {plan.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2 text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleCustomize} variant="outline" className="w-full sm:w-auto">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            カスタマイズ
          </Button>
          <Button
            onClick={handleStartPlan}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            共同編集を開始
          </Button>
        </div>
      </div>
    </div>
  );
}
