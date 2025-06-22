import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'よくある質問 - Couple Plan',
  description:
    'Couple Planの使い方、お手洗い検索機能、会話ネタ提供機能、天気・服装提案機能、アカウント管理、プライバシーなどに関するよくある質問と回答をまとめています。',
  keywords:
    'FAQ, よくある質問, ヘルプ, サポート, 使い方, お手洗い検索, 会話ネタ, 緊急ヘルプ, 天気予報, 服装提案, デート, カップル',
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
  {
    category: 'お手洗い検索機能',
    question: 'お手洗い検索機能で位置情報は必要ですか？',
    answer:
      'より正確な検索のために位置情報の使用をお勧めしますが、位置情報が利用できない場合でも主要駅周辺のお手洗い情報を表示します。位置情報は検索のみに使用され、保存されることはありません。',
  },
  {
    category: 'お手洗い検索機能',
    question: 'お手洗い検索で表示される情報は正確ですか？',
    answer:
      'OpenStreetMapのデータベースと主要駅の静的データを組み合わせて情報を提供しています。営業時間や設備情報は変更される可能性があるため、重要な場合は事前に確認することをお勧めします。',
  },
  {
    category: 'お手洗い検索機能',
    question: 'Google マップでのナビゲーションはどのように使いますか？',
    answer:
      'お手洗い情報の「Google マップで開く」ボタンをタップすると、自動的にGoogle マップアプリまたはWebサイトが開き、現在地からの道順が表示されます。',
  },
  {
    category: '会話ネタ提供機能',
    question: '会話ネタはどれくらいの種類がありますか？',
    answer:
      '軽い話題、深い話題、楽しい話題、グルメ、恋愛、季節の6カテゴリで、合計20種類以上の会話ネタをご用意しています。定期的に新しい話題も追加される予定です。',
  },
  {
    category: '会話ネタ提供機能',
    question: '会話ネタの使い方のコツはありますか？',
    answer:
      '自然な流れで話題を出し、相手の答えに興味を示して深掘りすることが大切です。無理に使わず、会話のきっかけ程度に考えてください。お互いが楽しめる雰囲気を大切にしましょう。',
  },
  {
    category: '天気・服装提案機能',
    question: '天気・服装提案機能はどのように使いますか？',
    answer:
      'ホームページの天気・服装提案カードから現在地の天気情報を確認し、その日の気温や天候に合わせた服装アドバイスを受けることができます。デート前の準備にお役立てください。',
  },
  {
    category: '天気・服装提案機能',
    question: '天気情報はどれくらい正確ですか？',
    answer:
      '信頼性の高い気象データAPIを使用しており、現在の天気や数時間先の予報は高い精度で提供されます。ただし、天気は変わりやすいため、外出前に最新情報をご確認ください。',
  },
  {
    category: '天気・服装提案機能',
    question: '服装提案は男性・女性両方に対応していますか？',
    answer:
      'はい、気温や天候に応じた一般的な服装アドバイスを提供しており、男性・女性問わずご活用いただけます。具体的なアイテム名や素材の提案も含まれています。',
  },
  {
    category: '緊急ヘルプ機能',
    question: '緊急ヘルプ機能は無料で使えますか？',
    answer:
      'はい、お手洗い検索機能と会話ネタ提供機能は完全無料でご利用いただけます。アカウント登録後すぐにお使いいただけます。',
  },
  {
    category: '緊急ヘルプ機能',
    question: '緊急ヘルプボタンが見つからないのですが？',
    answer:
      '画面右下に🆘マークの赤いボタンが表示されています。ボタンをタップするとメニューが開き、「お手洗い検索」と「会話ネタ」の機能を選択できます。',
  },
];

const categories = Array.from(new Set(faqData.map((item) => item.category)));

export default function FAQPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-25 to-purple-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI0MSwgMjQ1LCAyNDksIDAuNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-6 py-3 shadow-lg mb-8">
                <span className="text-blue-500 mr-2 text-sm">❓</span>
                <span className="text-gray-700 font-medium text-sm">サポート・ヘルプセンター</span>
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                よくある質問
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Couple Planについてよく寄せられる質問をまとめました。
              <br />
              <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                こちらで解決しない場合は、お気軽にお問い合わせください。
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQコンテンツ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((category) => (
            <div key={category} className="mb-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-6 py-3 mb-6">
                  <span className="text-blue-600 font-semibold">{category}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {faqData
                  .filter((item) => item.category === category)
                  .map((item, index) => (
                    <div key={index} className="group hover:scale-105 transition-all duration-500">
                      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-3xl p-8 h-full border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-10 -translate-y-16 translate-x-16" />

                        <div className="relative">
                          <div className="flex items-start mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl mr-4 flex-shrink-0 shadow-lg">
                              <span className="text-white font-bold text-lg">Q</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">
                              {item.question}
                            </h3>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-2xl mr-4 flex-shrink-0 shadow-lg">
                              <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              問題が解決しませんでしたか？
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              上記のFAQで解決しない場合は、お気軽にお問い合わせください。
              <br />
              <span className="font-semibold">通常1-3営業日以内にご回答いたします。</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/contact">
                <button className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-blue-50">
                  📧 お問い合わせする
                </button>
              </Link>
              <Link href="/">
                <button className="border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm bg-white/10">
                  🏠 ホームに戻る
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* フッターナビゲーション */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                サービスについて
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                プライバシーポリシー
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                利用規約
              </Link>
            </div>
            <div className="text-gray-500 text-sm">© 2025 Couple Plan. All rights reserved.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
