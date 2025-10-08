// デートプラン生成API
// UC-001: AIデートプラン提案・生成機能

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDatePlan } from '@/lib/ai-service';
import { validateDatePlanRequest } from '@/lib/plan-validation';
import { DatePlanCreateRequest, AIGenerationRequest } from '@/types/date-plan';

export async function POST(request: NextRequest) {
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

    // リクエストボディの取得
    const body: DatePlanCreateRequest = await request.json();

    // バリデーション
    const validationResult = validateDatePlanRequest(body);
    if (!validationResult.is_valid) {
      return NextResponse.json(
        {
          error: 'バリデーションエラー',
          validation_errors: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // カップル情報の取得
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();

    if (coupleError || !couple) {
      return NextResponse.json({ error: 'カップル情報が見つかりません' }, { status: 404 });
    }

    // ユーザープロフィールの取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, birthday, interests')
      .eq('id', user.id)
      .single();

    // デート履歴の取得（最新3件）
    const { data: dateHistory } = await supabase
      .from('date_plans')
      .select('created_at, location_city, preferences, budget')
      .eq('couple_id', couple.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(3);

    // AI生成リクエストの構築
    const aiRequest: AIGenerationRequest = {
      couple_id: couple.id,
      user_id: user.id,
      budget: body.budget,
      duration: body.duration,
      location: body.location,
      preferences: body.preferences,
      special_requests: body.special_requests,
      user_profile: profile
        ? {
            name: profile.name || 'ユーザー',
            interests: profile.interests || [],
          }
        : undefined,
      date_history: dateHistory
        ? dateHistory.map((h) => ({
            date: h.created_at,
            location: h.location_city || '',
            activities: h.preferences || [],
            budget: h.budget || 0,
          }))
        : undefined,
    };

    // AI生成の実行
    const aiResponse = await generateDatePlan(aiRequest);

    // 生成されたプランをデータベースに保存
    const savedPlans = await Promise.all(
      aiResponse.plans.map(async (plan, index) => {
        // date_plansテーブルに保存
        const { data: savedPlan, error: planError } = await supabase
          .from('date_plans')
          .insert({
            couple_id: couple.id,
            created_by: user.id,
            title: plan.title,
            description: plan.description,
            budget: plan.budget,
            duration: plan.duration,
            status: 'draft',
            location_prefecture: body.location.prefecture,
            location_city: body.location.city,
            location_station: body.location.station,
            preferences: body.preferences,
            special_requests: body.special_requests,
            ai_generated: true,
            ai_generation_id: aiResponse.generation_id,
          })
          .select()
          .single();

        if (planError || !savedPlan) {
          console.error('プラン保存エラー:', planError);
          return null;
        }

        // plan_itemsテーブルに保存
        if (plan.items && plan.items.length > 0) {
          const items = plan.items.map((item) => ({
            plan_id: savedPlan.id,
            type: item.type,
            name: item.name,
            description: item.description,
            location: item.location,
            latitude: item.latitude,
            longitude: item.longitude,
            start_time: item.start_time,
            duration: item.duration,
            cost: item.cost,
            order_index: item.order_index,
          }));

          const { error: itemsError } = await supabase.from('plan_items').insert(items);

          if (itemsError) {
            console.error('アイテム保存エラー:', itemsError);
          }
        }

        return {
          ...savedPlan,
          score: plan.score,
          reason: plan.reason,
        };
      })
    );

    // nullを除外
    const validPlans = savedPlans.filter((p) => p !== null);

    if (validPlans.length === 0) {
      return NextResponse.json({ error: 'プランの保存に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      plans: validPlans,
      generation_id: aiResponse.generation_id,
      generation_time: aiResponse.generation_time,
      metadata: aiResponse.metadata,
    });
  } catch (error: any) {
    console.error('プラン生成エラー:', error);
    return NextResponse.json(
      {
        error: error.message || 'プランの生成に失敗しました',
        code: error.code || 'GENERATION_ERROR',
      },
      { status: 500 }
    );
  }
}
