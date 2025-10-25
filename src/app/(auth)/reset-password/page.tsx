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
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // セッション確認（PKCEフローのみサポート）
  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      try {
        console.log('パスワードリセットページ - セッション確認開始');

        // URLパラメータからエラー情報を取得
        const urlParams = new URLSearchParams(window.location.search);
        const urlError = urlParams.get('error');
        const errorCode = urlParams.get('error_code');
        const errorDescription = urlParams.get('error_description');

        console.log('URL Parameters:', {
          error: urlError,
          errorCode,
          errorDescription,
          fullUrl: window.location.href,
        });

        // エラーパラメータがある場合の処理
        if (urlError === 'access_denied' && errorCode === 'otp_expired') {
          console.log('OTP期限切れエラーが検出されました');
          setError(
            'パスワードリセットリンクの有効期限が切れています。再度リセットメールを送信してください。'
          );
          setIsCheckingSession(false);
          return;
        }

        if (urlError) {
          console.log('認証エラーが検出されました:', { urlError, errorCode, errorDescription });
          setError('パスワードリセットリンクが無効です。再度リセットメールを送信してください。');
          setIsCheckingSession(false);
          return;
        }

        // Supabaseの自動セッション検出（PKCEフロー）
        console.log('Supabaseの自動セッション検出を試行中...');
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log('セッション検出結果:', {
          hasSession: !!session,
          error: sessionError?.message,
        });

        if (sessionError) {
          console.error('セッション確認エラー:', sessionError);
          setError('パスワードリセットリンクが無効です。再度リセットメールを送信してください。');
          setIsCheckingSession(false);
          return;
        }

        if (session) {
          console.log('有効なセッションが検出されました');
          setIsValidSession(true);
          setMessage('新しいパスワードを設定してください');
        } else {
          console.log('有効なセッションが見つかりません');
          setError('無効なパスワードリセットリンクです。再度リセットメールを送信してください。');
        }
      } catch (err) {
        console.error('セッション確認エラー:', err);
        setError(
          'セッションの確認中にエラーが発生しました。再度リセットメールを送信してください。'
        );
      } finally {
        setIsCheckingSession(false);
      }
    };

    void checkSession();
  }, []);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // バリデーション
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

    try {
      console.log('パスワード更新を開始');
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error('パスワード更新エラー:', error);
        throw error;
      }

      console.log('パスワード更新成功');
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

  // セッション確認中の表示
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              パスワードリセット
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">セッションを確認中...</p>
          </div>
        </div>
      </div>
    );
  }

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
