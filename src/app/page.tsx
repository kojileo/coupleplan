'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { EmergencyButton } from '@/components/features/emergency/EmergencyButton';
import Button from '@/components/ui/button';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* ナビゲーションヘッダー */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-rose-100 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-2xl">💑</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Couple Plan
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/about"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                サービスについて
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/plans/public"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                公開プラン
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/faq"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                よくある質問
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                お問い合わせ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 font-medium"
                >
                  ログイン
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                >
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* ヒーローセクション */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-25 to-purple-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI0MSwgMjQ1LCAyNDksIDAuNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          <div className="relative container mx-auto px-4">
            <div className="text-center max-w-5xl mx-auto">
              <div className="mb-8">
                <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full px-6 py-3 shadow-lg mb-8">
                  <span className="text-rose-500 mr-2 text-sm">✨</span>
                  <span className="text-gray-700 font-medium text-sm">
                    カップルのための究極のデートサポートアプリ
                  </span>
                </div>
              </div>

              <h1 className="text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Couple Plan
                </span>
                <span className="block text-2xl lg:text-3xl font-medium text-gray-600 mt-6 leading-relaxed">
                  デート前・中・後の全てをサポート
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                行きたい場所を保存して、カップルで予定を共有。
                <br />
                <span className="font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  デート中の困ったも瞬間解決！
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-lg px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
                  >
                    🚀 無料で始める
                  </Button>
                </Link>
                <Link href="/plans/public">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-rose-300 text-rose-600 hover:bg-rose-50 text-lg px-10 py-5 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold backdrop-blur-sm bg-white/50"
                  >
                    👀 公開プランを見る
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 緊急ヘルプ機能ハイライト */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-red-50 border border-red-200 rounded-full px-6 py-3 mb-6">
                <span className="text-red-500 text-2xl mr-3">🆘</span>
                <span className="text-red-700 font-semibold">緊急時サポート機能</span>
              </div>

              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                デート中の「困った」を
                <span className="block text-rose-600">瞬間解決</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                お手洗い探しや会話の沈黙に困ったら即座に解決！
                <br />
                デート中の緊急事態をサポートする機能で、せっかくのデート時間をより楽しく過ごせます。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-16">
              {/* お手洗い検索機能 */}
              <div className="group hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 rounded-3xl p-10 h-full border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-20 -translate-y-16 translate-x-16" />

                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-3xl mr-6 shadow-lg">
                      <span className="text-4xl">🚻</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">お手洗い検索</h3>
                  </div>

                  <div className="mb-8">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      <strong className="text-blue-700">デート中の急なお手洗い探しに！</strong>
                      <br />
                      現在地から最も近いお手洗いを距離順で表示し、迷わず目的地まで案内します。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-blue-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 距離順表示
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> Googleマップ連携
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> リアルタイム位置情報
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> ワンタップ検索
                    </div>
                  </div>
                </div>
              </div>

              {/* 会話ネタ提供機能 */}
              <div className="group hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-3xl p-10 h-full border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-transparent rounded-full opacity-20 -translate-y-16 translate-x-16" />

                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-3xl mr-6 shadow-lg">
                      <span className="text-4xl">💬</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">会話ネタ提供</h3>
                  </div>

                  <div className="mb-8">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      <strong className="text-purple-700">会話が途切れた時の救世主！</strong>
                      <br />
                      6つのカテゴリから選べる豊富な会話ネタで、二人の距離をぐっと縮める質問を瞬時に提案。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-purple-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> カテゴリ別選択
                    </div>
                    <div className="flex items-center text-purple-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 関係性を深める質問
                    </div>
                    <div className="flex items-center text-purple-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 盛り上がる話題
                    </div>
                    <div className="flex items-center text-purple-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 使い方のコツ付き
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-full px-8 py-4 shadow-lg">
                <span className="text-rose-500 mr-4 text-2xl animate-pulse">🆘</span>
                <span className="text-gray-700 font-semibold text-lg">
                  右下のボタンから今すぐ体験できます！
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 天気・服装提案機能ハイライト */}
        <section className="py-24 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-orange-100 border border-orange-200 rounded-full px-6 py-3 mb-6">
                <span className="text-orange-500 text-2xl mr-3">🌤️</span>
                <span className="text-orange-700 font-semibold">スマート服装提案</span>
              </div>

              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                今日の天気に合わせた
                <span className="block text-orange-600">完璧な服装提案</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                デート当日の天気を確認して、二人にぴったりの服装を提案。
                <br />
                雨の日も暑い日も、天気に左右されずに素敵なデートを楽しめます。
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-12 border border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange-200 to-transparent rounded-full opacity-20 -translate-y-20 -translate-x-20" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-yellow-200 to-transparent rounded-full opacity-20 translate-y-20 translate-x-20" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
                  {/* 天気情報表示 */}
                  <div className="space-y-8">
                    <h3 className="text-3xl font-bold text-gray-900 flex items-center">
                      <span className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl mr-6 text-white shadow-lg">
                        🌡️
                      </span>
                      リアルタイム天気情報
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 現在地の詳細な天気情報
                      </div>
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 気温・体感温度・湿度・風速
                      </div>
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 時間別天気予報
                      </div>
                    </div>
                  </div>

                  {/* 服装提案 */}
                  <div className="space-y-8">
                    <h3 className="text-3xl font-bold text-gray-900 flex items-center">
                      <span className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl mr-6 text-white shadow-lg">
                        👕
                      </span>
                      スマート服装提案
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 気温に応じた基本コーディネート
                      </div>
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 雨・雪・風など天候別アドバイス
                      </div>
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 湿度を考慮した素材選び
                      </div>
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 具体的なアイテム提案
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 主要機能 */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">主要機能</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                カップルのデートを完全サポートする充実した機能群
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="text-center group hover:scale-105 transition-all duration-500">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="bg-gradient-to-br from-rose-400 to-rose-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">🆘</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 text-2xl">緊急ヘルプ</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    デート中の困った瞬間を瞬時に解決する救世主機能
                  </p>
                </div>
              </div>

              <div className="text-center group hover:scale-105 transition-all duration-500">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 text-2xl">プラン作成</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    直感的な操作でデートプランを簡単作成・共有
                  </p>
                </div>
              </div>

              <div className="text-center group hover:scale-105 transition-all duration-500">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">🌤️</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 text-2xl">天気・服装提案</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    今日の天気に合わせた完璧な服装を提案
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

        <div className="container mx-auto py-16 px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-3 rounded-xl">
                  <span className="text-2xl">💑</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                  Couple Plan
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                カップルのための
                <br />
                究極のデートサポートアプリ
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">サービス</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    サービスについて
                  </Link>
                </li>
                <li>
                  <Link
                    href="/plans/public"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    公開プラン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    よくある質問
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">サポート</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">アカウント</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-gray-400 text-lg mb-4 sm:mb-0">
              © 2025 Couple Plan. All rights reserved.
            </div>
            <div className="text-sm text-gray-500">Google AdSenseによる広告を配信しています</div>
          </div>
        </div>
      </footer>

      {/* 緊急ヘルプボタン */}
      <EmergencyButton />
    </div>
  );
}
