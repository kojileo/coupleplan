import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 公開プラン一覧の取得
export async function GET(): Promise<NextResponse> {
  try {
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
        locations: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error('公開プラン取得エラー:', error);
    return NextResponse.json({ error: '公開プランの取得に失敗しました' }, { status: 500 });
  }
}
