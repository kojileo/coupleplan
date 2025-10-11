'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

function VerifyEmailContent(): ReactElement {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-3 rounded-xl shadow-lg">
              <span className="text-2xl">💑</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              CouplePlan
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">メール確認のお願い</h2>
          <p className="text-gray-600">アカウントを有効化しましょう</p>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-rose-100">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📧</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">確認メールを送信しました</h3>

            <div className="text-gray-600 space-y-3 mb-8">
              <p>
                {email ? (
                  <>
                    <span className="font-semibold text-rose-600">{email}</span>{' '}
                    宛に確認メールを送信しました。
                  </>
                ) : (
                  '確認メールを送信しました。'
                )}
              </p>
              <p>メール内のリンクをクリックして、アカウントを有効化してください。</p>
              <p className="text-sm text-gray-500">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>

            <div className="space-y-4">
              <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}>
                <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  🚀 ログインしてダッシュボードへ
                </Button>
              </Link>

              <div className="text-center">
                <Link
                  href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
                  className="text-sm text-rose-600 hover:text-rose-500 underline"
                >
                  別のアカウントで登録する
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ヘルプ情報 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-500 mr-2 text-lg">💡</span>
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">メールが届かない場合</p>
              <ul className="space-y-1 text-xs">
                <li>• 迷惑メールフォルダを確認してください</li>
                <li>• メールアドレスが正しいか確認してください</li>
                <li>• 数分待ってから再度確認してください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage(): ReactElement {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
