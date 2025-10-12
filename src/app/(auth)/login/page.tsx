'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useState, useEffect, Suspense } from 'react';

import Button from '@/components/ui/button';
import { supabase } from '@/lib/supabase-auth';
import { clearSession } from '@/lib/manual-auth';

function LoginForm(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // セッションクリアが必要な場合の処理
  useEffect(() => {
    const clearSessionParam = searchParams.get('clearSession');
    if (clearSessionParam === 'true') {
      console.log('破損したセッションをクリアします');
      clearSession().then(() => {
        console.log('セッションをクリアしました');
      });
    }
  }, [searchParams]);

  const getRedirectUrl = () => {
    const redirectTo = searchParams.get('redirectTo');
    if (redirectTo && redirectTo.startsWith('/')) {
      return redirectTo;
    }
    return '/dashboard';
  };

  const handleLogin = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('ログイン処理開始:', email);

      // 直接Supabaseでログイン
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('ログインエラー:', error);

        let errorMessage = 'ログインに失敗しました';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスまたはパスワードが正しくありません';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスが確認されていません。確認メールをご確認ください';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください';
        }

        setError(errorMessage);
        return;
      }

      console.log('ログイン成功:', data.user?.id);

      // ログイン成功後、リダイレクト
      const redirectUrl = getRedirectUrl();
      console.log('リダイレクト先:', redirectUrl);
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('ログインエラー:', error);
      setError(error.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent): void => {
    void handleLogin(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-3 rounded-xl shadow-lg">
              <span className="text-2xl">💑</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              CouplePlan
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ログイン</h2>
          <p className="text-gray-600">おかえりなさい！続きを楽しみましょう</p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-rose-100">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                    placeholder="パスワードを入力"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  ログイン中...
                </div>
              ) : (
                '🚀 ログイン'
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-rose-600 hover:text-rose-500 underline"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          </form>
        </div>

        {/* サインアップリンク */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            アカウントをお持ちでない方は
            <Link
              href="/signup"
              className="text-rose-600 hover:text-rose-500 font-semibold underline ml-1"
            >
              こちらから新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
