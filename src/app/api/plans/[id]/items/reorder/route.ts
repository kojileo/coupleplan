// プランアイテム並び替えAPI
// UC001-005: カスタマイズビュー機能

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * プランアイテムの並び替え
 * @body { itemIds: string[] } - 新しい順序でのアイテムIDの配列
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient(request);
    const { id: planId } = await params;
    const body = await request.json();
    const { itemIds } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: 'アイテムIDの配列が必要です' }, { status: 400 });
    }

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // プランの存在確認とアクセス権限チェック
    const { data: plan, error: planError } = await supabase
      .from('date_plans')
      .select('couple_id')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'プランが見つかりません' }, { status: 404 });
    }

    // カップルメンバーかチェック
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .eq('id', plan.couple_id)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();

    if (!couple) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // 全てのアイテムがこのプランに属しているか確認
    const { data: items, error: itemsError } = await supabase
      .from('plan_items')
      .select('id')
      .eq('plan_id', planId)
      .in('id', itemIds);

    if (itemsError || !items || items.length !== itemIds.length) {
      return NextResponse.json({ error: '指定されたアイテムが見つかりません' }, { status: 404 });
    }

    // order_indexを更新
    const updates = itemIds.map((itemId, index) => ({
      itemId,
      orderIndex: index,
    }));

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('plan_items')
        .update({ order_index: update.orderIndex })
        .eq('id', update.itemId);

      if (updateError) {
        console.error('並び替えエラー:', updateError);
        return NextResponse.json({ error: 'アイテムの並び替えに失敗しました' }, { status: 500 });
      }
    }

    // 更新後のアイテム一覧を取得
    const { data: updatedItems, error: fetchError } = await supabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('アイテム取得エラー:', fetchError);
      return NextResponse.json({ error: 'アイテムの取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ items: updatedItems });
  } catch (error) {
    console.error('並び替えエラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
