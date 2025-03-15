import { supabase } from '@/lib/supabase-auth';
import type { LoginRequest } from '@/types/api';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as unknown;
    if (!isLoginRequest(body)) {
      return new Response(JSON.stringify({ error: '無効なリクエストデータです' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email, password } = body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: 'ログインに失敗しました' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ログインエラー:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(JSON.stringify({ error: 'サーバーエラーが発生しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 型ガードの関数
function isLoginRequest(data: unknown): data is LoginRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<LoginRequest>;
  return typeof request.email === 'string' && typeof request.password === 'string';
}
