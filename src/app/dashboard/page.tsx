'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/button';
import { UsageLimitDisplay } from '@/components/subscription/UsageLimitDisplay';
import CoupleStatusCard from '@/components/couple/CoupleStatusCard';
import CoupleInviteBanner from '@/components/couple/CoupleInviteBanner';

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
      <main className="pt-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ダッシュボード</h1>
            <p className="text-xl text-gray-600">
              カップルの絆を深める統合プラットフォームへようこそ
            </p>
            {user && <p className="text-lg text-gray-500 mt-2">こんにちは、{user.email} さん！</p>}
          </div>

          {/* 使用状況表示 */}
          <div className="max-w-6xl mx-auto mb-8">
            <UsageLimitDisplay />
          </div>

          {/* カップル連携状態 */}
          <div className="max-w-6xl mx-auto mb-8">
            <CoupleStatusCard />
          </div>

          {/* カップル招待バナー */}
          <div className="max-w-6xl mx-auto mb-8">
            <CoupleInviteBanner context="dashboard" />
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
            <div className="group transition-all duration-500 relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 border border-gray-100 h-full opacity-60">
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    準備中
                  </span>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-300 to-purple-400 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">共同編集</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    リアルタイムでカップルが一緒にプランを編集・カスタマイズし、双方の希望を反映します。
                  </p>
                  <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                    近日公開
                  </Button>
                </div>
              </div>
            </div>

            {/* AI喧嘩仲裁・関係修復 */}
            <div className="group transition-all duration-500 relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 border border-gray-100 h-full opacity-60">
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    準備中
                  </span>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-300 to-green-400 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl">💕</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">関係修復</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    喧嘩や対立パターンを検知し、AIが中立的に仲裁提案を行い、関係性を修復・強化します。
                  </p>
                  <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                    近日公開
                  </Button>
                </div>
              </div>
            </div>

            {/* Date Canvas */}
            <div className="group transition-all duration-500 relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 border border-gray-100 h-full opacity-60">
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    準備中
                  </span>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-300 to-orange-400 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Date Canvas</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    デートの思い出をキャンバス上に自由に記録し、パートナーとリアルタイムで協働編集できます。
                  </p>
                  <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                    近日公開
                  </Button>
                </div>
              </div>
            </div>

            {/* ポータル統合 */}
            <div className="group transition-all duration-500 relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 border border-gray-100 h-full opacity-60">
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    準備中
                  </span>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-indigo-300 to-indigo-400 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl">🌐</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">ポータル統合</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    デート情報ポータルからAIデートプラン生成まで、カップルのデート体験を一貫してサポートします。
                  </p>
                  <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                    近日公開
                  </Button>
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

            {/* サブスクリプション管理 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">💎</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">サブスクリプション</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    現在のプラン情報、使用状況の確認、Premiumプランの詳細をご覧いただけます。
                  </p>
                  <Link href="/dashboard/subscription">
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
                      プラン管理
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* プロフィール設定 */}
            <div className="group hover:scale-105 transition-all duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-gray-500 to-gray-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl">⚙️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">プロフィール設定</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    アカウント情報、プロフィール、プライバシー設定を管理できます。
                  </p>
                  <Link href="/dashboard/profile">
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
