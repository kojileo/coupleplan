import { SupabaseClient } from '@supabase/supabase-js';

export type Database = SupabaseClient;
export type Auth = SupabaseClient;

/**
 * データベーステーブルの型定義
 */

// subscription_plans テーブル
export interface SubscriptionPlanRow {
  id: string;
  name: 'free' | 'premium';
  display_name: string;
  price_monthly: number;
  daily_plan_limit: number | null;
  monthly_plan_limit: number | null;
  max_saved_plans: number | null;
  features: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// user_subscriptions テーブル
export interface UserSubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// plan_generation_usage テーブル
export interface PlanGenerationUsageRow {
  id: string;
  user_id: string;
  plan_id: string | null;
  generated_at: string;
  generation_date: string;
  generation_month: string;
}
