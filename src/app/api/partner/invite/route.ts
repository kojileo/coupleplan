/**
 * パートナー連携招待API
 * POST /api/partner/invite - 連携招待を作成
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-auth';
import { createPartnerInvitation } from '@/lib/partner-linkage';

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

    const userId = user.id;

    // 連携招待を作成
    const result = await createPartnerInvitation(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      invitationCode: result.invitationCode,
      invitationId: result.invitationId,
      expiresAt: result.expiresAt,
      message: '連携コードを生成しました',
    });
  } catch (error) {
    console.error('連携招待作成エラー:', error);
    return NextResponse.json({ error: '連携招待の作成中にエラーが発生しました' }, { status: 500 });
  }
}
