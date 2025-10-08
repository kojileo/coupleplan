'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/button';

export default function Dashboard(): ReactElement {
  const { session, isLoading, user, signOut } = useAuth();

  // ローディング中
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

  // セッションがない場合
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h1>
          <p className="text-gray-600 mb-6">
            セッションが確認できません。再度ログインしてください。
          </p>
          <Link href="/login?redirectTo=/dashboard">
            <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
              ログイン
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* ナビゲーションヘッダー */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-2xl">💑</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  CouplePlan
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/dashboard/plans">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 font-medium"
                >
                  📝 保存されたプラン
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 font-medium"
                >
                  👤 プロフィール
                </Button>
              </Link>
              <Button
                size="sm"
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                onClick={async () => {
                  await signOut();
                  window.location.href = '/';
                }}
              >
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ダッシュボード</h1>
            <p className="text-xl text-gray-600">
              カップルの絆を深める統合プラットフォームへようこそ
            </p>
            {user && <p className="text-lg text-gray-500 mt-2">こんにちは、{user.email} さん！</p>}
          </div>

          {/* 主要機能カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* AIデートプラン提案 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">AIデートプラン提案</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    あなたの好みを学習したAIが、二人にぴったりのデートプランを自動生成・提案します。
                  </p>
                  <div className="space-y-3">
                    <Link href="/dashboard/plans/create">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                        プランを作成
                      </Button>
                    </Link>
                    <Link href="/dashboard/plans">
                      <Button variant="outline" className="w-full">
                        📝 保存されたプランを見る
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* カップル共同編集 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">共同編集</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    リアルタイムでカップルが一緒にプランを編集・カスタマイズし、双方の希望を反映します。
                  </p>
                  <Link href="/dashboard/collaboration">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                      共同編集を開始
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* AI喧嘩仲裁・関係修復 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">💕</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">関係修復</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    喧嘩や対立パターンを検知し、AIが中立的に仲裁提案を行い、関係性を修復・強化します。
                  </p>
                  <Link href="/dashboard/mediation">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                      仲裁を依頼
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Date Canvas */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Date Canvas</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    デートの思い出をキャンバス上に自由に記録し、パートナーとリアルタイムで協働編集できます。
                  </p>
                  <Link href="/dashboard/date-canvas">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                      キャンバスを開く
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ポータル統合 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">🌐</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">ポータル統合</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    デート情報ポータルからAIデートプラン生成まで、カップルのデート体験を一貫してサポートします。
                  </p>
                  <Link href="/dashboard/portal">
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white">
                      ポータルを開く
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* パートナー連携 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">💑</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">パートナー連携</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    パートナーとの連携設定、招待コードの生成・検証、カップル関係の確立を行います。
                  </p>
                  <Link href="/dashboard/partner-linkage">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                      パートナー連携
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 設定・管理 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-gray-500 to-gray-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">⚙️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">設定・管理</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    アカウント設定、課金管理、機能制御など、アプリの設定を管理できます。
                  </p>
                  <Link href="/dashboard/settings">
                    <Button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white">
                      設定を開く
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
