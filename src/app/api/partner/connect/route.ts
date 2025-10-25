/**
 * パートナー連携確立API
 * POST /api/partner/connect - カップル関係を確立
 */

import { NextRequest, NextResponse } from 'next/server';

import { createCouple } from '@/lib/partner-linkage';
import { supabase } from '@/lib/supabase-auth';

interface ConnectRequest {
  invitationId: string;
  fromUserId: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const toUserId = user.id;

    // リクエストボディを取得
    const body: ConnectRequest = await request.json();

    if (!body.invitationId || !body.fromUserId) {
      return NextResponse.json({ error: '招待IDとユーザーIDが必要です' }, { status: 400 });
    }

    // カップル関係を確立
    const result = await createCouple(body.invitationId, body.fromUserId, toUserId, token);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupleId: result.coupleId,
      message: 'パートナーとの連携が完了しました',
    });
  } catch (error) {
    console.error('カップル連携エラー:', error);
    return NextResponse.json({ error: 'カップル連携中にエラーが発生しました' }, { status: 500 });
  }
}
