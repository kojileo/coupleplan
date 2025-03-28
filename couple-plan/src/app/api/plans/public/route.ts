import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// 公開プラン一覧の取得
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

    // すべての公開プランを取得
    const plans = await prisma.plan.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        profile: {
          select: {
            name: true,
          },
        },
        likes: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error(
      '公開プラン取得エラー:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json({ error: '公開プランの取得に失敗しました' }, { status: 500 });
  }
}
