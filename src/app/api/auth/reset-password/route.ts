import { NextRequest, NextResponse } from 'next/server';

import { resetPasswordRateLimitMap } from '@/lib/rate-limit-maps';
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

    // Rate limit チェック（同一IP、同一メールアドレス）
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const key = `${ip}-${email}`;
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // 5分
    const maxRequests = 3; // 5分間に最大3回

    const record = resetPasswordRateLimitMap.get(key);
    if (!record || record.resetTime < now) {
      // 新しいウィンドウまたは初回リクエスト
      resetPasswordRateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      // 既存のウィンドウ内
      record.count++;
      if (record.count > maxRequests) {
        console.log('Rate limit exceeded:', { key, count: record.count, maxRequests });
        return NextResponse.json(
          { error: 'メール送信制限に達しました。5分後に再試行してください。' },
          { status: 429 }
        );
      }
    }

    // アプリケーションURLが設定されているか確認
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    console.log('パスワードリセットAPI - 環境変数確認:', {
      appUrl: appUrl ? '設定済み' : '未設定',
      email: email,
    });

    if (!appUrl) {
      console.error('環境変数 NEXT_PUBLIC_APP_URL が設定されていません');
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // サーバーサイド用のSupabaseクライアントを作成
    const supabase = await createClient(request);

    const redirectUrl = `${appUrl}/reset-password`;
    console.log('パスワードリセットメール送信:', {
      email,
      redirectUrl,
    });

    // パスワードリセットメールを送信
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    console.log('Supabaseパスワードリセット結果:', {
      hasData: !!data,
      error: error?.message,
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
