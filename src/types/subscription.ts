/**
 * サブスクリプション関連の型定義
 */

// プラン名の型
export type PlanName = 'free' | 'premium';

// プランの型
export interface SubscriptionPlan {
  id: string;
  name: PlanName;
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

// ユーザーサブスクリプションの型
export interface UserSubscription {
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
  plan?: SubscriptionPlan;
}

// 使用制限情報の型
export interface UsageLimit {
  canGenerate: boolean;
  remaining: {
    daily: number | null;
    monthly: number | null;
  };
  used: {
    daily: number;
    monthly: number;
  };
  limits: {
    daily: number | null;
    monthly: number | null;
  };
  plan: PlanName;
}

// プラン生成使用履歴の型
export interface PlanGenerationUsage {
  id: string;
  user_id: string;
  plan_id: string | null;
  generated_at: string;
  generation_date: string;
  generation_month: string;
}

// API レスポンス型

export interface CheckLimitResponse {
  canGenerate: boolean;
  remaining: {
    daily: number | null;
    monthly: number | null;
  };
  used: {
    daily: number;
    monthly: number;
  };
  limits: {
    daily: number | null;
    monthly: number | null;
  };
  plan: PlanName;
}

export interface RecordUsageResponse {
  success: boolean;
  canGenerate: boolean;
  remaining: {
    daily: number | null;
    monthly: number | null;
  };
  used?: {
    daily: number;
    monthly: number;
  };
  plan: PlanName;
}

export interface CurrentSubscriptionResponse {
  subscription: {
    id: string;
    status: string;
    created_at: string;
  };
  plan: SubscriptionPlan;
}

// エラーレスポンスの型
export interface SubscriptionError {
  error: string;
  details?: string;
}
