'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface Spot {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  openingHours: {
    day: string;
    hours: string;
  }[];
  contact: {
    phone?: string;
    website?: string;
    instagram?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  isBookmarked: boolean;
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const { id } = await params;
  const [spot, setSpot] = useState<Spot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadSpotData();
  }, [id]);

  const loadSpotData = async () => {
    setIsLoading(true);

    // スポットデータのシミュレーション
    const mockSpot: Spot = {
      id: id,
      name: 'ロマンチックなレストラン「Bella Vista」',
      category: 'レストラン',
      description:
        '夜景が美しい高層ビルの最上階にある、カップルに人気のイタリアンレストラン。シェフ自慢のコース料理と、東京の夜景を一望できる特別な空間で、特別な夜をお過ごしください。',
      address: '東京都港区六本木1-1-1 六本木ヒルズ 52F',
      priceRange: '¥8,000-¥15,000',
      rating: 4.8,
      reviewCount: 1247,
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      ],
      features: [
        '夜景が美しい',
        'プライベート空間',
        'バレンタイン特典',
        '記念日対応',
        '駐車場完備',
        'Wi-Fi完備',
      ],
      openingHours: [
        { day: '月曜日', hours: '17:00-23:00' },
        { day: '火曜日', hours: '17:00-23:00' },
        { day: '水曜日', hours: '17:00-23:00' },
        { day: '木曜日', hours: '17:00-23:00' },
        { day: '金曜日', hours: '17:00-24:00' },
        { day: '土曜日', hours: '16:00-24:00' },
        { day: '日曜日', hours: '16:00-22:00' },
      ],
      contact: {
        phone: '03-1234-5678',
        website: 'https://bellavista.example.com',
        instagram: '@bellavista_tokyo',
      },
      location: {
        lat: 35.6654,
        lng: 139.7296,
      },
      isBookmarked: false,
    };

    // データ読み込みのシミュレーション
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSpot(mockSpot);
    setIsBookmarked(mockSpot.isBookmarked);
    setIsLoading(false);
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    alert(isBookmarked ? 'ブックマークを削除しました' : 'ブックマークに追加しました');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: spot?.name,
        text: spot?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('リンクをコピーしました');
    }
  };

  const handleCreatePlan = () => {
    // AIプラン作成画面への遷移
    window.location.href = '/dashboard/ai-plan';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="relative">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-rose-500 border-r-pink-500"
            role="status"
            aria-label="読み込み中"
          />
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-30" />
        </div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">スポットが見つかりません</h1>
          <Button onClick={() => window.history.back()} variant="outline">
            戻る
          </Button>
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
              <h1 className="text-2xl font-bold text-gray-900">スポット詳細</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleBookmarkToggle} variant="outline" size="sm">
                {isBookmarked ? '❤️ ブックマーク済み' : '🤍 ブックマーク'}
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm">
                📤 共有
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* メイン情報 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* 画像ギャラリー */}
          <div className="relative h-96 bg-gray-200">
            <img src={spot.images[0]} alt={spot.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4">
              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900 shadow-lg">
                {spot.category}
              </span>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900 shadow-lg">
                ⭐ {spot.rating} ({spot.reviewCount}件のレビュー)
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{spot.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{spot.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📍 {spot.address}</span>
                  <span>💰 {spot.priceRange}</span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-4 mb-8">
              <Button
                onClick={handleCreatePlan}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-xl"
              >
                🤖 AIプランを作成
              </Button>
              <Button
                onClick={() => (window.location.href = '/dashboard/collaboration')}
                variant="outline"
                className="px-8 py-3 text-lg font-bold rounded-xl"
              >
                👥 共同編集で追加
              </Button>
            </div>

            {/* 特徴 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">特徴</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {spot.features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center"
                  >
                    <span className="text-sm font-medium text-rose-800">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 営業時間 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">営業時間</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {spot.openingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-medium text-gray-900">{schedule.day}</span>
                      <span className="text-gray-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 連絡先 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">連絡先・アクセス</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {spot.contact.phone && (
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📞</span>
                      <span className="text-gray-700">{spot.contact.phone}</span>
                    </div>
                  )}
                  {spot.contact.website && (
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🌐</span>
                      <a
                        href={spot.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {spot.contact.website}
                      </a>
                    </div>
                  )}
                  {spot.contact.instagram && (
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📷</span>
                      <a
                        href={`https://instagram.com/${spot.contact.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800 underline"
                      >
                        {spot.contact.instagram}
                      </a>
                    </div>
                  )}
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">住所</div>
                  <div className="font-medium text-gray-900">{spot.address}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 関連スポット */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">関連スポット</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => (window.location.href = `/dashboard/portal/spots/spot-${index}`)}
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">関連スポット {index}</h3>
                  <p className="text-sm text-gray-600 mb-2">カップルにおすすめの場所</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">⭐ 4.5</span>
                    <span className="text-sm text-gray-500">💰 ¥5,000-¥8,000</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
