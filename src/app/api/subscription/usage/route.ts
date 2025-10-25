import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/subscription/usage
 *
 * AIプラン生成後に使用履歴を記録
 *
 * @body {
 *   planId?: string // 生成されたプランのID（オプション）
 * }
 *
 * @returns {
 *   success: boolean,
 *   canGenerate: boolean,
 *   remaining: { daily: number | null, monthly: number | null }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    // ユーザー認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディを解析
    const body = await request.json();
    const { planId } = body;

    // 使用履歴を記録
    const { error: insertError } = await supabase.from('plan_generation_usage').insert({
      user_id: user.id,
      plan_id: planId || null,
    });

    if (insertError) {
      console.error('Usage insert error:', insertError);
      throw insertError;
    }

    // 現在の制限状況を取得して返す
    // 内部APIコールではなく、直接データベースクエリを使用
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*)
      `
      )
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({
        success: true,
        message: '使用履歴を記録しました',
        canGenerate: true,
        remaining: { daily: null, monthly: null },
      });
    }

    const plan = subscription.plan;

    // 無制限プランの場合
    if (plan.daily_plan_limit === null && plan.monthly_plan_limit === null) {
      return NextResponse.json({
        success: true,
        canGenerate: true,
        remaining: {
          daily: null,
          monthly: null,
        },
        plan: plan.name,
      });
    }

    // 現在の日時（JST）
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    const thisMonth = today.substring(0, 7) + '-01';

    // 日次・月次の使用回数を取得
    const { count: dailyCount } = await supabase
      .from('plan_generation_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('generation_date', today);

    const { count: monthlyCount } = await supabase
      .from('plan_generation_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('generation_month', thisMonth);

    const dailyUsed = dailyCount || 0;
    const monthlyUsed = monthlyCount || 0;

    const dailyRemaining = plan.daily_plan_limit
      ? Math.max(0, plan.daily_plan_limit - dailyUsed)
      : null;
    const monthlyRemaining = plan.monthly_plan_limit
      ? Math.max(0, plan.monthly_plan_limit - monthlyUsed)
      : null;

    const canGenerate =
      (dailyRemaining === null || dailyRemaining > 0) &&
      (monthlyRemaining === null || monthlyRemaining > 0);

    return NextResponse.json({
      success: true,
      canGenerate,
      remaining: {
        daily: dailyRemaining,
        monthly: monthlyRemaining,
      },
      used: {
        daily: dailyUsed,
        monthly: monthlyUsed,
      },
      plan: plan.name,
    });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json(
      {
        error: '使用履歴の記録に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
