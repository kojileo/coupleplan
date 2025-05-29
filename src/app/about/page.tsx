import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'Couple Planとは - カップルのためのデートプラン管理アプリ',
  description:
    'Couple Planは、カップルでデートプランを作成・共有・管理できるWebアプリケーションです。行きたい場所の保存、予算管理、公開プランの参考など、デートをより楽しくする機能を提供しています。',
  keywords: 'デートプラン, カップル, アプリ, デート, 恋人, 予定管理, 旅行計画',
};

export default function AboutPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-4xl font-bold text-rose-950 mb-8 text-center">Couple Planとは</h1>

          <div className="prose max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-rose-900 mb-4">
                カップルのためのデートプラン管理アプリ
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Couple
                Planは、カップルが一緒にデートプランを作成・共有・管理できるWebアプリケーションです。
                「今度どこに行こうか？」「あそこ行ってみたいなあ」そんな会話から生まれるアイデアを、
                簡単に保存・整理できます。
              </p>
              <p className="text-gray-700 leading-relaxed">
                また、他のカップルが公開しているデートプランを参考にできるので、
                新しいデートスポットの発見や、記念日の特別なプランのヒントも見つかります。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-rose-900 mb-6">主な機能</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-rose-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-rose-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">📝</span>
                    デートプラン作成
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• 行きたい場所の追加・管理</li>
                    <li>• カテゴリ分け（観光、グルメ、アクティビティなど）</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">👥</span>
                    カップル共有
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• プラン共有機能</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">🌟</span>
                    公開プラン閲覧
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• 他のカップルのプランを参考</li>
                    <li>• 地域・カテゴリ別検索</li>
                    <li>• いいね機能</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-rose-900 mb-4">
                こんなカップルにおすすめ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-rose-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-rose-900 mb-2">デートプラン作りが好き</h3>
                  <p className="text-gray-700 text-sm">
                    いつも「次はどこに行こう？」と計画を立てるのが楽しいカップル
                  </p>
                </div>
                <div className="bg-white border border-rose-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-rose-900 mb-2">新しい場所を開拓したい</h3>
                  <p className="text-gray-700 text-sm">
                    まだ行ったことのないスポットや、隠れた名所を発見したいカップル
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-rose-900 mb-4">安全性とプライバシー</h2>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Couple Planでは、ユーザーの個人情報とプライバシーの保護を最優先に考えています。
                  すべてのデータは暗号化され、安全なサーバーで管理されています。
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li>• 公開プランは個人を特定できない形で共有</li>
                  <li>• 適切なデータ管理とプライバシー保護</li>
                  <li>• HTTPS通信による暗号化</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-rose-900 mb-4">今すぐ始めよう</h2>
              <div className="bg-rose-50 p-6 rounded-lg text-center">
                <p className="text-gray-700 mb-6">
                  Couple Planは完全無料でご利用いただけます。
                  <br />
                  素敵なデートプランを作って、二人の時間をもっと特別にしませんか？
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="bg-rose-600 text-white px-8 py-3 rounded-lg hover:bg-rose-700 transition-colors font-semibold"
                  >
                    無料で始める
                  </Link>
                  <Link
                    href="/plans/public"
                    className="bg-white text-rose-600 border border-rose-600 px-8 py-3 rounded-lg hover:bg-rose-50 transition-colors font-semibold"
                  >
                    公開プランを見る
                  </Link>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-rose-600 hover:text-rose-900 font-medium">
                ← ホームに戻る
              </Link>
              <div className="flex space-x-4">
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
                  お問い合わせ
                </Link>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 font-medium">
                  プライバシーポリシー
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
