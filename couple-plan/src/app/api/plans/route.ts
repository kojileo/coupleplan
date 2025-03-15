import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';
import type { PlanRequest } from '@/types/api';

// プラン一覧の取得（自分のプラン）
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

    // 自分のプランを取得
    const plans = await prisma.plan.findMany({
      where: {
        userId: user.id,
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
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('プラン取得エラー:', err);
    return NextResponse.json({ error: 'プランの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = (await request.json()) as unknown;
    if (!isPlanRequest(body)) {
      return NextResponse.json({ error: '無効なリクエストデータです' }, { status: 400 });
    }

    const planData = body;

    const plan = await prisma.plan.create({
      data: {
        title: planData.title,
        description: planData.description,
        date: planData.date,
        location: planData.location,
        budget: planData.budget,
        isPublic: planData.isPublic,
        userId: user.id,
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

    return NextResponse.json({ data: plan });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('プラン作成エラー:', err);
    return NextResponse.json({ error: 'プランの作成に失敗しました' }, { status: 500 });
  }
}

// 型ガードの関数
function isPlanRequest(data: unknown): data is PlanRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<PlanRequest>;
  return (
    typeof request.title === 'string' &&
    typeof request.description === 'string' &&
    typeof request.date === 'string' &&
    typeof request.location === 'string' &&
    typeof request.budget === 'number' &&
    typeof request.isPublic === 'boolean'
  );
}
