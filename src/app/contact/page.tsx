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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">お問い合わせ</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* お問い合わせフォーム */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">お問い合わせフォーム</h2>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800">
                    お問い合わせを受け付けました。回答まで少々お待ちください。
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="山田太郎"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ種別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="">選択してください</option>
                    <option value="general">一般的なお問い合わせ</option>
                    <option value="technical">技術的な問題</option>
                    <option value="bug">バグ報告</option>
                    <option value="feature">機能リクエスト</option>
                    <option value="privacy">プライバシーについて</option>
                    <option value="account">アカウントについて</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="お問い合わせ内容を詳しくお書きください"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-600 text-white py-3 px-4 rounded-md hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
              </form>
            </div>

            {/* サイドバー情報 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">よくあるご質問</h2>

              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Q. アカウントを削除したい</h3>
                  <p className="text-gray-600 text-sm">
                    プロフィール設定からアカウントの削除が可能です。削除すると全てのデータが失われますのでご注意ください。
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Q. パスワードを忘れました</h3>
                  <p className="text-gray-600 text-sm">
                    ログインページの「パスワードを忘れた方」からパスワードリセットが可能です。
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Q. プライベートプランが公開されてしまった
                  </h3>
                  <p className="text-gray-600 text-sm">
                    プラン編集画面から公開設定を変更できます。緊急の場合はお問い合わせください。
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Q. 広告について</h3>
                  <p className="text-gray-600 text-sm">
                    本サービスでは、運営費用のためにGoogle AdSenseによる広告を表示しています。
                    詳細は
                    <Link href="/privacy" className="text-rose-600 hover:text-rose-900 underline">
                      プライバシーポリシー
                    </Link>
                    をご確認ください。
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-rose-50 rounded-md">
                <h3 className="font-medium text-rose-900 mb-2">回答について</h3>
                <p className="text-rose-700 text-sm">
                  お問い合わせをいただいてから、通常1-3営業日以内にご回答いたします。
                  お急ぎの場合はその旨をお問い合わせ内容に記載してください。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-rose-600 hover:text-rose-900 font-medium">
                ← ホームに戻る
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 font-medium">
                プライバシーポリシー →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
