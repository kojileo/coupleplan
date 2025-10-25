'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // ログインページや認証ページではナビゲーションを表示しない
  const hideNavbar =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/auth/verify' ||
    pathname === '/auth/reset-password' ||
    pathname === '/';

  if (hideNavbar) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・ホームボタン */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-2xl font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <span>💑</span>
              <span>CouplePlan</span>
            </Link>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard') && pathname === '/dashboard'
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏠 ホーム
            </Link>
            <Link
              href="/dashboard/plans"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/plans')
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📅 プラン一覧
            </Link>
            <Link
              href="/dashboard/plans/create"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/plans/create')
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ✨ プラン作成
            </Link>
            <Link
              href="/dashboard/partner-linkage"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/partner-linkage')
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              👥 パートナー
            </Link>
            <Link
              href="/dashboard/profile"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/profile')
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚙️ 設定
            </Link>
            <button
              onClick={handleSignOut}
              className="ml-4 px-4 py-2 text-gray-700 hover:text-rose-600 font-medium transition-colors"
            >
              ログアウト
            </button>
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="メニュー"
            >
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard') && pathname === '/dashboard'
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏠 ホーム
            </Link>
            <Link
              href="/dashboard/plans"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/plans')
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📅 プラン一覧
            </Link>
            <Link
              href="/dashboard/plans/create"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/plans/create')
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ✨ プラン作成
            </Link>
            <Link
              href="/dashboard/partner-linkage"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/partner-linkage')
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              👥 パートナー
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/profile')
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚙️ 設定
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-rose-600 font-medium transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
