// プランアイテム管理API
// UC001-005: カスタマイズビュー機能

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * プランアイテム一覧取得
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient(request);
    const { id: planId } = await params;

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
      .select('couple_id, created_by')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'プランが見つかりません' }, { status: 404 });
    }

    // アクセス権限の確認
    let hasAccess = false;

    if (plan.couple_id) {
      // カップルプランの場合：カップルメンバーかチェック
      const { data: couple } = await supabase
        .from('couples')
        .select('id')
        .eq('id', plan.couple_id)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      hasAccess = !!couple;
    } else {
      // 個人プランの場合：作成者かチェック
      hasAccess = plan.created_by === user.id;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // アイテム一覧取得
    const { data: items, error: itemsError } = await supabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true });

    if (itemsError) {
      console.error('アイテム取得エラー:', itemsError);
      return NextResponse.json({ error: 'アイテムの取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'アイテム操作に失敗しました';
    console.error('アイテム一覧取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

/**
 * プランアイテム追加
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient(request);
    const { id: planId } = await params;
    const body = await request.json();

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
      .select('couple_id, created_by')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'プランが見つかりません' }, { status: 404 });
    }

    // アクセス権限の確認
    let hasAccess = false;

    if (plan.couple_id) {
      // カップルプランの場合：カップルメンバーかチェック
      const { data: couple } = await supabase
        .from('couples')
        .select('id')
        .eq('id', plan.couple_id)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      hasAccess = !!couple;
    } else {
      // 個人プランの場合：作成者かチェック
      hasAccess = plan.created_by === user.id;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // 現在の最大order_indexを取得
    const { data: existingItems } = await supabase
      .from('plan_items')
      .select('order_index')
      .eq('plan_id', planId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex =
      existingItems && existingItems.length > 0 ? existingItems[0].order_index + 1 : 0;

    // アイテム追加
    const { data: newItem, error: insertError } = await supabase
      .from('plan_items')
      .insert({
        plan_id: planId,
        type: body.type,
        name: body.name,
        description: body.description,
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        start_time: body.start_time,
        duration: body.duration,
        cost: body.cost,
        order_index: nextOrderIndex,
        notes: body.notes,
      })
      .select()
      .single();

    if (insertError) {
      console.error('アイテム追加エラー:', insertError);
      return NextResponse.json({ error: 'アイテムの追加に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'アイテム操作に失敗しました';
    console.error('アイテム追加エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
