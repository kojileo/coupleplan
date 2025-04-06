'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';
import { supabase } from '@/lib/supabase-auth';

export default function Navbar(): ReactElement {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
    } finally {
      void router.push('/');
    }
  };

  const onSignOutClick = (): void => {
    void handleSignOut();
  };

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/plans" className="text-xl font-semibold text-rose-900">
              Couple Plan
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-rose-600 hover:text-rose-900 hover:bg-rose-50 focus:outline-none"
            >
              <span className="sr-only">メニューを開く</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/plans"
              className="text-rose-600 hover:text-rose-900 px-3 py-2 rounded-md text-sm"
            >
              マイプラン一覧
            </Link>
            <Link
              href="/plans/public"
              className="text-rose-600 hover:text-rose-900 px-3 py-2 rounded-md text-sm"
            >
              公開プラン一覧
            </Link>
            <Link
              href="/recommended"
              className="text-rose-600 hover:text-rose-900 px-3 py-2 rounded-md text-sm"
            >
              おすすめプラン
            </Link>
            <Link
              href="/profile"
              className="text-rose-600 hover:text-rose-900 px-3 py-2 rounded-md text-sm"
            >
              プロフィール
            </Link>
            <Button variant="outline" size="sm" onClick={onSignOutClick}>
              ログアウト
            </Button>
          </div>
        </div>

        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden pb-4`}>
          <div className="flex flex-col space-y-2">
            <Link
              href="/plans"
              className="text-rose-600 hover:text-rose-900 px-3 py-2 rounded-md text-sm"
              onClick={toggleMenu}
            >
              マイプラン一覧
            </Link>
            <Link
              href="/plans/public"
              className="text-rose-600 hover:text-rose-900 px-3 py-2 rounded-md text-sm"
              onClick={toggleMenu}
            >
              公開プラン一覧
            </Link>
            <Link
              href="/recommended"
              className="text-rose-600 hover:text-rose-900 px-3 py-2 rounded-md text-sm"
              onClick={toggleMenu}
            >
              おすすめプラン
            </Link>
            <Link
              href="/profile"
              className="text-rose-600 hover:text-rose-900 px-3 py-2 rounded-md text-sm"
              onClick={toggleMenu}
            >
              プロフィール
            </Link>
            <div className="px-3">
              <Button variant="outline" size="sm" onClick={onSignOutClick} className="w-full">
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
