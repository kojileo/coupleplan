import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/subscription/check-limit
 *
 * 現在のユーザーがAIプラン生成可能かをチェック
 * 日次制限（3回/日）と月次制限（10回/月）を確認
 *
 * @returns {
 *   canGenerate: boolean,
 *   remaining: { daily: number | null, monthly: number | null },
 *   used: { daily: number, monthly: number },
 *   limits: { daily: number | null, monthly: number | null },
 *   plan: string
 * }
 */
export async function GET(request: NextRequest) {
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

    // 現在のプラン情報を取得
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
      return NextResponse.json(
        { error: 'サブスクリプション情報が見つかりません' },
        { status: 404 }
      );
    }

    const plan = subscription.plan as any;

    // 無制限プランの場合（Premium）
    if (plan.daily_plan_limit === null && plan.monthly_plan_limit === null) {
      return NextResponse.json({
        canGenerate: true,
        remaining: {
          daily: null,
          monthly: null,
        },
        used: {
          daily: 0,
          monthly: 0,
        },
        limits: {
          daily: null,
          monthly: null,
        },
        plan: plan.name,
      });
    }

    // 現在の日時（JST）を取得
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    const thisMonth = today.substring(0, 7) + '-01';

    // 日次使用回数を取得
    const { count: dailyCount, error: dailyError } = await supabase
      .from('plan_generation_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('generation_date', today);

    // 月次使用回数を取得
    const { count: monthlyCount, error: monthlyError } = await supabase
      .from('plan_generation_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('generation_month', thisMonth);

    if (dailyError || monthlyError) {
      console.error('Usage query error:', { dailyError, monthlyError });
      throw new Error('使用履歴の取得に失敗しました');
    }

    const dailyUsed = dailyCount || 0;
    const monthlyUsed = monthlyCount || 0;

    // 制限チェック
    const dailyRemaining = plan.daily_plan_limit
      ? Math.max(0, plan.daily_plan_limit - dailyUsed)
      : null;
    const monthlyRemaining = plan.monthly_plan_limit
      ? Math.max(0, plan.monthly_plan_limit - monthlyUsed)
      : null;

    // 両方の制限をクリアしている必要がある
    const canGenerate =
      (dailyRemaining === null || dailyRemaining > 0) &&
      (monthlyRemaining === null || monthlyRemaining > 0);

    return NextResponse.json({
      canGenerate,
      remaining: {
        daily: dailyRemaining,
        monthly: monthlyRemaining,
      },
      used: {
        daily: dailyUsed,
        monthly: monthlyUsed,
      },
      limits: {
        daily: plan.daily_plan_limit,
        monthly: plan.monthly_plan_limit,
      },
      plan: plan.name,
    });
  } catch (error) {
    console.error('Error checking limit:', error);
    return NextResponse.json(
      {
        error: '制限チェックに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
