import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { LoginRequest } from '@/types/api';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown;
    if (!isLoginRequest(body)) {
      return NextResponse.json({ error: '無効なリクエストデータです' }, { status: 400 });
    }

    const { email, password } = body;

    // サーバーサイドでSupabaseクライアントを作成（Next.js 15対応）
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('ログインエラー:', error);

      // より詳細なエラーメッセージを提供
      let errorMessage = 'ログインに失敗しました';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'メールアドレスが確認されていません。確認メールをご確認ください';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください';
      }

      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    console.log(
      'API - ログイン成功:',
      data.user?.id,
      data.session?.access_token ? 'exists' : 'missing'
    );

    // セッションが正しく設定されているか確認
    const {
      data: { session: verifySession },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('API - セッション確認エラー:', sessionError);
    }

    console.log('API - セッション確認:', verifySession ? 'exists' : 'missing');

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
