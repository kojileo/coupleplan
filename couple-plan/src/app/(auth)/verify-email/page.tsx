'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-rose-950">
            メール確認のお願い
          </h2>
          <div className="mt-4 text-center text-rose-800">
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
            className="text-sm text-rose-600 hover:text-rose-500"
          >
            ログインページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}