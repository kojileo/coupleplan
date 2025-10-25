// デートプラン詳細API
// UC-001: AIデートプラン提案・生成機能

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * プラン詳細取得
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: planId } = await params;

    // プランの取得
    const { data: plan, error: planError } = await supabase
      .from('date_plans')
      .select('*')
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
        .select('*')
        .eq('id', plan.couple_id)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .maybeSingle();

      hasAccess = !!couple;
    } else {
      // 個人プランの場合：作成者かチェック
      hasAccess = plan.created_by === user.id;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // プランアイテムの取得
    const { data: items, error: itemsError } = await supabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true });

    if (itemsError) {
      console.error('アイテム取得エラー:', itemsError);
    }

    // フィードバックの取得
    const { data: feedback, error: feedbackError } = await supabase
      .from('plan_feedback')
      .select('*')
      .eq('plan_id', planId)
      .order('submitted_at', { ascending: false });

    if (feedbackError) {
      console.error('フィードバック取得エラー:', feedbackError);
    }

    return NextResponse.json({
      ...plan,
      items: items || [],
      feedback: feedback || [],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'プラン操作に失敗しました';
    console.error('プラン詳細取得エラー:', error);
    return NextResponse.json({ error: 'プランの取得に失敗しました' }, { status: 500 });
  }
}

/**
 * プラン更新
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: planId } = await params;
    const body = await request.json();

    // プランの取得
    const { data: plan, error: planError } = await supabase
      .from('date_plans')
      .select('*')
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
        .select('*')
        .eq('id', plan.couple_id)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .maybeSingle();

      hasAccess = !!couple;
    } else {
      // 個人プランの場合：作成者かチェック
      hasAccess = plan.created_by === user.id;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // プランの更新
    const { data: updatedPlan, error: updateError } = await supabase
      .from('date_plans')
      .update({
        title: body.title,
        description: body.description,
        budget: body.budget,
        duration: body.duration,
        status: body.status,
        location_prefecture: body.location_prefecture,
        location_city: body.location_city,
        location_station: body.location_station,
        preferences: body.preferences,
        special_requests: body.special_requests,
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateError) {
      console.error('プラン更新エラー:', updateError);
      return NextResponse.json({ error: 'プランの更新に失敗しました' }, { status: 500 });
    }

    return NextResponse.json(updatedPlan);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'プラン操作に失敗しました';
    console.error('プラン更新エラー:', error);
    return NextResponse.json({ error: 'プランの更新に失敗しました' }, { status: 500 });
  }
}

/**
 * プラン削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: planId } = await params;

    // プランの取得
    const { data: plan, error: planError } = await supabase
      .from('date_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'プランが見つかりません' }, { status: 404 });
    }

    // 削除権限の確認（作成者のみ削除可能）
    if (plan.created_by !== user.id) {
      return NextResponse.json({ error: '削除権限がありません' }, { status: 403 });
    }

    // プランの削除（カスケード削除でplan_itemsも削除される）
    const { error: deleteError } = await supabase.from('date_plans').delete().eq('id', planId);

    if (deleteError) {
      console.error('プラン削除エラー:', deleteError);
      return NextResponse.json({ error: 'プランの削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'プラン操作に失敗しました';
    console.error('プラン削除エラー:', error);
    return NextResponse.json({ error: 'プランの削除に失敗しました' }, { status: 500 });
  }
}
