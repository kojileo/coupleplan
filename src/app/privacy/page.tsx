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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. はじめに</h2>
              <p className="text-gray-700 leading-relaxed">
                Couple
                Plan（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
                本プライバシーポリシーでは、本サービスにおける個人情報の取り扱いについて説明します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 収集する情報</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    2.1 ユーザーから提供される情報
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>アカウント登録時の情報（メールアドレス、ユーザー名など）</li>
                    <li>プロフィール情報</li>
                    <li>デートプランの内容</li>
                    <li>お問い合わせ内容</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    2.2 自動的に収集される情報
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>IPアドレス</li>
                    <li>ブラウザの種類とバージョン</li>
                    <li>アクセス日時</li>
                    <li>利用状況データ</li>
                    <li>Cookieによる情報</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 情報の利用目的</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>サービスの提供・運営</li>
                <li>ユーザーサポート</li>
                <li>サービスの改善・新機能の開発</li>
                <li>重要なお知らせの配信</li>
                <li>利用規約違反の対応</li>
                <li>統計データの作成（個人を特定できない形で）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 第三者への情報提供</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>生命、身体または財産の保護のために必要がある場合</li>
                <li>サービス提供に必要な業務委託先への提供</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 広告について</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.1 Google AdSense</h3>
                  <p className="text-gray-700 leading-relaxed">
                    本サービスでは、Google AdSenseを使用して広告を配信しています。 Google
                    AdSenseは、Cookieを使用してユーザーの興味に基づいた広告を表示することがあります。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.2 Cookie</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Cookieの使用を望まない場合は、ブラウザの設定で無効にすることができます。
                    ただし、一部の機能が制限される場合があります。
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. データの保管・セキュリティ
              </h2>
              <p className="text-gray-700 leading-relaxed">
                本サービスは、適切な技術的・組織的措置を講じて、個人情報の安全性を確保しています。
                ただし、インターネット上の情報伝達において完全なセキュリティを保証することはできません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. ユーザーの権利</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ユーザーは、自身の個人情報について以下の権利を有します：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>個人情報の開示請求</li>
                <li>個人情報の訂正・削除請求</li>
                <li>個人情報の利用停止請求</li>
                <li>アカウントの削除</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. プライバシーポリシーの変更
              </h2>
              <p className="text-gray-700 leading-relaxed">
                本プライバシーポリシーは、法令の変更やサービスの改善に伴い変更することがあります。
                重要な変更がある場合は、サービス内で通知いたします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. お問い合わせ</h2>
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
