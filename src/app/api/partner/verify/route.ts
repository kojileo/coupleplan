/**
 * パートナー連携検証API
 * POST /api/partner/verify - 連携コードを検証
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-auth';
import { verifyPartnerInvitation } from '@/lib/partner-linkage';

interface VerifyRequest {
  invitationCode: string;
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

    const userId = user.id;

    // リクエストボディを取得
    const body: VerifyRequest = await request.json();

    if (!body.invitationCode) {
      return NextResponse.json({ error: '連携コードが必要です' }, { status: 400 });
    }

    // 連携コードを検証
    const result = await verifyPartnerInvitation(body.invitationCode, userId, token);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      invitationId: result.invitationId,
      fromUserId: result.fromUserId,
      fromUserName: result.fromUserName,
      fromUserEmail: result.fromUserEmail,
      fromUserAvatar: result.fromUserAvatar,
      message: '連携コードが検証されました',
    });
  } catch (error) {
    console.error('連携検証エラー:', error);
    return NextResponse.json({ error: '連携検証中にエラーが発生しました' }, { status: 500 });
  }
}
