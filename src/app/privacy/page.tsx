import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'プライバシーポリシー - Couple Plan',
  description: 'Couple Planのプライバシーポリシーについて',
};

export default function PrivacyPolicy(): ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              最終更新日: {new Date().toLocaleDateString('ja-JP')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                個人情報の取り扱いについて
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Couple
                Plan（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
                本サービスでは、サービスの提供・運営、ユーザーサポート、サービスの改善のために必要最小限の個人情報を収集・利用いたします。
                収集した個人情報は、法令に基づく場合や緊急時を除き、第三者に提供することはありません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                当サイトに掲載されている広告について
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトでは、第三者配信の広告サービス（Googleアドセンス）を利用しています。
                このような広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、
                当サイトや他サイトへのアクセスに関する情報『Cookie』（氏名、住所、メールアドレス、電話番号は含まれません）を使用することがあります。
              </p>
              <p className="text-gray-700 leading-relaxed">
                またGoogleアドセンスに関して、このプロセスの詳細やこのような情報が広告配信事業者に使用されないようにする方法については、
                <a
                  href="https://policies.google.com/technologies/ads?gl=jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:text-rose-900 underline"
                >
                  こちらをご確認ください
                </a>
                。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                当サイトが使用しているアクセス解析ツールについて
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
                このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。
                このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
              </p>
              <p className="text-gray-700 leading-relaxed">
                この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
                この規約に関して、詳しくは
                <a
                  href="https://marketingplatform.google.com/about/analytics/terms/jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:text-rose-900 underline"
                >
                  こちらをご確認ください
                </a>
                。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                当サイトへのお問い合わせについて
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトでは、スパム・荒らしへの対応として、お問い合わせの際に使用されたIPアドレスを記録しています。
                これはサイトの標準機能としてサポートされている機能で、スパム・荒らしへの対応以外にこのIPアドレスを使用することはありません。
                また、メールアドレスの入力に関しては、任意となっております。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                全てのお問い合わせは当サイト管理人が事前にその内容を確認し、対応させていただきますことをあらかじめご了承ください。
                加えて、以下の内容を含むお問い合わせは管理人の裁量によって対応せず、削除する事があります：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>特定の自然人または法人を誹謗し、中傷するもの</li>
                <li>極度にわいせつな内容を含むもの</li>
                <li>
                  禁制品の取引に関するものや、他者を害する行為の依頼など、法律によって禁止されている物品、行為の依頼や斡旋などに関するもの
                </li>
                <li>
                  その他、公序良俗に反し、または管理人によって対応すべきでないと認められるもの
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">お問い合わせ</h2>
              <p className="text-gray-700 leading-relaxed">
                本プライバシーポリシーに関するご質問やご意見は、
                <Link href="/contact" className="text-rose-600 hover:text-rose-900 underline">
                  お問い合わせページ
                </Link>
                からご連絡ください。
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-rose-600 hover:text-rose-900 font-medium">
                ← ホームに戻る
              </Link>
              <Link
                href="/contact"
                className="bg-rose-600 text-white px-6 py-2 rounded-md hover:bg-rose-700 transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
