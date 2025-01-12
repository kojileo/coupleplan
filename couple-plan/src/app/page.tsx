'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Button from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/plans')
    }
  }, [user, isLoading, router])

  // 認証状態確認中はローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-8 text-center pt-16">
          <h1 className="text-4xl font-bold text-rose-950 sm:text-5xl">
            Couple Plan
            <span className="block text-xl font-normal text-rose-700 mt-2">
              カップルのためのデートプラン作成・共有・公開アプリ
            </span>
          </h1>

          <p className="max-w-2xl text-rose-800">
            行きたい場所を保存して、カップルで予定を共有・公開しよう！！
            公開されているデートプランにいいねをしよう！
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2 block">👥</span>
              <h3 className="font-semibold mb-2 text-rose-900">カップルでデートプランを管理</h3>
              <p className="text-sm text-rose-700">一緒にプランを作成・共有</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2 block">📍</span>
              <h3 className="font-semibold mb-2 text-rose-900">行きたい場所管理</h3>
              <p className="text-sm text-rose-700">気になるスポットを保存</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2 block">💛</span>
              <h3 className="font-semibold mb-2 text-rose-900">公開されているデートプランを参考</h3>
              <p className="text-sm text-rose-700">デートプランにいいねをしよう！</p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Link href="/login">
              <Button variant="outline" size="lg">
                ログイン
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg">
                新規登録
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}