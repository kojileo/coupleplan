import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

interface Location {
  url: string;
  name: string | null;
}

interface PlanRequest {
  title: string;
  description: string;
  date: string | null;
  locations: Location[];
  region: string | null;
  budget: number;
  isPublic: boolean;
  category: string | null;
}

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

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json({ error: '無効なJSONデータです' }, { status: 400 });
    }

    if (!isPlanRequest(requestBody)) {
      console.error('無効なリクエストデータ:', requestBody);
      return NextResponse.json(
        {
          error: '無効なリクエストデータです',
        },
        { status: 400 }
      );
    }

    // 型ガードを通過したデータを検証して変換
    const validatedData: PlanRequest = {
      title: String(requestBody.title).trim(),
      description: String(requestBody.description).trim(),
      date: requestBody.date ? String(requestBody.date).trim() : null,
      locations: requestBody.locations.map((location: Location) => ({
        url: location.url,
        name: location.name ? String(location.name).trim() : null,
      })),
      region: requestBody.region ? String(requestBody.region).trim() : null,
      budget: Math.max(0, Number(requestBody.budget)),
      isPublic: Boolean(requestBody.isPublic),
      category: requestBody.category ? String(requestBody.category).trim() : null,
    };

    try {
      const plan = await prisma.plan.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          date: validatedData.date ? new Date(validatedData.date) : null,
          region: validatedData.region,
          budget: validatedData.budget,
          isPublic: validatedData.isPublic,
          category: validatedData.category,
          userId: user.id,
          locations: {
            create: validatedData.locations,
          },
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

      return NextResponse.json({ data: plan }, { status: 201 });
    } catch (error) {
      console.error('プラン作成エラー:', error instanceof Error ? error.message : 'Unknown error');
      return NextResponse.json({ error: 'プランの作成に失敗しました' }, { status: 500 });
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('プラン作成エラー:', err);
    return NextResponse.json(
      {
        error: 'プランの作成に失敗しました',
        details: err.message,
      },
      { status: 500 }
    );
  }
}

// 型ガードの関数
function isPlanRequest(data: unknown): data is PlanRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<PlanRequest>;

  // 必須フィールドのチェック
  if (
    typeof request.title !== 'string' ||
    typeof request.description !== 'string' ||
    typeof request.isPublic !== 'boolean' ||
    typeof request.budget !== 'number' ||
    !Array.isArray(request.locations)
  ) {
    return false;
  }

  // locationsの各要素をチェック
  if (
    !request.locations.every(
      (location) =>
        typeof location === 'object' &&
        location !== null &&
        typeof location.url === 'string' &&
        (location.name === null || typeof location.name === 'string')
    )
  ) {
    return false;
  }

  // オプショナルフィールドのチェック
  if (request.date !== undefined && request.date !== null && typeof request.date !== 'string') {
    return false;
  }

  if (
    request.region !== undefined &&
    request.region !== null &&
    typeof request.region !== 'string'
  ) {
    return false;
  }

  if (
    request.category !== undefined &&
    request.category !== null &&
    typeof request.category !== 'string'
  ) {
    return false;
  }

  return true;
}
