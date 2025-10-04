'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface AppFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  isAvailable: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: number;
}

export default function AppDownloadPage(): ReactElement {
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'web'>('ios');
  const [isDownloading, setIsDownloading] = useState(false);

  const features: AppFeature[] = [
    {
      id: 'ai-planning',
      title: 'AIデートプラン提案',
      description: 'AIがあなたの好みに合わせて最適なデートプランを提案します',
      icon: '🤖',
      isAvailable: true,
    },
    {
      id: 'collaboration',
      title: 'カップル共同編集',
      description: 'パートナーと一緒にリアルタイムでデートプランを作成できます',
      icon: '👥',
      isAvailable: true,
    },
    {
      id: 'conflict-resolution',
      title: 'AI喧嘩仲裁',
      description: '関係修復のためのAIサポートで、より良い関係を築けます',
      icon: '💕',
      isAvailable: true,
    },
    {
      id: 'date-canvas',
      title: 'Date Canvas',
      description: '思い出を美しいキャンバスに記録して共有できます',
      icon: '🎨',
      isAvailable: true,
    },
    {
      id: 'offline-mode',
      title: 'オフラインモード',
      description: 'インターネット接続なしでもデートプランを確認できます',
      icon: '📱',
      isAvailable: true,
    },
    {
      id: 'notifications',
      title: 'スマート通知',
      description: 'デートのリマインダーや天気予報をお知らせします',
      icon: '🔔',
      isAvailable: true,
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: '田中さん',
      avatar: '👩',
      rating: 5,
      comment: 'AIが提案してくれるデートプランが本当に素敵で、毎回新しい発見があります！',
      date: Date.now() - 86400000,
    },
    {
      id: '2',
      name: '佐藤さん',
      avatar: '👨',
      rating: 5,
      comment: 'パートナーと一緒にプランを作るのが楽しくて、関係も深まりました。',
      date: Date.now() - 172800000,
    },
    {
      id: '3',
      name: '山田さん',
      avatar: '👩',
      rating: 5,
      comment: '喧嘩した時もAIが仲裁してくれて、お互いの気持ちを理解できました。',
      date: Date.now() - 259200000,
    },
  ];

  const handleDownload = () => {
    setIsDownloading(true);

    // ダウンロードのシミュレーション
    setTimeout(() => {
      if (selectedPlatform === 'ios') {
        window.open('https://apps.apple.com/app/coupleplan', '_blank');
      } else if (selectedPlatform === 'android') {
        window.open('https://play.google.com/store/apps/details?id=com.coupleplan', '_blank');
      } else {
        window.location.href = '/dashboard';
      }
      setIsDownloading(false);
    }, 2000);
  };

  const handleQRCodeClick = () => {
    // QRコードを表示するモーダルを開く
    alert('QRコードを表示します（実装予定）');
  };

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
              <h1 className="text-2xl font-bold text-gray-900">アプリダウンロード</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mb-6">
            <span className="text-4xl">💕</span>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">CouplePlanアプリ</h1>
          <p className="text-2xl text-gray-600 mb-8">カップルの絆を深める統合プラットフォーム</p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            より多くの機能をアプリでお楽しみください。AIデートプラン提案、共同編集、関係修復サポートなど、カップルのための特別な機能が満載です。
          </p>
        </div>

        {/* プラットフォーム選択 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ダウンロード方法を選択
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setSelectedPlatform('ios')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPlatform === 'ios'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">iOS</h3>
                <p className="text-sm text-gray-600">App Storeからダウンロード</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedPlatform('android')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPlatform === 'android'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Android</h3>
                <p className="text-sm text-gray-600">Google Playからダウンロード</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedPlatform('web')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPlatform === 'web'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🌐</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Web版</h3>
                <p className="text-sm text-gray-600">ブラウザで利用開始</p>
              </div>
            </button>
          </div>
        </div>

        {/* アプリ機能 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">アプリの主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`p-6 rounded-xl border-2 ${
                  feature.isAvailable
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      feature.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {feature.isAvailable ? '利用可能' : '準備中'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ユーザーレビュー */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">ユーザーの声</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">"{testimonial.comment}"</p>
                <p className="text-xs text-gray-500">
                  {new Date(testimonial.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ダウンロードボタン */}
        <div className="text-center">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-12 py-4 text-lg font-bold rounded-xl shadow-xl"
          >
            {isDownloading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>ダウンロード中...</span>
              </div>
            ) : (
              <>
                {selectedPlatform === 'ios' && 'App Storeでダウンロード'}
                {selectedPlatform === 'android' && 'Google Playでダウンロード'}
                {selectedPlatform === 'web' && 'Web版を開始'}
              </>
            )}
          </Button>

          <div className="mt-6">
            <button
              onClick={handleQRCodeClick}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              QRコードでダウンロード
            </button>
          </div>
        </div>

        {/* 追加情報 */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">アプリについて</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">対応OS</h4>
                <p>iOS 14.0以上</p>
                <p>Android 8.0以上</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">サイズ</h4>
                <p>iOS: 約50MB</p>
                <p>Android: 約45MB</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">料金</h4>
                <p>基本機能: 無料</p>
                <p>プレミアム: 月額¥980</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
