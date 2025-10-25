import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/subscription/current
 *
 * 現在のサブスクリプション情報を取得
 *
 * @returns {
 *   subscription: {
 *     id: string,
 *     status: string,
 *     created_at: string
 *   },
 *   plan: {
 *     name: string,
 *     display_name: string,
 *     price_monthly: number,
 *     daily_plan_limit: number | null,
 *     monthly_plan_limit: number | null,
 *     max_saved_plans: number | null,
 *     features: object
 *   }
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

    // サブスクリプション情報を取得
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

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        created_at: subscription.created_at,
      },
      plan: subscription.plan,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      {
        error: 'サブスクリプション情報の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
