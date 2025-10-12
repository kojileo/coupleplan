// Date Plan Types
// UC-001: AIデートプラン提案・生成機能用の型定義

/**
 * デートプランのステータス
 */
export type DatePlanStatus = 'draft' | 'generating' | 'completed' | 'archived';

/**
 * プランアイテムのタイプ
 */
export type PlanItemType =
  | 'activity'
  | 'restaurant'
  | 'cafe'
  | 'transportation'
  | 'shopping'
  | 'sightseeing'
  | 'entertainment'
  | 'other';

/**
 * デートプラン
 */
export interface DatePlan {
  id: string;
  couple_id: string | null; // カップル連携オプショナル（nullの場合は個人プラン）
  created_by: string;
  title: string;
  description?: string;
  budget?: number;
  duration?: number; // minutes
  status: DatePlanStatus;
  location_prefecture?: string;
  location_city?: string;
  location_station?: string;
  preferences?: string[];
  special_requests?: string;
  ai_generated: boolean;
  ai_generation_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * プランアイテム
 */
export interface PlanItem {
  id: string;
  plan_id: string;
  type: PlanItemType;
  name: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_time?: string; // HH:MM format
  duration?: number; // minutes
  cost?: number;
  order_index: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * プランテンプレート
 */
export interface PlanTemplate {
  id: string;
  name: string;
  category?: string;
  description?: string;
  items: PlanTemplateItem[];
  popularity: number;
  created_by?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * テンプレートアイテム
 */
export interface PlanTemplateItem {
  type: PlanItemType;
  name: string;
  description?: string;
  duration?: number;
  cost?: number;
  order_index: number;
}

/**
 * プランフィードバック
 */
export interface PlanFeedback {
  id: string;
  plan_id: string;
  user_id: string;
  rating: number; // 1-5
  comment?: string;
  submitted_at: string;
}

/**
 * デートプラン作成リクエスト
 */
export interface DatePlanCreateRequest {
  title?: string;
  budget: number;
  duration: number; // hours
  location: {
    prefecture: string;
    city: string;
    station?: string;
  };
  preferences: string[];
  special_requests?: string;
}

/**
 * デートプラン作成レスポンス
 */
export interface DatePlanCreateResponse {
  plan_id: string;
  status: DatePlanStatus;
  estimated_time?: number; // seconds
  created_at: string;
}

/**
 * AI生成リクエスト
 */
export interface AIGenerationRequest {
  couple_id?: string | null; // カップル連携オプショナル
  user_id: string;
  budget: number;
  duration: number; // hours
  location: {
    prefecture: string;
    city: string;
    station?: string;
  };
  preferences: string[];
  special_requests?: string;
  user_profile?: UserProfileContext;
  date_history?: DateHistoryContext[];
}

/**
 * AI生成レスポンス
 */
export interface AIGenerationResponse {
  generation_id: string;
  plans: GeneratedPlan[];
  generation_time: number; // seconds
  metadata?: {
    model_used: string;
    confidence_score: number;
  };
}

/**
 * 生成されたプラン
 */
export interface GeneratedPlan {
  title: string;
  description: string;
  budget: number;
  duration: number;
  items: GeneratedPlanItem[];
  score: number; // 推薦スコア
  reason: string; // 推薦理由
}

/**
 * 生成されたプランアイテム
 */
export interface GeneratedPlanItem {
  type: PlanItemType;
  name: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  start_time: string;
  duration: number;
  cost: number;
  order_index: number;
}

/**
 * ユーザープロフィールコンテキスト（AI生成用）
 */
export interface UserProfileContext {
  name: string;
  age?: number;
  interests?: string[];
  preferences?: Record<string, any>;
}

/**
 * デート履歴コンテキスト（AI生成用）
 */
export interface DateHistoryContext {
  date: string;
  location: string;
  activities: string[];
  budget: number;
  rating?: number;
}

/**
 * プラン一覧取得パラメータ
 */
export interface DatePlanListParams {
  couple_id?: string | null; // nullの場合は個人プランを取得
  created_by?: string; // 作成者で絞り込み（個人プラン取得用）
  status?: DatePlanStatus;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'budget' | 'duration';
  sort_order?: 'asc' | 'desc';
}

/**
 * プラン一覧レスポンス
 */
export interface DatePlanListResponse {
  plans: DatePlan[];
  total_count: number;
  has_more: boolean;
}

/**
 * プラン詳細（アイテム含む）
 */
export interface DatePlanDetail extends DatePlan {
  items: PlanItem[];
  feedback?: PlanFeedback[];
}

/**
 * プランバリデーションエラー
 */
export interface PlanValidationError {
  field: string;
  message: string;
}

/**
 * プランバリデーション結果
 */
export interface PlanValidationResult {
  is_valid: boolean;
  errors: PlanValidationError[];
}

/**
 * 地域データ
 */
export interface LocationData {
  prefectures: string[];
  cities: Record<string, string[]>;
}

/**
 * 好みタグ
 */
export interface PreferenceTag {
  id: string;
  name: string;
  category?: string;
  icon?: string;
}
