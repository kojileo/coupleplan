import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { EmergencyButton } from '@/components/features/emergency/EmergencyButton';

export const metadata: Metadata = {
  title: 'お手洗い検索・会話ネタ提供機能 - デート中の困ったを瞬間解決',
  description:
    '現在地周辺のお手洗いを瞬時に検索し、デート中の気まずい沈黙を救う会話ネタを提供。カップルのデートをサポートする緊急ヘルプ機能をご紹介します。',
  keywords:
    'お手洗い検索, トイレ検索, 会話ネタ, デート, カップル, 緊急ヘルプ, 現在地, 位置情報, Google マップ',
  openGraph: {
    title: 'お手洗い検索・会話ネタ提供機能 - デート中の困ったを瞬間解決',
    description: '現在地周辺のお手洗いを瞬時に検索し、デート中の気まずい沈黙を救う会話ネタを提供。',
    url: 'https://coupleplan.com/features',
  },
  twitter: {
    title: 'お手洗い検索・会話ネタ提供機能 - デート中の困ったを瞬間解決',
    description: '現在地周辺のお手洗いを瞬時に検索し、デート中の気まずい沈黙を救う会話ネタを提供。',
  },
};

export default function FeaturesPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-rose-600">
              Couple Plan
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ホーム
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                アプリについて
              </Link>
              <Link
                href="/login"
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600"
              >
                ログイン
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        {/* ヒーローセクション */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              デート中の「困った」を
              <br />
              <span className="text-rose-500">瞬間解決</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              お手洗い検索機能と会話ネタ提供機能で、デート中の急な困りごとをサポート。
              <br />
              せっかくのデート時間を、より楽しく快適に過ごしましょう。
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/signup"
                className="bg-rose-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-rose-600 transition-colors"
              >
                無料で始める
              </Link>
              <button className="border-2 border-rose-500 text-rose-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-rose-50 transition-colors">
                デモを見る
              </button>
            </div>
          </div>
        </section>

        {/* お手洗い検索機能セクション */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-6">
                  <span className="mr-2">🚻</span>
                  お手洗い検索機能
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  現在地周辺の
                  <br />
                  お手洗いを瞬時に検索
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  デート中に急にお手洗いが必要になっても大丈夫。
                  位置情報を利用して、現在地から最も近いお手洗いを距離順で表示。
                  無料・有料、車椅子対応の有無も一目で分かります。
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">現在地から距離順で表示</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">無料・有料の表示</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">車椅子対応情報</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Google マップで道順案内</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <span className="mr-2">🚻</span>
                      お手洗い検索
                    </h3>
                    <span className="text-gray-500">×</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">現在地周辺のお手洗い情報</p>
                  <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg mb-4">
                    🔍 お手洗いを検索
                  </button>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-gray-900">JR新宿駅 南口</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          📍 150m
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          無料
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          ♿ 車椅子対応
                        </span>
                      </div>
                      <button className="w-full bg-gray-100 text-gray-700 py-1 px-2 rounded text-sm mt-2">
                        🗺️ Google マップで開く
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 会話ネタ提供機能セクション */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center">
                        <span className="mr-2">💬</span>
                        会話ネタ
                      </h3>
                      <span className="text-gray-500">×</span>
                    </div>
                    <div className="space-y-3">
                      <button className="w-full bg-blue-50 text-blue-700 py-3 px-4 rounded-lg text-left">
                        <span className="mr-2">☀️</span>
                        <strong>軽い話題</strong>
                        <div className="text-sm text-blue-600 mt-1">気軽に話せるトピック</div>
                      </button>
                      <button className="w-full bg-purple-50 text-purple-700 py-3 px-4 rounded-lg text-left">
                        <span className="mr-2">🌙</span>
                        <strong>深い話題</strong>
                        <div className="text-sm text-purple-600 mt-1">お互いを知り合える質問</div>
                      </button>
                      <button className="w-full bg-yellow-50 text-yellow-700 py-3 px-4 rounded-lg text-left">
                        <span className="mr-2">🎉</span>
                        <strong>楽しい話題</strong>
                        <div className="text-sm text-yellow-600 mt-1">盛り上がること間違いなし</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-6">
                  <span className="mr-2">💬</span>
                  会話ネタ提供機能
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  気まずい沈黙を救う
                  <br />
                  <span className="text-purple-500">会話ネタ</span>を瞬時に提案
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  デート中に会話が途切れてしまっても大丈夫。
                  カテゴリ別の会話ネタで、二人の距離をぐっと縮める質問を提案します。
                  関係性を深める質問から盛り上がる話題まで豊富に用意。
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">6つのカテゴリから選択</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">関係性を深める質問</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">盛り上がる話題</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">使い方のコツ付き</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">簡単3ステップで使える</h2>
              <p className="text-xl text-gray-600">緊急ヘルプボタンから瞬時にアクセス</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">右下のボタンをタップ</h3>
                <p className="text-gray-600">
                  画面右下の🆘緊急ヘルプボタンをタップして、メニューを開きます。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">機能を選択</h3>
                <p className="text-gray-600">
                  「お手洗い検索」または「会話ネタ」から、必要な機能を選択します。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">瞬間解決</h3>
                <p className="text-gray-600">
                  お手洗い情報や会話ネタが瞬時に表示され、デートの困りごとを解決。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* よくある質問セクション */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">よくある質問</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  お手洗い検索で位置情報は必要ですか？
                </h3>
                <p className="text-gray-600">
                  より正確な検索のために位置情報の使用をお勧めしますが、位置情報が利用できない場合でも主要駅周辺のお手洗い情報を表示します。
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  会話ネタはどれくらいの種類がありますか？
                </h3>
                <p className="text-gray-600">
                  軽い話題、深い話題、楽しい話題、グルメ、恋愛、季節の6カテゴリで、合計20種類以上の会話ネタをご用意しています。
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  これらの機能は無料で使えますか？
                </h3>
                <p className="text-gray-600">
                  はい、お手洗い検索機能と会話ネタ提供機能は完全無料でご利用いただけます。アカウント登録後すぐにお使いいただけます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="py-20 bg-gradient-to-r from-rose-500 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">今すぐデートをもっと楽しく</h2>
            <p className="text-xl text-white mb-12 opacity-90">
              お手洗い検索・会話ネタ提供機能で、デート中の困りごとを解決しましょう
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/signup"
                className="bg-white text-rose-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                無料で始める
              </Link>
              <Link
                href="/"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-rose-600 transition-colors"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Couple Plan</h3>
              <p className="text-gray-400">
                カップルのための
                <br />
                デートプラン管理アプリ
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">機能</h4>
              <ul className="space-y-2 text-gray-400">
                <li>デートプラン作成</li>
                <li>お手洗い検索</li>
                <li>会話ネタ提供</li>
                <li>予算管理</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/faq">よくある質問</Link>
                </li>
                <li>
                  <Link href="/contact">お問い合わせ</Link>
                </li>
                <li>
                  <Link href="/about">アプリについて</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">法的情報</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy">プライバシーポリシー</Link>
                </li>
                <li>
                  <Link href="/terms">利用規約</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Couple Plan. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 緊急ヘルプボタン */}
      <EmergencyButton />
    </div>
  );
}
