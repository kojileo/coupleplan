'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { FormEvent, ReactElement } from 'react';

import Button from '@/components/ui/button';
import { supabase } from '@/lib/supabase-auth';

export default function ResetPasswordPage(): ReactElement {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);

  // Supabaseのセッションを確認
  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      try {
        // 現在のセッションを取得
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        // URLのハッシュフラグメントを確認
        const hash = window.location.hash;

        // セッションがあるか、ハッシュに recovery type が含まれている場合は有効
        if (session || (hash && hash.includes('type=recovery'))) {
          setIsValidSession(true);
          setMessage('新しいパスワードを設定してください');
        } else {
          setError('無効なパスワードリセットリンクです。再度リセットメールを送信してください。');
        }
      } catch (err) {
        console.error('セッション確認エラー:', err);
        setError(
          'セッションの確認中にエラーが発生しました。再度リセットメールを送信してください。'
        );
      }
    };

    void checkSession();
  }, []);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }

    setMessage('');
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage('パスワードが正常に更新されました。ログインページに移動します...');

      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        void router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      setError(error instanceof Error ? error.message : 'パスワードの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent): void => {
    void handleSubmit(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-rose-950">
            新しいパスワードを設定
          </h2>
        </div>

        {message && (
          <div
            className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {error && (
          <div
            className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
            {error.includes('無効なパスワードリセットリンク') && (
              <div className="mt-2">
                <Link href="/forgot-password" className="text-red-700 underline">
                  パスワードリセットページへ
                </Link>
              </div>
            )}
          </div>
        )}

        {isValidSession && !error && (
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">
                  新しいパスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-rose-200 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="新しいパスワード（8文字以上）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  パスワード（確認）
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-rose-200 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="パスワード（確認）"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '更新中...' : 'パスワードを更新'}
              </Button>
            </div>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-rose-600 hover:text-rose-800">
                ログインに戻る
              </Link>
            </div>
          </form>
        )}

        {!isValidSession && error && (
          <div className="text-center mt-6">
            <Link href="/forgot-password" className="text-rose-600 hover:text-rose-800 font-medium">
              パスワードリセットをやり直す
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
