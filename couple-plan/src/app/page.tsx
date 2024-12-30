'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Button from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // 認証済みユーザーは直接プラン一覧へリダイレクト
    if (user) {
      router.push('/plans')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Couple Plan
            <span className="block text-xl font-normal text-gray-600 mt-2">
              カップルのためのデートプラン管理アプリ
            </span>
          </h1>

          <p className="max-w-2xl text-gray-600">
            行きたい場所を保存して、デートの予定を立てましょう。
            予算管理機能で、デート費用の計画も簡単に。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <span className="text-2xl mb-2 block">👥</span>
              <h3 className="font-semibold mb-2">カップル共同アカウント</h3>
              <p className="text-sm text-gray-600">二人で一緒にプランを管理</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <span className="text-2xl mb-2 block">📍</span>
              <h3 className="font-semibold mb-2">行きたい場所管理</h3>
              <p className="text-sm text-gray-600">気になるスポットを保存</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <span className="text-2xl mb-2 block">💰</span>
              <h3 className="font-semibold mb-2">予算管理</h3>
              <p className="text-sm text-gray-600">デート費用を計画的に</p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
            >
              ログイン
            </Button>
            <Button
              onClick={() => router.push('/signup')}
            >
              新規登録
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}