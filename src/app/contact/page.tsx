'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { useState } from 'react';

interface ApiResponse {
  error?: string;
  message?: string;
  success?: boolean;
}

export default function Contact(): ReactElement {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // エラーをクリア
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const submitForm = async (): Promise<void> => {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result: ApiResponse = (await response.json()) as ApiResponse;

        if (response.ok) {
          setSubmitSuccess(true);
          setFormData({ name: '', email: '', subject: '', message: '' });
        } else {
          setError(result.error || 'お問い合わせの送信に失敗しました');
        }
      } catch (error) {
        console.error('お問い合わせの送信に失敗しました:', error);
        setError('ネットワークエラーが発生しました。時間をおいて再度お試しください。');
      } finally {
        setIsSubmitting(false);
      }
    };

    void submitForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-25 to-teal-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI0MSwgMjQ1LCAyNDksIDAuNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-green-200 rounded-full px-6 py-3 shadow-lg mb-8">
                <span className="text-green-500 mr-2 text-sm">📧</span>
                <span className="text-gray-700 font-medium text-sm">サポート・お問い合わせ</span>
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                お問い合わせ
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              ご質問やご要望がございましたら、お気軽にお問い合わせください。
              <br />
              <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                通常1-3営業日以内にご回答いたします。
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* お問い合わせフォーム */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-3xl p-10 border border-green-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-200 to-transparent rounded-full opacity-10 -translate-y-20 translate-x-20" />

                <div className="relative">
                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl mr-6 shadow-lg">
                      <span className="text-3xl">📝</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">お問い合わせフォーム</h2>
                  </div>

                  {submitSuccess && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg">
                      <div className="flex items-center">
                        <span className="text-green-500 text-2xl mr-4">✅</span>
                        <p className="text-green-800 font-semibold text-lg">
                          お問い合わせを受け付けました。回答まで少々お待ちください。
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-lg">
                      <div className="flex items-center">
                        <span className="text-red-500 text-2xl mr-4">❌</span>
                        <p className="text-red-800 font-semibold text-lg">{error}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-lg font-semibold text-gray-700 mb-3"
                      >
                        お名前 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg"
                        placeholder="山田太郎"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-lg font-semibold text-gray-700 mb-3"
                      >
                        メールアドレス <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-lg font-semibold text-gray-700 mb-3"
                      >
                        お問い合わせ種別 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg"
                      >
                        <option value="">選択してください</option>
                        <option value="general">一般的なお問い合わせ</option>
                        <option value="technical">技術的な問題</option>
                        <option value="bug">バグ報告</option>
                        <option value="feature">機能リクエスト</option>
                        <option value="emergency">緊急ヘルプ機能について</option>
                        <option value="weather">天気・服装提案機能について</option>
                        <option value="privacy">プライバシーについて</option>
                        <option value="account">アカウントについて</option>
                        <option value="other">その他</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-lg font-semibold text-gray-700 mb-3"
                      >
                        お問い合わせ内容 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg resize-none"
                        placeholder="お問い合わせ内容を詳しくお書きください"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 px-8 rounded-2xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></span>
                          送信中...
                        </span>
                      ) : (
                        '📧 送信する'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* サイドバー情報 */}
            <div className="space-y-8">
              {/* よくあるご質問 */}
              <div className="group hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-3xl p-10 border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-10 -translate-y-16 translate-x-16" />

                  <div className="relative">
                    <div className="flex items-center mb-8">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl mr-6 shadow-lg">
                        <span className="text-3xl">❓</span>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">よくあるご質問</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                          <span className="text-blue-500 mr-3">Q.</span>
                          緊急ヘルプ機能が見つからない
                        </h3>
                        <p className="text-gray-600 leading-relaxed ml-8">
                          画面右下の🆘ボタンから「お手洗い検索」と「会話ネタ」機能をご利用いただけます。
                        </p>
                      </div>

                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                          <span className="text-blue-500 mr-3">Q.</span>
                          天気・服装提案機能の使い方
                        </h3>
                        <p className="text-gray-600 leading-relaxed ml-8">
                          ホームページの天気・服装提案カードから現在地の天気と服装アドバイスを確認できます。
                        </p>
                      </div>

                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                          <span className="text-blue-500 mr-3">Q.</span>
                          アカウントを削除したい
                        </h3>
                        <p className="text-gray-600 leading-relaxed ml-8">
                          プロフィール設定からアカウントの削除が可能です。削除すると全てのデータが失われますのでご注意ください。
                        </p>
                      </div>

                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                          <span className="text-blue-500 mr-3">Q.</span>
                          パスワードを忘れました
                        </h3>
                        <p className="text-gray-600 leading-relaxed ml-8">
                          ログインページの「パスワードを忘れた方」からパスワードリセットが可能です。
                        </p>
                      </div>

                      <div className="pb-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                          <span className="text-blue-500 mr-3">Q.</span>
                          広告について
                        </h3>
                        <p className="text-gray-600 leading-relaxed ml-8">
                          本サービスでは、運営費用のためにGoogle AdSenseによる広告を表示しています。
                          詳細は
                          <Link
                            href="/privacy"
                            className="text-blue-600 hover:text-blue-800 underline font-semibold mx-1"
                          >
                            プライバシーポリシー
                          </Link>
                          をご確認ください。
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <Link href="/faq">
                        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                          📚 すべてのFAQを見る
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 回答について */}
              <div className="group hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 rounded-3xl p-10 border border-orange-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-transparent rounded-full opacity-10 -translate-y-16 translate-x-16" />

                  <div className="relative">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl mr-6 shadow-lg">
                        <span className="text-3xl">⏰</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">回答について</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-3 text-xl">✓</span> 通常1-3営業日以内にご回答
                      </div>
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-3 text-xl">✓</span> 緊急の場合は優先対応
                      </div>
                      <div className="flex items-center text-orange-600 font-semibold text-lg">
                        <span className="mr-3 text-xl">✓</span> 土日祝日は翌営業日対応
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                href="/"
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
              >
                ホーム
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
              >
                サービスについて
              </Link>
              <Link
                href="/faq"
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
              >
                よくある質問
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
              >
                プライバシーポリシー
              </Link>
            </div>
            <div className="text-gray-500 text-sm">© 2025 Couple Plan. All rights reserved.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
