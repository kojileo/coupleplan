import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// いいねを追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: planId } = await params;

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

    // プランの存在確認
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'プランが見つかりません' }, { status: 404 });
    }

    // いいねの作成
    const like = await prisma.like.create({
      data: {
        planId,
        userId: user.id,
      },
      include: {
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: like });
  } catch (error) {
    if (error instanceof Error) {
      console.error('いいねの追加に失敗しました:', error.message);
      // ユニーク制約違反の場合
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ error: '既にいいね済みです' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'いいねの追加に失敗しました' }, { status: 500 });
  }
}

// いいねを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: planId } = await params;

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

    // いいねの削除
    await prisma.like.delete({
      where: {
        planId_userId: {
          planId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ data: null });
  } catch (error) {
    if (error instanceof Error) {
      console.error('いいねの削除に失敗しました:', error.message);
      // レコードが見つからない場合
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json({ error: 'いいねが見つかりません' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'いいねの削除に失敗しました' }, { status: 500 });
  }
}
