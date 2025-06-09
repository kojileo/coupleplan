'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { EmergencyButton } from '@/components/features/emergency/EmergencyButton';
import Button from '@/components/ui/button';
import { WeatherOutfitCard } from '@/components/WeatherOutfitCard';
import { useAuth } from '@/contexts/AuthContext';

export default function Home(): ReactElement {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      void router.push('/plans');
    }
  }, [router, session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"
          role="status"
          aria-label="読み込み中"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* ナビゲーションヘッダー */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-rose-600">
                💑 Couple Plan
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-rose-600 transition-colors">
                サービスについて
              </Link>
              <Link
                href="/plans/public"
                className="text-gray-700 hover:text-rose-600 transition-colors"
              >
                公開プラン
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-rose-600 transition-colors">
                よくある質問
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-rose-600 transition-colors">
                お問い合わせ
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  ログイン
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">新規登録</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* ヒーローセクション */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-50" />
          <div className="relative container mx-auto px-4 py-20">
            {/* 新機能アナウンス */}
            <div className="text-center mb-8">
              <span className="inline-block bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                🎉 NEW FEATURE - デート中の困ったを瞬間解決！
              </span>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Couple Plan
                <span className="block text-2xl font-normal text-rose-600 mt-4">
                  カップルのためのデートプラン作成・共有アプリ
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                行きたい場所を保存して、カップルで予定を共有。
                <br />
                <span className="font-semibold text-rose-600">デート中の困ったも瞬間解決！</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-4">
                    無料で始める
                  </Button>
                </Link>
                <Link href="/plans/public">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    公開プランを見る
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 緊急ヘルプ機能ハイライト */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🆘 デート中の「困った」を瞬間解決
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                お手洗い探しや会話の沈黙に困ったら即座に解決！デート中の緊急事態をサポートする機能で、せっかくのデート時間をより楽しく過ごせます。
              </p>
              <div className="mt-6">
                <Link
                  href="/features"
                  className="inline-flex items-center bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition-colors"
                >
                  詳しい機能を見る
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* お手洗い検索機能 */}
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 h-full border border-blue-200">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-500 p-4 rounded-2xl mr-4">
                      <span className="text-3xl">🚻</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">お手洗い検索</h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">
                    <strong>デート中の急なお手洗い探しに！</strong>
                    <br />
                    現在地から最も近いお手洗いを距離順で表示。無料・有料、車椅子対応も一目で分かります。
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center text-blue-600 font-medium">
                      <span className="mr-2">✓</span> 距離順表示
                    </div>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span className="mr-2">✓</span> 無料・有料表示
                    </div>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span className="mr-2">✓</span> 車椅子対応情報
                    </div>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span className="mr-2">✓</span> Googleマップ連携
                    </div>
                  </div>
                </div>
              </div>

              {/* 会話ネタ提供機能 */}
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 h-full border border-purple-200">
                  <div className="flex items-center mb-6">
                    <div className="bg-purple-500 p-4 rounded-2xl mr-4">
                      <span className="text-3xl">💬</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">会話ネタ提供</h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">
                    <strong>会話が途切れた時の救世主！</strong>
                    <br />
                    6つのカテゴリから選べる豊富な会話ネタで、二人の距離をぐっと縮める質問を瞬時に提案。
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center text-purple-600 font-medium">
                      <span className="mr-2">✓</span> カテゴリ別選択
                    </div>
                    <div className="flex items-center text-purple-600 font-medium">
                      <span className="mr-2">✓</span> 関係性を深める質問
                    </div>
                    <div className="flex items-center text-purple-600 font-medium">
                      <span className="mr-2">✓</span> 盛り上がる話題
                    </div>
                    <div className="flex items-center text-purple-600 font-medium">
                      <span className="mr-2">✓</span> 使い方のコツ付き
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="inline-flex items-center bg-gray-100 rounded-full px-6 py-3 shadow-sm">
                <span className="text-rose-500 mr-3 text-xl">🆘</span>
                <span className="text-gray-700 font-medium">右下のボタンから今すぐ体験！</span>
              </div>
            </div>
          </div>
        </section>

        {/* 天気・服装提案機能ハイライト */}
        <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🌤️ 今日の天気に合わせた服装提案
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                デート当日の天気を確認して、二人にぴったりの服装を提案。雨の日も暑い日も、天気に左右されずに素敵なデートを楽しめます。
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 天気情報表示 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <span className="bg-orange-500 p-3 rounded-xl mr-4 text-white">🌡️</span>
                      リアルタイム天気情報
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="mr-3">✓</span> 現在地の詳細な天気情報
                      </div>
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="mr-3">✓</span> 気温・体感温度・湿度・風速
                      </div>
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="mr-3">✓</span> 天気アイコンで一目で分かる
                      </div>
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="mr-3">✓</span> 自動更新で最新情報をお届け
                      </div>
                    </div>
                  </div>

                  {/* 服装提案 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <span className="bg-orange-500 p-3 rounded-xl mr-4 text-white">👕</span>
                      スマート服装提案
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="mr-3">✓</span> 気温に応じた基本コーディネート
                      </div>
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="mr-3">✓</span> 雨・雪・風など天候別アドバイス
                      </div>
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="mr-3">✓</span> 湿度を考慮した素材選び
                      </div>
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="mr-3">✓</span> 具体的なアイテム提案
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl border border-orange-200">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      🎯 例：今日が雨の日なら...
                    </h4>
                    <p className="text-gray-600 mb-4">
                      「レインコート・撥水ジャケット」「防水ブーツ・レインシューズ」「傘・レインハット」など、雨に濡れずにおしゃれを楽しむアイテムを具体的に提案！
                    </p>
                    <div className="inline-flex items-center bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      <span className="mr-2">🌧️</span>
                      雨の日も安心してデートを楽しめます
                    </div>
                  </div>
                </div>
              </div>

              {/* 実際の天気機能体験セクション */}
              <div className="mt-16">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    🎯 今すぐ体験してみよう！
                  </h3>
                  <p className="text-gray-600">
                    ログイン不要で天気情報と服装提案をお試しいただけます
                  </p>
                </div>
                <div className="max-w-4xl mx-auto">
                  <WeatherOutfitCard />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 主要機能 */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">主要機能</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-rose-400 to-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">🆘</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">緊急ヘルプ</h3>
                <p className="text-gray-600">デート中の困った瞬間を瞬時に解決</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-400 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">プラン作成</h3>
                <p className="text-gray-600">直感的な操作でデートプランを簡単作成</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">🌤️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">天気・服装提案</h3>
                <p className="text-gray-600">今日の天気に合わせた服装を提案</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-400 to-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">予算管理</h3>
                <p className="text-gray-600">デートの予算を自動計算し管理</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-purple-400 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">マルチデバイス</h3>
                <p className="text-gray-600">どのデバイスからでもアクセス可能</p>
              </div>
            </div>
          </div>
        </section>

        {/* 利用の流れ */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">利用の流れ</h2>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center relative">
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl shadow-lg">
                    1
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">アカウント作成</h3>
                  <p className="text-gray-600">無料でアカウントを作成</p>
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className="border-t-2 border-dashed border-gray-300 w-1/2"></div>
                  </div>
                </div>
                <div className="text-center relative">
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl shadow-lg">
                    2
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">プラン作成</h3>
                  <p className="text-gray-600">行きたい場所を追加してデートプラン作成</p>
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className="border-t-2 border-dashed border-gray-300 w-1/2"></div>
                  </div>
                </div>
                <div className="text-center relative">
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl shadow-lg">
                    3
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">デート実行</h3>
                  <p className="text-gray-600">緊急ヘルプ機能でサポートを受けながら実行</p>
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className="border-t-2 border-dashed border-gray-300 w-1/2"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl shadow-lg">
                    4
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">共有・記録</h3>
                  <p className="text-gray-600">思い出を記録し、他カップルと共有</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA セクション */}
        <section className="py-20 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">もう困ることはありません！</h2>
            <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
              デートプランの作成から実行まで、あなたの恋愛をトータルサポート。
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-rose-600 hover:bg-gray-100 text-lg px-12 py-4 font-semibold"
              >
                今すぐ無料で始める
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-rose-400 mb-4">💑 Couple Plan</h3>
              <p className="text-gray-300">
                カップルのための
                <br />
                デートプラン管理アプリ
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-rose-400 transition-colors"
                  >
                    サービスについて
                  </Link>
                </li>
                <li>
                  <Link
                    href="/plans/public"
                    className="text-gray-300 hover:text-rose-400 transition-colors"
                  >
                    公開プラン
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-rose-400 transition-colors">
                    よくある質問
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-rose-400 transition-colors"
                  >
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-300 hover:text-rose-400 transition-colors"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-300 hover:text-rose-400 transition-colors"
                  >
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">アカウント</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-rose-400 transition-colors"
                  >
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-gray-300 hover:text-rose-400 transition-colors"
                  >
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-gray-400">© 2025 Couple Plan. All rights reserved.</div>
            <div className="text-xs text-gray-500 mt-4 sm:mt-0">
              Google AdSenseによる広告を配信しています
            </div>
          </div>
        </div>
      </footer>

      {/* 緊急ヘルプボタン */}
      <EmergencyButton />
    </div>
  );
}
