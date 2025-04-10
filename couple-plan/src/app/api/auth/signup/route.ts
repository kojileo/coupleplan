import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';
import type { SignUpRequest } from '@/types/api';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown;
    if (!isSignUpRequest(body)) {
      return NextResponse.json({ error: '無効なリクエストデータです' }, { status: 400 });
    }

    const data = body;

    // パスワードのバリデーション
    if (!data.password || data.password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }

    // メールアドレスのバリデーション
    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // 1. Supabaseでユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || 'ユーザー',
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'ユーザー登録に失敗しました' }, { status: 400 });
    }

    try {
      // 2. Prismaでプロフィール作成
      const profile = await prisma.profile.create({
        data: {
          userId: authData.user.id,
          name: data.name || 'ユーザー',
          email: data.email,
        },
      });

      return NextResponse.json({
        data: {
          profile,
          message: '確認メールを送信しました。メールを確認してください。',
        },
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('サインアップエラー:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'ユーザー登録に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}

// 型ガードの関数
function isSignUpRequest(data: unknown): data is SignUpRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<SignUpRequest>;
  return (
    typeof request.email === 'string' &&
    typeof request.password === 'string' &&
    (request.name === undefined || typeof request.name === 'string')
  );
}
