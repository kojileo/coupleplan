import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { LoginRequest } from '@/types/api';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown;
    if (!isLoginRequest(body)) {
      return NextResponse.json({ error: '無効なリクエストデータです' }, { status: 400 });
    }

    const { email, password } = body;

    // サーバーサイドでSupabaseクライアントを作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('ログインエラー:', error);
      return NextResponse.json({ error: 'ログインに失敗しました' }, { status: 401 });
    }

    console.log(
      'API - ログイン成功:',
      data.user?.id,
      data.session?.access_token ? 'exists' : 'missing'
    );

    return NextResponse.json(
      {
        success: true,
        user: data.user,
        session: data.session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('ログインエラー:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 型ガードの関数
function isLoginRequest(data: unknown): data is LoginRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<LoginRequest>;
  return typeof request.email === 'string' && typeof request.password === 'string';
}
