import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'Couple Planとは - カップルのためのデートサポートアプリ',
  description:
    'Couple Planは、カップルでデートプランを作成・共有・管理できるWebアプリケーションです。デート中の緊急ヘルプ機能、天気に合わせた服装提案、公開プランの参考など、デートをより楽しくする機能を提供しています。',
  keywords:
    'デートプラン, カップル, アプリ, デート, 恋人, 予定管理, 旅行計画, 緊急ヘルプ, 天気予報, 服装提案',
};

export default function AboutPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-25 to-purple-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI0MSwgMjQ1LCAyNDksIDAuNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full px-6 py-3 shadow-lg mb-8">
              <span className="text-rose-500 mr-2 text-sm">📖</span>
              <span className="text-gray-700 font-medium text-sm">サービスについて</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Couple Plan
              </span>
              <span className="block text-2xl lg:text-3xl font-medium text-gray-600 mt-4">
                カップルのための究極のデートサポートアプリ
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              デートプラン作成から当日のサポートまで、
              <br />
              カップルの素敵な時間を全面的にバックアップ
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* サービス概要 */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-rose-200 to-transparent rounded-full opacity-20 -translate-y-16 -translate-x-16" />

            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                カップルのデートを<span className="text-rose-600">完全サポート</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Couple
                Planは、カップルが一緒にデートプランを作成・共有・管理できるWebアプリケーション。
                「今度どこに行こうか？」「あそこ行ってみたいなあ」そんな会話から生まれるアイデアを、
                簡単に保存・整理できます。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-rose-100 p-3 rounded-xl flex-shrink-0">
                    <span className="text-2xl">💕</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">二人で一緒に計画</h3>
                    <p className="text-gray-600 leading-relaxed">
                      行きたい場所を共有し、一緒にデートプランを作り上げる楽しさを体験
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">新しい発見</h3>
                    <p className="text-gray-600 leading-relaxed">
                      他のカップルが公開しているプランを参考に、新しいデートスポットを発見
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl flex-shrink-0">
                    <span className="text-2xl">🆘</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">デート中もサポート</h3>
                    <p className="text-gray-600 leading-relaxed">
                      緊急ヘルプ機能で、デート中の困った瞬間も瞬間解決
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-xl flex-shrink-0">
                    <span className="text-2xl">🌤️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">天気も考慮</h3>
                    <p className="text-gray-600 leading-relaxed">
                      当日の天気に合わせた服装提案で、完璧なデートスタイルを実現
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 主な機能 */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">充実の機能</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              デート前・中・後の全てのシーンで活躍する豊富な機能群
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* デートプラン作成 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-gradient-to-br from-rose-50 via-rose-50 to-pink-50 rounded-3xl p-10 h-full border border-rose-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-200 to-transparent rounded-full opacity-30 -translate-y-12 translate-x-12" />

                <div className="mb-8">
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">デートプラン作成</h3>
                </div>

                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-rose-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">行きたい場所の追加・管理</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-rose-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">カテゴリ分け機能</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-rose-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">直感的な操作で簡単作成</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 緊急ヘルプ機能 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 rounded-3xl p-10 h-full border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-30 -translate-y-12 translate-x-12" />

                <div className="mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-3xl">🆘</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">緊急ヘルプ機能</h3>
                </div>

                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">お手洗い検索</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">会話ネタ提供</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">デート中の瞬間サポート</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 公開プラン機能 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 rounded-3xl p-10 h-full border border-green-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200 to-transparent rounded-full opacity-30 -translate-y-12 translate-x-12" />

                <div className="mb-8">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-3xl">🌟</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">公開プラン閲覧</h3>
                </div>

                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">他のカップルのプランを参考</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">地域・カテゴリ別検索</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="font-medium">いいね・保存機能</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 天気・服装提案機能 */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-12 border border-orange-100 shadow-xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-orange-100 border border-orange-200 rounded-full px-6 py-3 mb-6">
                <span className="text-orange-500 text-2xl mr-3">🌤️</span>
                <span className="text-orange-700 font-semibold">スマート機能</span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                天気に合わせた<span className="text-orange-600">服装提案</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">リアルタイム天気情報</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-orange-600 font-semibold">
                    <span className="mr-3 text-lg">✓</span> 現在地の詳細な天気情報
                  </div>
                  <div className="flex items-center text-orange-600 font-semibold">
                    <span className="mr-3 text-lg">✓</span> 気温・体感温度・湿度・風速
                  </div>
                  <div className="flex items-center text-orange-600 font-semibold">
                    <span className="mr-3 text-lg">✓</span> 時間別天気予報
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">パーソナライズド提案</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-orange-600 font-semibold">
                    <span className="mr-3 text-lg">✓</span> 気温に応じたコーディネート
                  </div>
                  <div className="flex items-center text-orange-600 font-semibold">
                    <span className="mr-3 text-lg">✓</span> 天候別アドバイス
                  </div>
                  <div className="flex items-center text-orange-600 font-semibold">
                    <span className="mr-3 text-lg">✓</span> 具体的なアイテム提案
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* おすすめカップル */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">こんなカップルにおすすめ</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              様々なカップルのニーズに対応した機能設計
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-rose-100">
              <div className="text-center">
                <div className="bg-rose-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💕</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">プラン作りが好き</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  いつも「次はどこに行こう？」と計画を立てるのが楽しいカップル
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">新しい場所を開拓</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  まだ行ったことのないスポットや隠れた名所を発見したいカップル
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🆘</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">デート中も安心</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  デート中の突発的な困りごとに対応できる機能が欲しいカップル
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👔</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">おしゃれにこだわり</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  天気に合わせて完璧なコーディネートでデートしたいカップル
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 安全性とプライバシー */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 border border-green-100 shadow-xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-green-100 border border-green-200 rounded-full px-6 py-3 mb-6">
                <span className="text-green-500 text-2xl mr-3">🔐</span>
                <span className="text-green-700 font-semibold">安全・安心</span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                安全性と<span className="text-green-600">プライバシー保護</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                ユーザーの個人情報とプライバシーの保護を最優先に、
                安全で安心してご利用いただける環境を提供しています。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-500 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🛡️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">データ暗号化</h3>
                <p className="text-gray-600 leading-relaxed">
                  すべてのデータは暗号化され、安全なサーバーで管理
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-500 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">👤</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">匿名性の確保</h3>
                <p className="text-gray-600 leading-relaxed">
                  公開プランは個人を特定できない形で共有
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-500 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🔒</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">HTTPS通信</h3>
                <p className="text-gray-600 leading-relaxed">すべての通信がHTTPS暗号化で保護</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA セクション */}
        <section>
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-12 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

            <div className="relative">
              <h2 className="text-4xl font-bold mb-6">今すぐ始めよう</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
                Couple Planは完全無料でご利用いただけます。
                <br />
                素敵なデートプランを作って、二人の時間をもっと特別にしませんか？
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/signup"
                  className="bg-white text-rose-600 px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  🚀 無料で始める
                </Link>
                <Link
                  href="/plans/public"
                  className="bg-transparent text-white border-2 border-white px-10 py-4 rounded-2xl hover:bg-white hover:text-rose-600 transition-all duration-300 font-bold text-lg backdrop-blur-sm"
                >
                  👀 公開プランを見る
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ナビゲーション */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <Link
              href="/"
              className="inline-flex items-center text-rose-600 hover:text-rose-800 font-medium text-lg transition-colors group"
            >
              <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">
                ←
              </span>
              ホームに戻る
            </Link>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                お問い合わせ
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                プライバシーポリシー
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
