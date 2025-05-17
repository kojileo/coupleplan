'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';

import Button from '@/components/ui/button';
import { api } from '@/lib/api';

export default function SignUpPage(): ReactElement {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.auth.signup({
        name,
        email,
        password,
      });

      if ('error' in response) throw new Error(response.error);
      void router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('サインアップエラー:', error);
      setError('サインアップに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent): void => {
    void handleSignUp(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-rose-950">アカウント作成</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-rose-200 placeholder-rose-400 text-rose-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="お名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-rose-200 placeholder-rose-400 text-rose-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
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
              {loading ? '作成中...' : 'アカウント作成'}
            </Button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-rose-600 hover:text-rose-500">
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>

          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}
