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
        // URLパラメータからトークンを取得
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');
        const code = urlParams.get('code');

        console.log('パスワードリセットページ - URL Parameters:', {
          accessToken: accessToken ? 'exists' : 'missing',
          refreshToken: refreshToken ? 'exists' : 'missing',
          type,
          code: code ? 'exists' : 'missing',
          fullUrl: window.location.href,
          search: window.location.search,
          hash: window.location.hash,
        });

        // 1. 従来方式（access_token + refresh_token）を優先
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('パスワードリセットトークンが検出されました（従来方式）');
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            console.log('セッション設定結果:', {
              hasSession: !!data.session,
              error: error?.message,
            });

            if (error) {
              console.error('セッション設定エラー:', error);
              setError(
                'パスワードリセットリンクが無効です。再度リセットメールを送信してください。'
              );
              return;
            }

            if (data.session) {
              setIsValidSession(true);
              setMessage('新しいパスワードを設定してください');
              return;
            } else {
              setError('セッションの確立に失敗しました。再度リセットメールを送信してください。');
              return;
            }
          } catch (tokenError) {
            console.error('トークン設定エラー:', tokenError);
            setError('パスワードリセットリンクが無効です。再度リセットメールを送信してください。');
            return;
          }
        }

        // 2. PKCE方式（codeパラメータ）
        if (code) {
          console.log('パスワードリセットコードが検出されました（PKCE方式）');
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            console.log('コード交換結果:', {
              hasSession: !!data.session,
              error: error?.message,
            });

            if (error) {
              console.error('コード交換エラー:', error);
              setError(
                'パスワードリセットリンクが無効です。再度リセットメールを送信してください。'
              );
              return;
            }

            if (data.session) {
              setIsValidSession(true);
              setMessage('新しいパスワードを設定してください');
              return;
            } else {
              setError('セッションの確立に失敗しました。再度リセットメールを送信してください。');
              return;
            }
          } catch (codeError) {
            console.error('コード交換エラー:', codeError);
            setError('パスワードリセットリンクが無効です。再度リセットメールを送信してください。');
            return;
          }
        }

        // 3. ホームページからリダイレクトされた場合の処理
        if (code && window.location.pathname === '/') {
          console.log(
            'ホームページからリダイレクトされました。パスワードリセットページに移動します。'
          );
          window.location.href = `/reset-password?code=${code}`;
          return;
        }

        // 4. Supabaseの自動セッション検出を試行
        console.log('Supabaseの自動セッション検出を試行中...');
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log('自動セッション検出結果:', {
          hasSession: !!session,
          error: sessionError?.message,
        });

        if (sessionError) {
          console.error('セッション確認エラー:', sessionError);
          setError('パスワードリセットリンクが無効です。再度リセットメールを送信してください。');
          return;
        }

        if (session) {
          setIsValidSession(true);
          setMessage('新しいパスワードを設定してください');
        } else {
          console.log('有効なパスワードリセットパラメータが見つかりません');
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
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      setLoading(false);
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

      // セッションをクリアしてからログインページにリダイレクト
      await supabase.auth.signOut();

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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            新しいパスワードを設定
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
            <div className="mt-2">
              <Link href="/forgot-password" className="text-red-600 hover:text-red-500 underline">
                パスワードリセットページへ
              </Link>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {isValidSession ? (
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  新しいパスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                  placeholder="8文字以上のパスワード"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  パスワード確認
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                  placeholder="パスワードを再入力"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
              >
                {loading ? '設定中...' : 'パスワードを設定'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <Link href="/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
              パスワードリセットをやり直す
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
