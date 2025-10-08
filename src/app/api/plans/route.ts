// デートプラン一覧API
// UC-001: AIデートプラン提案・生成機能

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * プラン一覧取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // クエリパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';

    // カップル情報の取得
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();

    if (!couple) {
      return NextResponse.json({ error: 'カップル情報が見つかりません' }, { status: 404 });
    }

    // プラン一覧の取得
    let query = supabase
      .from('date_plans')
      .select('*', { count: 'exact' })
      .eq('couple_id', couple.id);

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: plans, error: plansError, count } = await query;

    if (plansError) {
      console.error('プラン取得エラー:', plansError);
      return NextResponse.json({ error: 'プランの取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({
      plans: plans || [],
      total_count: count || 0,
      has_more: (count || 0) > offset + limit,
    });
  } catch (error: any) {
    console.error('プラン一覧取得エラー:', error);
    return NextResponse.json({ error: 'プランの取得に失敗しました' }, { status: 500 });
  }
}
