import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'よくある質問 - Couple Plan',
  description:
    'Couple Planの使い方、アカウント管理、プライバシーなどに関するよくある質問と回答をまとめています。',
  keywords: 'FAQ, よくある質問, ヘルプ, サポート, 使い方',
};

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'アカウント・登録',
    question: 'アカウント作成は無料ですか？',
    answer:
      'はい、Couple Planのアカウント作成・利用は完全無料です。追加料金が発生することはありません。',
  },
  {
    category: 'アカウント・登録',
    question: 'パスワードを忘れてしまいました',
    answer:
      'ログインページの「パスワードを忘れた方」リンクから、パスワードリセットを行ってください。登録されたメールアドレスにリセット用のリンクが送信されます。',
  },
  {
    category: 'デートプラン',
    question: '作成したプランを削除することはできますか？',
    answer:
      'はい、プラン詳細ページの設定メニューから「プランを削除」を選択して削除できます。削除したプランは復元できませんのでご注意ください。',
  },
  {
    category: 'プライバシー・セキュリティ',
    question: 'アカウントを完全に削除したい場合はどうすればよいですか？',
    answer:
      'プロフィール設定から「アカウント削除」を選択してください。削除を実行すると、すべてのデータが完全に削除され、復元できません。',
  },
  {
    category: 'プライバシー・セキュリティ',
    question: '他のユーザーに自分の情報が見られることはありますか？',
    answer:
      'パブリックプランを公開した場合でも、プラン内容のみが表示され、ユーザー名や個人を特定できる情報は公開されません。',
  },
  {
    category: '技術的な問題',
    question: 'アプリが正常に動作しません',
    answer:
      'まずブラウザの再読み込みをお試しください。問題が続く場合は、キャッシュのクリアまたは別のブラウザでのアクセスをお試しください。それでも解決しない場合はお問い合わせください。',
  },
  {
    category: '技術的な問題',
    question: 'スマートフォンでも利用できますか？',
    answer:
      'はい、Couple PlanはレスポンシブWebアプリケーションなので、スマートフォン、タブレット、PCのいずれでも快適にご利用いただけます。',
  },
  {
    category: '機能・使い方',
    question: 'プランを他のカップルと共有したい',
    answer:
      'プラン作成時に「公開設定」を有効にすることで、他のユーザーが参考として閲覧できるようになります。個人情報は表示されませんので安心してご利用ください。',
  },
];

const categories = Array.from(new Set(faqData.map((item) => item.category)));

export default function FAQPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">よくある質問</h1>

          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Couple Planについてよく寄せられる質問をまとめました。
              <br />
              こちらで解決しない場合は、お気軽にお問い合わせください。
            </p>
          </div>

          {categories.map((category) => (
            <section key={category} className="mb-12">
              <h2 className="text-2xl font-semibold text-rose-900 mb-6 border-b border-rose-200 pb-2">
                {category}
              </h2>

              <div className="space-y-6">
                {faqData
                  .filter((item) => item.category === category)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                        <span className="text-rose-600 mr-2 flex-shrink-0">Q.</span>
                        {item.question}
                      </h3>
                      <div className="ml-6">
                        <p className="text-gray-700 leading-relaxed flex items-start">
                          <span className="text-rose-600 mr-2 flex-shrink-0">A.</span>
                          <span>{item.answer}</span>
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}

          <div className="mt-12 p-6 bg-rose-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-rose-900 mb-4">
              問題が解決しませんでしたか？
            </h3>
            <p className="text-gray-700 mb-6">
              上記のFAQで解決しない場合は、お気軽にお問い合わせください。
              <br />
              通常1-3営業日以内にご回答いたします。
            </p>
            <Link
              href="/contact"
              className="inline-block bg-rose-600 text-white px-8 py-3 rounded-lg hover:bg-rose-700 transition-colors font-semibold"
            >
              お問い合わせする
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-rose-600 hover:text-rose-900 font-medium">
                ← ホームに戻る
              </Link>
              <div className="flex space-x-4">
                <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
                  サービスについて
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
