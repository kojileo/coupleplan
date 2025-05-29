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
      {/* ナビゲーションヘッダー */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-rose-600">
                💑 Couple Plan
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-rose-600 transition-colors">
                サービスについて
              </Link>
              <Link
                href="/plans/public"
                className="text-gray-700 hover:text-rose-600 transition-colors"
              >
                公開プラン
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-rose-600 transition-colors">
                よくある質問
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-rose-600 transition-colors">
                お問い合わせ
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  ログイン
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">新規登録</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-8 text-center pt-16">
          <h1 className="text-4xl font-bold text-rose-950 sm:text-5xl">
            Couple Plan
            <span className="block text-xl font-normal text-rose-700 mt-2">
              カップルのためのデートプラン作成・共有アプリ
            </span>
          </h1>

          <p className="max-w-2xl text-rose-800 text-lg">
            行きたい場所を保存して、カップルで予定を共有しよう！
            <br />
            共有されているデートプランにいいねをして、参考にしよう！
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <Link href="/plans/public" className="text-rose-600 hover:text-rose-900 font-medium">
              公開されているデートプランを見る →
            </Link>
            <Link href="/about" className="text-rose-600 hover:text-rose-900 font-medium">
              サービスについて詳しく →
            </Link>
            <Link href="/faq" className="text-rose-600 hover:text-rose-900 font-medium">
              よくある質問を見る →
            </Link>
          </div>
        </div>

        {/* 特徴セクション */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center text-rose-950 mb-12">Couple Planの特徴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-rose-900 mb-2">簡単プラン作成</h3>
              <p className="text-gray-600 text-sm">
                直感的な操作でデートプランを簡単に作成できます
              </p>
            </div>
            <div className="text-center">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-rose-900 mb-2">予算管理</h3>
              <p className="text-gray-600 text-sm">デートの予算を自動計算し、支出を管理できます</p>
            </div>
            <div className="text-center">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-rose-900 mb-2">プライバシー保護</h3>
              <p className="text-gray-600 text-sm">
                個人情報は厳重に保護され、安全にご利用いただけます
              </p>
            </div>
            <div className="text-center">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-rose-900 mb-2">マルチデバイス対応</h3>
              <p className="text-gray-600 text-sm">
                スマホ、タブレット、PCどこからでもアクセス可能
              </p>
            </div>
          </div>
        </section>

        {/* 利用の流れ */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center text-rose-950 mb-12">利用の流れ</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-rose-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  1
                </div>
                <h3 className="font-semibold text-rose-900 mb-2">アカウント作成</h3>
                <p className="text-gray-600 text-sm">無料でアカウントを作成</p>
              </div>
              <div className="text-center">
                <div className="bg-rose-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  2
                </div>
                <h3 className="font-semibold text-rose-900 mb-2">プラン作成</h3>
                <p className="text-gray-600 text-sm">行きたい場所を追加してデートプランを作成</p>
              </div>
              <div className="text-center">
                <div className="bg-rose-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  3
                </div>
                <h3 className="font-semibold text-rose-900 mb-2">共有・調整</h3>
                <p className="text-gray-600 text-sm">
                  プランを公開してパートナーと一緒にプランを調整
                </p>
              </div>
              <div className="text-center">
                <div className="bg-rose-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  4
                </div>
                <h3 className="font-semibold text-rose-900 mb-2">実行・記録</h3>
                <p className="text-gray-600 text-sm">デートを楽しみ、プランを記録</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-rose-900 mb-4">Couple Plan</h3>
              <p className="text-gray-600 text-sm">
                カップルのための
                <br />
                デートプラン管理アプリ
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">サービス</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-rose-600 text-sm transition-colors"
                  >
                    サービスについて
                  </Link>
                </li>
                <li>
                  <Link
                    href="/plans/public"
                    className="text-gray-600 hover:text-rose-600 text-sm transition-colors"
                  >
                    公開プラン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 hover:text-rose-600 text-sm transition-colors"
                  >
                    よくある質問
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">サポート</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-rose-600 text-sm transition-colors"
                  >
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-rose-600 text-sm transition-colors"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 hover:text-rose-600 text-sm transition-colors"
                  >
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">アカウント</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-rose-600 text-sm transition-colors"
                  >
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-gray-600 hover:text-rose-600 text-sm transition-colors"
                  >
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 border-t border-gray-200 pt-8">
            <div className="text-sm text-gray-600">© 2025 Couple Plan. All rights reserved.</div>
            <div className="text-center text-xs text-gray-500">
              本サービスでは、サービス向上のためにGoogle AdSenseによる広告を配信しています
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
