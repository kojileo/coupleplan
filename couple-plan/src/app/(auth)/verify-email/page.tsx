'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            メール確認のお願い
          </h2>
          <div className="mt-4 text-center text-gray-600">
            <p className="mb-4">
              {email ? `${email} 宛に` : ''}確認メールを送信しました。
            </p>
            <p className="mb-4">
              メール内のリンクをクリックして、アカウントを有効化してください。
            </p>
            <p className="text-sm">
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ログインページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}