'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';

import Button from '@/components/ui/button';
import { supabase } from '@/lib/supabase-auth';

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('ログイン処理開始:', email);

      // APIルートを使用してログイン
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('ログインエラー:', result.error);
        alert(result.error || 'ログインに失敗しました');
        return;
      }

      console.log('API - ログイン成功:', result);
      console.log('API - ユーザー情報:', result.user);
      console.log('API - セッション情報:', result.session);

      // ログイン成功後の処理
      console.log('ログイン成功、セッション確認中...');

      // セッションを明示的に取得
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('セッション取得エラー:', sessionError);
        alert('セッションの取得に失敗しました');
        return;
      }

      console.log('取得したセッション:', session);

      if (session) {
        console.log('セッション確認済み、ダッシュボードに遷移');
        // セッションが確認できた場合のみリダイレクト
        window.location.href = '/dashboard';
      } else {
        console.log('セッションが見つかりません、少し待機してから再試行');
        // セッションが見つからない場合は少し待機してから再試行
        setTimeout(async () => {
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();
          console.log('再試行後のセッション:', retrySession);

          if (retrySession) {
            console.log('再試行でセッション確認、ダッシュボードに遷移');
            window.location.href = '/dashboard';
          } else {
            console.log('セッションが取得できません、強制リダイレクト');
            window.location.href = '/dashboard';
          }
        }, 1000);
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      alert('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent): void => {
    void handleLogin(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-rose-950">ログイン</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-rose-200 placeholder-rose-400 text-rose-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-rose-200 placeholder-rose-400 text-rose-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </div>

          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-sm text-rose-600 hover:text-rose-800">
              パスワードをお忘れですか？
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
