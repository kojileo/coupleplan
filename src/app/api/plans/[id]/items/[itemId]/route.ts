// 個別プランアイテム管理API
// UC001-005: カスタマイズビュー機能

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * プランアイテム更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient(request);
    const { id: planId, itemId } = await params;
    const body = await request.json();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // アイテムの存在確認
    const { data: item, error: itemError } = await supabase
      .from('plan_items')
      .select('plan_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item || item.plan_id !== planId) {
      return NextResponse.json({ error: 'アイテムが見つかりません' }, { status: 404 });
    }

    // プランのアクセス権限チェック
    const { data: plan } = await supabase
      .from('date_plans')
      .select('couple_id')
      .eq('id', planId)
      .single();

    if (!plan) {
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

    // アイテム更新
    const { data: updatedItem, error: updateError } = await supabase
      .from('plan_items')
      .update({
        type: body.type,
        name: body.name,
        description: body.description,
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        start_time: body.start_time,
        duration: body.duration,
        cost: body.cost,
        notes: body.notes,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) {
      console.error('アイテム更新エラー:', updateError);
      return NextResponse.json({ error: 'アイテムの更新に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error: any) {
    console.error('アイテム更新エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

/**
 * プランアイテム削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient(request);
    const { id: planId, itemId } = await params;

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // アイテムの存在確認
    const { data: item, error: itemError } = await supabase
      .from('plan_items')
      .select('plan_id, order_index')
      .eq('id', itemId)
      .single();

    if (itemError || !item || item.plan_id !== planId) {
      return NextResponse.json({ error: 'アイテムが見つかりません' }, { status: 404 });
    }

    // プランのアクセス権限チェック
    const { data: plan } = await supabase
      .from('date_plans')
      .select('couple_id')
      .eq('id', planId)
      .single();

    if (!plan) {
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

    // アイテム削除
    const { error: deleteError } = await supabase.from('plan_items').delete().eq('id', itemId);

    if (deleteError) {
      console.error('アイテム削除エラー:', deleteError);
      return NextResponse.json({ error: 'アイテムの削除に失敗しました' }, { status: 500 });
    }

    // 削除後、order_indexを再調整
    const { data: remainingItems } = await supabase
      .from('plan_items')
      .select('id, order_index')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true });

    if (remainingItems && remainingItems.length > 0) {
      // order_indexを0から連番に振り直す
      const updates = remainingItems.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from('plan_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
    }

    return NextResponse.json({ message: 'アイテムを削除しました' });
  } catch (error: any) {
    console.error('アイテム削除エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
