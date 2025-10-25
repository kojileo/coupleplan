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

  // 認証済みユーザーはダッシュボードに誘導
  useEffect(() => {
    // パスワードリセットのcodeパラメータをチェック
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log('ホームページでパスワードリセットコードが検出されました:', code);
      // パスワードリセットページにリダイレクト
      void router.push(`/reset-password?code=${code}`);
      return;
    }

    if (session) {
      const redirectTo =
        new URLSearchParams(window.location.search).get('redirectTo') || '/dashboard';
      void router.push(redirectTo);
    }
  }, [router, session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="relative">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-rose-500 border-r-pink-500"
            role="status"
            aria-label="読み込み中"
          />
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-30" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* ナビゲーションヘッダー */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-rose-100 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-1.5 rounded-lg">
                <span className="text-xl">💑</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                CouplePlan
              </span>
            </Link>

            <div className="flex items-center space-x-3">
              <Link
                href="/contact"
                className="hidden md:block text-gray-600 hover:text-rose-600 font-medium transition-colors"
              >
                お問い合わせ
              </Link>
              <Link href="/login?redirectTo=/dashboard">
                <Button variant="outline" size="sm" className="text-sm">
                  ログイン
                </Button>
              </Link>
              <Link href="/signup?redirectTo=/dashboard">
                <Button size="sm" className="text-sm">
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* ヒーローセクション */}
        <section className="relative py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-rose-50 border border-rose-200 rounded-full px-5 py-2 mb-8">
                <span className="text-rose-500 mr-2">✨</span>
                <span className="text-gray-700 text-sm font-medium">
                  AIが提案する、あなたにぴったりのデートプラン
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  CouplePlan
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 mb-4 leading-relaxed">
                初デート対策から、カップルの絆を深める
              </p>
              <p className="text-lg text-gray-500 mb-12">
                AIデートプラン提案・共同編集・関係修復まで
              </p>

              <Link href="/signup?redirectTo=/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  無料で始める
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 主要機能 */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">主要機能</h2>
              <p className="text-lg text-gray-600">
                初デートから関係修復まで、すべてのステージをサポート
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* AIデートプラン */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AIデートプラン提案</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  予算・時間・地域を考慮した最適なデートプランをAIが自動生成
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-blue-700 text-sm">
                    <span className="mr-2">✓</span>パーソナライズ提案
                  </div>
                  <div className="flex items-center text-blue-700 text-sm">
                    <span className="mr-2">✓</span>予算・時間考慮
                  </div>
                  <div className="flex items-center text-blue-700 text-sm">
                    <span className="mr-2">✓</span>地域特化情報
                  </div>
                </div>
              </div>

              {/* 共同編集 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">リアルタイム共同編集</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  カップルで一緒にプランを編集・カスタマイズ
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-purple-700 text-sm">
                    <span className="mr-2">✓</span>リアルタイム同期
                  </div>
                  <div className="flex items-center text-purple-700 text-sm">
                    <span className="mr-2">✓</span>編集履歴管理
                  </div>
                  <div className="flex items-center text-purple-700 text-sm">
                    <span className="mr-2">✓</span>承認ワークフロー
                  </div>
                </div>
              </div>

              {/* 関係修復 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">💕</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI関係修復</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  対立パターンを検知し、中立的な立場で仲裁提案
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-green-700 text-sm">
                    <span className="mr-2">✓</span>対立パターン分析
                  </div>
                  <div className="flex items-center text-green-700 text-sm">
                    <span className="mr-2">✓</span>中立的仲裁提案
                  </div>
                  <div className="flex items-center text-green-700 text-sm">
                    <span className="mr-2">✓</span>関係修復プラン
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-sm text-gray-400">
              <p>© 2025 CouplePlan</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
