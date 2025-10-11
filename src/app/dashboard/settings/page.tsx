'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-auth';

export default function SettingsPage(): ReactElement {
  const { user } = useAuth();
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    emailUpdates: true,
    privacy: 'friends',
    theme: 'light',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserSettings({
          notifications: data.notifications || true,
          emailUpdates: data.email_updates || true,
          privacy: data.privacy || 'friends',
          theme: data.theme || 'light',
        });
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={() => window.history.back()} variant="outline" size="sm">
                ← 戻る
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">設定・管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">ログイン中: {user?.email}</div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 設定カテゴリ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 課金管理 */}
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">💳</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">課金管理</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  サブスクリプション、支払い履歴、使用量の確認とプラン変更を行えます。
                </p>
                <Link href="/dashboard/settings/billing">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    課金管理を開く
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 機能解放 */}
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">🔓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">機能解放</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  利用可能な機能の確認、トライアル開始、アップグレードを行えます。
                </p>
                <Link href="/dashboard/settings/features">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    機能解放を開く
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 通知設定 */}
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">🔔</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">通知設定</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  課金関連の通知設定と通知履歴の確認を行えます。
                </p>
                <Link href="/dashboard/settings/billing/notifications">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
                    通知設定を開く
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 分析ダッシュボード */}
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">分析ダッシュボード</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  課金指標、収益分析、チャーン率などの詳細な分析を行えます。
                </p>
                <Link href="/dashboard/settings/billing/analytics">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    分析を開く
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* サブスクリプション管理 */}
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-500 to-red-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">サブスクリプション管理</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  サブスクリプションの詳細、キャンセル、一時停止などの管理を行えます。
                </p>
                <Link href="/dashboard/settings/billing/subscription">
                  <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                    管理を開く
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* アカウント設定 */}
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">アカウント設定</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  プロフィール、パスワード、プライバシー設定などの管理を行えます。
                </p>
                <Link href="/dashboard/profile">
                  <Button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white">
                    プロフィールを編集
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* クイックアクセス */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">クイックアクセス</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/settings/billing">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <h4 className="font-medium text-gray-900">課金状況</h4>
                    <p className="text-sm text-gray-600">現在のプランと使用量</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/settings/features">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔓</span>
                  <div>
                    <h4 className="font-medium text-gray-900">機能一覧</h4>
                    <p className="text-sm text-gray-600">利用可能な機能</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/settings/billing/notifications">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <h4 className="font-medium text-gray-900">通知</h4>
                    <p className="text-sm text-gray-600">未読通知の確認</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/settings/billing/subscription">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h4 className="font-medium text-gray-900">サブスクリプション</h4>
                    <p className="text-sm text-gray-600">詳細管理</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
