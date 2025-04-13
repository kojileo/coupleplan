import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';
import type { PlanRequest } from '@/types/api';
import type { Prisma } from '@prisma/client';

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
    console.log('リクエストボディ:', body);

    if (!isPlanRequest(body)) {
      console.error('無効なリクエストデータ:', body);
      const typedBody = body as Record<string, unknown>;
      return NextResponse.json({ 
        error: '無効なリクエストデータです',
        details: {
          title: typeof typedBody.title,
          description: typeof typedBody.description,
          date: typeof typedBody.date,
          locations: typeof typedBody.locations,
          region: typeof typedBody.region,
          budget: typeof typedBody.budget,
          isPublic: typeof typedBody.isPublic,
          category: typeof typedBody.category,
        }
      }, { status: 400 });
    }

    const planData = body;

    try {
      // プロファイルの存在確認
      let profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });

      // プロファイルが存在しない場合は作成
      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            userId: user.id,
            name: user.user_metadata.name || null,
            email: user.email || null,
          },
        });
      }

      const plan = await prisma.plan.create({
        data: {
          title: planData.title,
          description: planData.description,
          date: planData.date ? new Date(planData.date) : null,
          region: planData.region,
          budget: planData.budget,
          isPublic: planData.isPublic,
          category: planData.category,
          userId: user.id,
          locations: {
            create: planData.locations.map(location => ({
              url: location.url,
              name: location.name || null
            }))
          }
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

      return NextResponse.json({ data: plan }, { status: 201 });
    } catch (error) {
      console.error('Prismaエラー:', error);
      return NextResponse.json({ 
        error: 'プランの作成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      }, { status: 500 });
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('プラン作成エラー:', err);
    return NextResponse.json({ 
      error: 'プランの作成に失敗しました',
      details: err.message
    }, { status: 500 });
  }
}

// 型ガードの関数
function isPlanRequest(data: unknown): data is PlanRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<PlanRequest>;
  return (
    typeof request.title === 'string' &&
    typeof request.description === 'string' &&
    (request.date === null || typeof request.date === 'string') &&
    Array.isArray(request.locations) &&
    request.locations.every(
      (location) =>
        typeof location === 'object' &&
        location !== null &&
        typeof location.url === 'string' &&
        (location.name === null || location.name === undefined || typeof location.name === 'string')
    ) &&
    (request.region === null || request.region === undefined || typeof request.region === 'string') &&
    typeof request.budget === 'number' &&
    typeof request.isPublic === 'boolean' &&
    (request.category === null || request.category === undefined || typeof request.category === 'string')
  );
}
