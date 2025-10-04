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

  // 自動遷移は無効化 - ユーザーが明示的にアクセスした場合のみ処理
  // useEffect(() => {
  //   if (session) {
  //     const redirectTo =
  //       new URLSearchParams(window.location.search).get('redirectTo') || '/dashboard';
  //     void router.push(redirectTo);
  //   }
  // }, [router, session]);

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
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-rose-100 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-2xl">💑</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Couple Plan
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/about"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                サービスについて
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/plans/public"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                公開プラン
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/dating-guide"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                デートガイド
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/love-psychology"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                恋愛心理学
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
              >
                お問い合わせ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login?redirectTo=/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 font-medium"
                >
                  ログイン
                </Button>
              </Link>
              <Link href="/signup?redirectTo=/dashboard">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                >
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* ヒーローセクション */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-25 to-purple-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI0MSwgMjQ1LCAyNDksIDAuNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          <div className="relative container mx-auto px-4">
            <div className="text-center max-w-5xl mx-auto">
              <div className="mb-8">
                <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full px-6 py-3 shadow-lg mb-8">
                  <span className="text-rose-500 mr-2 text-sm">✨</span>
                  <span className="text-gray-700 font-medium text-sm">
                    カップルのための究極のデートサポートアプリ
                  </span>
                </div>
              </div>

              <h1 className="text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  CouplePlan
                </span>
                <span className="block text-2xl lg:text-3xl font-medium text-gray-600 mt-6 leading-relaxed">
                  カップルの絆を深める統合プラットフォーム
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                AIが提案するデートプランから、カップルでの共同編集、
                <br />
                <span className="font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  関係修復まで、すべてをサポート
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                <Link href="/signup?redirectTo=/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-lg px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
                  >
                    🚀 無料で始める
                  </Button>
                </Link>
                <Link href="/plans/public">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-rose-300 text-rose-600 hover:bg-rose-50 text-lg px-10 py-5 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold backdrop-blur-sm bg-white/50"
                  >
                    👀 公開プランを見る
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* AIデートプラン提案機能ハイライト */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-6">
                <span className="text-blue-500 text-2xl mr-3">🤖</span>
                <span className="text-blue-700 font-semibold">AIデートプラン提案</span>
              </div>

              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                あなただけの
                <span className="block text-rose-600">パーソナライズデートプラン</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                AIがあなたの好み・予算・時間・地域を分析し、
                <br />
                二人にぴったりのデートプランを自動生成・提案します。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-16">
              {/* AIプラン生成機能 */}
              <div className="group hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 rounded-3xl p-10 h-full border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-20 -translate-y-16 translate-x-16" />

                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-3xl mr-6 shadow-lg">
                      <span className="text-4xl">🤖</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">AIプラン生成</h3>
                  </div>

                  <div className="mb-8">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      <strong className="text-blue-700">あなたの好みを学習したAIが提案！</strong>
                      <br />
                      過去のデート履歴や好みを分析し、二人に最適なデートプランを自動生成します。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-blue-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> パーソナライズ
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 予算・時間考慮
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 地域特化
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 複数候補提示
                    </div>
                  </div>
                </div>
              </div>

              {/* カップル共同編集機能 */}
              <div className="group hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-3xl p-10 h-full border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-transparent rounded-full opacity-20 -translate-y-16 translate-x-16" />

                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-3xl mr-6 shadow-lg">
                      <span className="text-4xl">👥</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">共同編集</h3>
                  </div>

                  <div className="mb-8">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      <strong className="text-purple-700">リアルタイムで一緒にプラン作成！</strong>
                      <br />
                      カップルが同時にプランを編集・カスタマイズし、双方の希望を反映した完璧なプランを作成。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-purple-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> リアルタイム同期
                    </div>
                    <div className="flex items-center text-purple-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 競合解決
                    </div>
                    <div className="flex items-center text-purple-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 編集履歴
                    </div>
                    <div className="flex items-center text-purple-600 font-semibold text-lg">
                      <span className="mr-3 text-xl">✓</span> 承認ワークフロー
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-full px-8 py-4 shadow-lg">
                <span className="text-rose-500 mr-4 text-2xl animate-pulse">✨</span>
                <span className="text-gray-700 font-semibold text-lg">
                  今すぐ無料で始められます！
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* AI喧嘩仲裁・関係修復機能ハイライト */}
        <section className="py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-green-100 border border-green-200 rounded-full px-6 py-3 mb-6">
                <span className="text-green-500 text-2xl mr-3">💕</span>
                <span className="text-green-700 font-semibold">AI喧嘩仲裁・関係修復</span>
              </div>

              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                カップルの対立を
                <span className="block text-green-600">AIが中立的に仲裁</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                喧嘩や対立パターンを検知し、AIが中立的な立場で仲裁提案。
                <br />
                建設的な解決策と関係修復プランで、二人の絆をより深くします。
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-12 border border-green-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-green-200 to-transparent rounded-full opacity-20 -translate-y-20 -translate-x-20" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-emerald-200 to-transparent rounded-full opacity-20 translate-y-20 translate-x-20" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
                  {/* 対立パターン分析 */}
                  <div className="space-y-8">
                    <h3 className="text-3xl font-bold text-gray-900 flex items-center">
                      <span className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl mr-6 text-white shadow-lg">
                        🔍
                      </span>
                      対立パターン分析
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center text-green-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 喧嘩の原因を自動検知
                      </div>
                      <div className="flex items-center text-green-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 感情のパターン分析
                      </div>
                      <div className="flex items-center text-green-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 関係性の状態把握
                      </div>
                    </div>
                  </div>

                  {/* 仲裁提案 */}
                  <div className="space-y-8">
                    <h3 className="text-3xl font-bold text-gray-900 flex items-center">
                      <span className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl mr-6 text-white shadow-lg">
                        🤝
                      </span>
                      中立的仲裁提案
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center text-green-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 建設的な解決策提示
                      </div>
                      <div className="flex items-center text-green-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 関係修復プラン
                      </div>
                      <div className="flex items-center text-green-600 font-semibold text-lg">
                        <span className="mr-4 text-xl">✓</span> 継続的なフォローアップ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 主要機能 */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">主要機能</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                カップルの絆を深める統合プラットフォームの充実した機能群
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="text-center group hover:scale-105 transition-all duration-500">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 text-2xl">AIデートプラン</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    パーソナライズされたデートプランを自動生成・提案
                  </p>
                </div>
              </div>

              <div className="text-center group hover:scale-105 transition-all duration-500">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 text-2xl">共同編集</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    リアルタイムでカップルが一緒にプランを作成
                  </p>
                </div>
              </div>

              <div className="text-center group hover:scale-105 transition-all duration-500">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="bg-gradient-to-br from-green-400 to-green-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">💕</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 text-2xl">関係修復</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    AIが中立的に仲裁し、関係性を修復・強化
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

        <div className="container mx-auto py-16 px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-3 rounded-xl">
                  <span className="text-2xl">💑</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                  Couple Plan
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                カップルのための
                <br />
                究極のデートサポートアプリ
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">サービス</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    サービスについて
                  </Link>
                </li>
                <li>
                  <Link
                    href="/plans/public"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    公開プラン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    よくある質問
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">サポート</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">アカウント</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/login?redirectTo=/dashboard"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup?redirectTo=/dashboard"
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg hover:underline"
                  >
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-gray-400 text-lg mb-4 sm:mb-0">
              © 2025 Couple Plan. All rights reserved.
            </div>
            <div className="text-sm text-gray-500">Google AdSenseによる広告を配信しています</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
