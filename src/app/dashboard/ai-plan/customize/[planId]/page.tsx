'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface CustomizableSpot {
  id: string;
  name: string;
  type: string;
  time: string;
  description: string;
  cost: number;
  duration: string;
  isRequired: boolean;
  alternatives: {
    name: string;
    type: string;
    cost: number;
    description: string;
  }[];
}

export default async function CustomizePlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}): Promise<ReactElement> {
  const { planId } = await params;
  const [spots, setSpots] = useState<CustomizableSpot[]>([
    {
      id: 'spot1',
      name: 'Blue Bottle Coffee 渋谷店',
      type: 'カフェ',
      time: '14:00-15:30',
      description: '香り高いコーヒーとおしゃれな空間でリラックスタイム',
      cost: 2000,
      duration: '1時間30分',
      isRequired: false,
      alternatives: [
        {
          name: 'スターバックス 渋谷店',
          type: 'カフェ',
          cost: 1500,
          description: '定番のコーヒーチェーンで安心の味',
        },
        {
          name: '猿田彦珈琲 渋谷店',
          type: 'カフェ',
          cost: 1800,
          description: '本格的なコーヒーと落ち着いた空間',
        },
      ],
    },
    {
      id: 'spot2',
      name: '渋谷スカイ',
      type: '展望台',
      time: '16:00-17:30',
      description: '東京の絶景を360度楽しめる展望台',
      cost: 2000,
      duration: '1時間30分',
      isRequired: true,
      alternatives: [
        {
          name: '東京タワー',
          type: '展望台',
          cost: 1200,
          description: '東京のシンボルタワーからの絶景',
        },
        {
          name: '六本木ヒルズ展望台',
          type: '展望台',
          cost: 1800,
          description: '都心の夜景を楽しめる展望台',
        },
      ],
    },
    {
      id: 'spot3',
      name: '隠れ家イタリアン トラットリア',
      type: 'レストラン',
      time: '18:30-20:30',
      description: '本格的なイタリア料理とワインでディナータイム',
      cost: 11000,
      duration: '2時間',
      isRequired: false,
      alternatives: [
        {
          name: '和食レストラン 銀座店',
          type: 'レストラン',
          cost: 8000,
          description: '伝統的な日本料理で特別なディナー',
        },
        {
          name: 'フレンチレストラン 恵比寿店',
          type: 'レストラン',
          cost: 12000,
          description: '本格的なフレンチ料理とワイン',
        },
      ],
    },
  ]);

  const [budget, setBudget] = useState(15000);
  const [totalTime, setTotalTime] = useState('6時間');
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<string, string>>({});

  const handleAlternativeSelect = (spotId: string, alternativeName: string) => {
    setSelectedAlternatives((prev) => ({
      ...prev,
      [spotId]: alternativeName,
    }));
  };

  const handleRemoveSpot = (spotId: string) => {
    setSpots((prev) => prev.filter((spot) => spot.id !== spotId));
  };

  const handleAddSpot = () => {
    // 新しいスポットを追加する処理
    alert('新しいスポットを追加する機能は準備中です');
  };

  const handleSaveCustomization = () => {
    // カスタマイズを保存する処理
    alert('カスタマイズを保存しました');
    // プラン一覧画面に遷移
    setTimeout(() => {
      window.location.href = '/dashboard/plans';
    }, 1000);
  };

  const handleStartCollaboration = () => {
    window.location.href = '/dashboard/collaboration';
  };

  const calculateTotalCost = () => {
    return spots.reduce((total, spot) => {
      const selectedAlt = selectedAlternatives[spot.id];
      if (selectedAlt) {
        const alternative = spot.alternatives.find((alt) => alt.name === selectedAlt);
        return total + (alternative?.cost || spot.cost);
      }
      return total + spot.cost;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">プランカスタマイズ</h1>
          <p className="text-xl text-gray-600">あなたの好みに合わせてプランを調整しましょう</p>
        </div>

        {/* 予算・時間サマリー */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600 mb-2">
                ¥{calculateTotalCost().toLocaleString()}
              </div>
              <div className="text-gray-600">総予算</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalTime}</div>
              <div className="text-gray-600">総時間</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{spots.length}</div>
              <div className="text-gray-600">スポット数</div>
            </div>
          </div>
        </div>

        {/* スポット一覧 */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">デートスポット</h2>
            <Button onClick={handleAddSpot} variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              スポット追加
            </Button>
          </div>

          {spots.map((spot, index) => (
            <div key={spot.id} className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{spot.name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {spot.type}
                    </span>
                    {spot.isRequired && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                        必須
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>⏱️ {spot.time}</span>
                    <span>💰 ¥{spot.cost.toLocaleString()}</span>
                    <span>🕐 {spot.duration}</span>
                  </div>
                  <p className="text-gray-600">{spot.description}</p>
                </div>
                {!spot.isRequired && (
                  <Button
                    onClick={() => handleRemoveSpot(spot.id)}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                )}
              </div>

              {/* 代替案 */}
              {spot.alternatives.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">代替案</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {spot.alternatives.map((alternative, altIndex) => (
                      <label
                        key={altIndex}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAlternatives[spot.id] === alternative.name
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`spot-${spot.id}`}
                          value={alternative.name}
                          checked={selectedAlternatives[spot.id] === alternative.name}
                          onChange={() => handleAlternativeSelect(spot.id, alternative.name)}
                          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{alternative.name}</span>
                            <span className="text-sm text-gray-500">
                              ¥{alternative.cost.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alternative.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* カスタマイズオプション */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">追加オプション</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700">写真撮影スポットを追加</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700">雨の日対応プランを準備</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700">記念日サプライズを追加</span>
            </label>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleSaveCustomization} variant="outline" className="w-full sm:w-auto">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            カスタマイズを保存
          </Button>
          <Button
            onClick={handleStartCollaboration}
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
