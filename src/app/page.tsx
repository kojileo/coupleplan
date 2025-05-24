'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Home(): ReactElement {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      void router.push('/plans');
    }
  }, [router, session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"
          role="status"
          aria-label="読み込み中"
        />
      </div>
    );
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
              <Button size="lg">新規登録</Button>
            </Link>
          </div>

          <div className="mt-8">
            <Link href="/plans/public" className="text-rose-600 hover:text-rose-900 font-medium">
              公開されているデートプランを見る →
            </Link>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">© 2024 Couple Plan. All rights reserved.</div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
              >
                プライバシーポリシー
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            本サービスでは、サービス向上のためにGoogle AdSenseによる広告を配信しています
          </div>
        </div>
      </footer>
    </div>
  );
}
