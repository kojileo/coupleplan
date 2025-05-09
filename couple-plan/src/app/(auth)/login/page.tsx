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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      void router.push('/plans');
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
