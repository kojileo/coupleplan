import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

interface ResetPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown;
    if (!isResetPasswordRequest(body)) {
      return NextResponse.json({ error: 'メールアドレスは必須です' }, { status: 400 });
    }

    const { email } = body;

    // アプリケーションURLが設定されているか確認
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error('環境変数 NEXT_PUBLIC_APP_URL が設定されていません');
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // サーバーサイド用のSupabaseクライアントを作成
    const supabase = await createClient(request);

    // パスワードリセットメールを送信
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) {
      console.error('Supabaseパスワードリセットエラー:', error);
      return NextResponse.json(
        { error: 'パスワードリセットメールの送信に失敗しました' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'パスワードリセットメールを送信しました',
    });
  } catch (error) {
    console.error(
      'パスワードリセットエラー:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json({ error: 'パスワードリセットに失敗しました' }, { status: 500 });
  }
}

// 型ガードの関数
function isResetPasswordRequest(data: unknown): data is ResetPasswordRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<ResetPasswordRequest>;
  return typeof request.email === 'string' && request.email.trim() !== '';
}
