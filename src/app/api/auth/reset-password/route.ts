import { NextRequest, NextResponse } from 'next/server';

import { resetPasswordRateLimitMap } from '@/lib/rate-limit-maps';
import { createClient } from '@/lib/supabase/server';

interface ResetPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    console.log(`[${requestId}] パスワードリセットAPI開始`);

    const body = (await request.json()) as unknown;
    if (!isResetPasswordRequest(body)) {
      console.log(`[${requestId}] バリデーションエラー: メールアドレスが無効`);
      return NextResponse.json({ error: 'メールアドレスは必須です' }, { status: 400 });
    }

    const { email } = body;
    console.log(`[${requestId}] リクエスト受信: ${email}`);

    // Rate limit チェック（同一IP、同一メールアドレス）
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const key = `${ip}-${email}`;
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // 5分
    const maxRequests = 3; // 5分間に最大3回

    console.log(`[${requestId}] Rate limit チェック: ${key}`);

    const record = resetPasswordRateLimitMap.get(key);
    if (!record || record.resetTime < now) {
      // 新しいウィンドウまたは初回リクエスト
      resetPasswordRateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      console.log(`[${requestId}] 新しいレート制限ウィンドウ開始`);
    } else {
      // 既存のウィンドウ内
      record.count++;
      console.log(`[${requestId}] レート制限カウント: ${record.count}/${maxRequests}`);
      if (record.count > maxRequests) {
        console.log(
          `[${requestId}] Rate limit exceeded: ${key}, count: ${record.count}, max: ${maxRequests}`
        );
        return NextResponse.json(
          { error: 'メール送信制限に達しました。5分後に再試行してください。' },
          { status: 429 }
        );
      }
    }

    // アプリケーションURLが設定されているか確認
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    console.log(`[${requestId}] 環境変数確認:`, {
      appUrl: appUrl ? '設定済み' : '未設定',
      email: email,
    });

    if (!appUrl) {
      console.error(`[${requestId}] 環境変数 NEXT_PUBLIC_APP_URL が設定されていません`);
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // サーバーサイド用のSupabaseクライアントを作成
    console.log(`[${requestId}] Supabaseクライアント作成中...`);
    const supabase = await createClient(request);

    const redirectUrl = `${appUrl}/reset-password`;
    console.log(`[${requestId}] パスワードリセットメール送信開始:`, {
      email,
      redirectUrl,
    });

    // パスワードリセットメールを送信
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Supabaseパスワードリセット結果 (${duration}ms):`, {
      hasData: !!data,
      error: error?.message,
      errorCode: error?.status,
    });

    if (error) {
      console.error(`[${requestId}] Supabaseパスワードリセットエラー:`, {
        message: error.message,
        status: error.status,
        details: error,
      });

      // エラーの種類に応じて適切なメッセージを返す
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: '送信制限に達しました。しばらく待ってから再試行してください。' },
          { status: 429 }
        );
      } else if (error.message.includes('invalid email')) {
        return NextResponse.json({ error: '無効なメールアドレスです。' }, { status: 400 });
      } else {
        return NextResponse.json(
          { error: 'パスワードリセットメールの送信に失敗しました' },
          { status: 400 }
        );
      }
    }

    console.log(`[${requestId}] パスワードリセットメール送信成功 (${duration}ms)`);
    return NextResponse.json({
      message: 'パスワードリセットメールを送信しました',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] パスワードリセットエラー (${duration}ms):`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: 'パスワードリセットに失敗しました' }, { status: 500 });
  }
}

// 型ガードの関数
function isResetPasswordRequest(data: unknown): data is ResetPasswordRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<ResetPasswordRequest>;
  return typeof request.email === 'string' && request.email.trim() !== '';
}
