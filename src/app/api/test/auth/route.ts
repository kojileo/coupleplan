import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// テスト環境でのみ動作する認証バイパス機能
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 本番環境では無効
  if (process.env.NODE_ENV !== 'test' && process.env.BYPASS_EMAIL_VERIFICATION !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  try {
    const body: {
      email: string;
      password: string;
      name: string;
      bypass_email_verification: boolean;
    } = (await request.json()) as {
      email: string;
      password: string;
      name: string;
      bypass_email_verification: boolean;
    };

    const { email, password, name, bypass_email_verification } = body;

    if (!bypass_email_verification) {
      return NextResponse.json({ error: 'Bypass flag required' }, { status: 400 });
    }

    // 管理者用クライアント（サービスロールキー使用）
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // 管理者権限でユーザーを作成（メール認証済み状態）
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール認証済みに設定
      user_metadata: {
        name,
      },
    });

    if (error) {
      console.error('テスト用ユーザー作成エラー:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // セッション生成
    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (sessionError) {
      console.error('テスト用セッション生成エラー:', sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 400 });
    }

    return NextResponse.json({
      user: user.user,
      session,
      message: 'Test user created with email verification bypassed',
    });
  } catch (error: unknown) {
    console.error('テスト認証エラー:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// テスト用ユーザー削除
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV !== 'test' && process.env.BYPASS_EMAIL_VERIFICATION !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  try {
    const body: { email: string } = (await request.json()) as { email: string };
    const { email } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // ユーザー削除
    const { error } = await supabaseAdmin.auth.admin.deleteUser(email);

    if (error) {
      console.error('テスト用ユーザー削除エラー:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Test user deleted' });
  } catch (error: unknown) {
    console.error('テストユーザー削除エラー:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
