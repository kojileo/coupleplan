import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// プロフィール更新のリクエストボディの型定義
interface ProfileUpdateBody {
  name: string;
  email: string;
}

// プロフィール情報の取得
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーIDからプロフィールを取得
    const profile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error(
      'プロフィール取得エラー:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json({ error: 'プロフィールの取得に失敗しました' }, { status: 500 });
  }
}

// プロフィール情報の更新
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = (await req.json()) as ProfileUpdateBody;

    // バリデーション
    if (typeof body.name !== 'string' || typeof body.email !== 'string') {
      return NextResponse.json({ error: '無効なリクエストデータです' }, { status: 400 });
    }

    // Prismaを使ってプロフィールを更新
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        name: body.name,
        email: body.email,
      },
      create: {
        userId: user.id,
        name: body.name,
        email: body.email,
      },
    });

    return NextResponse.json({ data: updatedProfile });
  } catch (error) {
    console.error(
      'プロフィール更新エラー:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json({ error: 'プロフィールの更新に失敗しました' }, { status: 500 });
  }
}
