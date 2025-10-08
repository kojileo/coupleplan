/**
 * パートナー情報取得API
 * GET /api/partner - カップル情報を取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-auth';
import { getCouple } from '@/lib/partner-linkage';

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // カップル情報を取得
    const result = await getCouple(userId, token);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.couple) {
      return NextResponse.json({
        success: true,
        couple: null,
        message: 'パートナーが連携されていません',
      });
    }

    return NextResponse.json({
      success: true,
      couple: result.couple,
      message: 'パートナー情報を取得しました',
    });
  } catch (error) {
    console.error('パートナー情報取得エラー:', error);
    return NextResponse.json(
      { error: 'パートナー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
