import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

interface PublishRequest {
  isPublic: boolean;
}

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Props): Promise<NextResponse> {
  try {
    const { id } = await params;

    // リクエストボディを取得
    const body = (await request.json()) as unknown;
    if (!isPublishRequest(body)) {
      return NextResponse.json({ error: '公開設定が不正です' }, { status: 400 });
    }

    const { isPublic } = body;

    // 認証チェック
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
      return NextResponse.json({ error: '認証が失敗しました' }, { status: 401 });
    }

    // プランの更新
    const plan = await prisma.plan.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        isPublic,
      },
      include: {
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: plan });
  } catch (error) {
    console.error('公開設定更新エラー:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'プランの公開設定に失敗しました' }, { status: 500 });
  }
}

// 型ガードの関数
function isPublishRequest(data: unknown): data is PublishRequest {
  if (!data || typeof data !== 'object') return false;
  const request = data as Partial<PublishRequest>;
  return typeof request.isPublic === 'boolean';
}
