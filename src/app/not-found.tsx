import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'ページが見つかりません - Couple Plan',
  description:
    'お探しのページが見つかりませんでした。Couple Planでデートプランを作成・管理しましょう。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-8xl text-rose-300 font-bold mb-6">404</div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">ページが見つかりません</h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            お探しのページは存在しないか、移動された可能性があります。
            <br />
            URLを再度ご確認いただくか、以下のリンクからサイトをご利用ください。
          </p>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/"
              className="inline-block bg-rose-600 text-white px-8 py-3 rounded-lg hover:bg-rose-700 transition-colors font-semibold"
            >
              ホームに戻る
            </Link>

            <Link
              href="/plans/public"
              className="inline-block bg-white text-rose-600 border border-rose-600 px-8 py-3 rounded-lg hover:bg-rose-50 transition-colors font-semibold"
            >
              公開プランを見る
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">人気のページ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <Link
                href="/features"
                className="block p-4 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <h3 className="font-semibold text-rose-900 mb-2">🆘 緊急ヘルプ機能</h3>
                <p className="text-sm text-gray-600">お手洗い検索・会話ネタ提供</p>
              </Link>

              <Link
                href="/about"
                className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 className="font-semibold text-blue-900 mb-2">📖 Couple Planとは</h3>
                <p className="text-sm text-gray-600">サービスの詳細な説明</p>
              </Link>

              <Link
                href="/faq"
                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="font-semibold text-green-900 mb-2">❓ よくある質問</h3>
                <p className="text-sm text-gray-600">FAQ・ヘルプ情報</p>
              </Link>

              <Link
                href="/contact"
                className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <h3 className="font-semibold text-purple-900 mb-2">📞 お問い合わせ</h3>
                <p className="text-sm text-gray-600">サポートへのご連絡</p>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500">
              問題が解決しない場合は、
              <Link href="/contact" className="text-rose-600 hover:text-rose-900 underline">
                お問い合わせページ
              </Link>
              からご連絡ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
