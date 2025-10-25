// プランバリデーション
// デートプラン作成時のバリデーション

import {
  DatePlanCreateRequest,
  PlanValidationResult,
  PlanValidationError,
} from '@/types/date-plan';

import { isPrefectureValid, isCityValid } from './location-data';

/**
 * 予算の最小値と最大値
 */
const BUDGET_MIN = 1000;
const BUDGET_MAX = 100000;

/**
 * 所要時間の最小値と最大値（時間）
 */
const DURATION_MIN = 1;
const DURATION_MAX = 12;

/**
 * 好みの最大選択数
 */
const PREFERENCES_MAX = 10;

/**
 * 特別な要望の最大文字数
 */
const SPECIAL_REQUESTS_MAX_LENGTH = 500;

/**
 * デートプラン作成リクエストをバリデーション
 */
export function validateDatePlanRequest(request: DatePlanCreateRequest): PlanValidationResult {
  const errors: PlanValidationError[] = [];

  // 予算のバリデーション
  if (!request.budget) {
    errors.push({
      field: 'budget',
      message: '予算を入力してください',
    });
  } else if (typeof request.budget !== 'number' || isNaN(request.budget)) {
    errors.push({
      field: 'budget',
      message: '正しい金額を入力してください',
    });
  } else if (request.budget < BUDGET_MIN) {
    errors.push({
      field: 'budget',
      message: `${BUDGET_MIN.toLocaleString()}円以上で入力してください`,
    });
  } else if (request.budget > BUDGET_MAX) {
    errors.push({
      field: 'budget',
      message: `${BUDGET_MAX.toLocaleString()}円以下で入力してください`,
    });
  }

  // 所要時間のバリデーション
  if (!request.duration) {
    errors.push({
      field: 'duration',
      message: '所要時間を入力してください',
    });
  } else if (typeof request.duration !== 'number' || isNaN(request.duration)) {
    errors.push({
      field: 'duration',
      message: '正しい時間を入力してください',
    });
  } else if (request.duration < DURATION_MIN) {
    errors.push({
      field: 'duration',
      message: `${DURATION_MIN}時間以上で入力してください`,
    });
  } else if (request.duration > DURATION_MAX) {
    errors.push({
      field: 'duration',
      message: `${DURATION_MAX}時間以下で入力してください`,
    });
  }

  // 地域のバリデーション
  if (!request.location) {
    errors.push({
      field: 'location',
      message: '地域を選択してください',
    });
  } else {
    if (!request.location.prefecture) {
      errors.push({
        field: 'location.prefecture',
        message: '都道府県を選択してください',
      });
    } else if (!isPrefectureValid(request.location.prefecture)) {
      errors.push({
        field: 'location.prefecture',
        message: '有効な都道府県を選択してください',
      });
    }

    if (!request.location.city) {
      errors.push({
        field: 'location.city',
        message: '市区町村を選択してください',
      });
    } else if (
      request.location.prefecture &&
      !isCityValid(request.location.prefecture, request.location.city)
    ) {
      errors.push({
        field: 'location.city',
        message: '有効な市区町村を選択してください',
      });
    }
  }

  // 好みのバリデーション
  if (!request.preferences) {
    errors.push({
      field: 'preferences',
      message: '好みを選択してください',
    });
  } else if (!Array.isArray(request.preferences)) {
    errors.push({
      field: 'preferences',
      message: '好みは配列で指定してください',
    });
  } else if (request.preferences.length === 0) {
    errors.push({
      field: 'preferences',
      message: '少なくとも1つの好みを選択してください',
    });
  } else if (request.preferences.length > PREFERENCES_MAX) {
    errors.push({
      field: 'preferences',
      message: `${PREFERENCES_MAX}個以下で選択してください`,
    });
  }

  // 特別な要望のバリデーション
  if (request.special_requests) {
    if (typeof request.special_requests !== 'string') {
      errors.push({
        field: 'special_requests',
        message: '特別な要望は文字列で入力してください',
      });
    } else if (request.special_requests.length > SPECIAL_REQUESTS_MAX_LENGTH) {
      errors.push({
        field: 'special_requests',
        message: `${SPECIAL_REQUESTS_MAX_LENGTH}文字以内で入力してください`,
      });
    }
  }

  return {
    is_valid: errors.length === 0,
    errors,
  };
}

/**
 * 予算が範囲内かチェック
 */
export function isBudgetValid(budget: number): boolean {
  return budget >= BUDGET_MIN && budget <= BUDGET_MAX;
}

/**
 * 所要時間が範囲内かチェック
 */
export function isDurationValid(duration: number): boolean {
  return duration >= DURATION_MIN && duration <= DURATION_MAX;
}

/**
 * バリデーションエラーメッセージを取得
 */
export function getValidationErrorMessage(
  errors: PlanValidationError[],
  field: string
): string | undefined {
  const error = errors.find((e) => e.field === field);
  return error?.message;
}

/**
 * フィールドがエラーかチェック
 */
export function hasFieldError(errors: PlanValidationError[], field: string): boolean {
  return errors.some((e) => e.field === field);
}

/**
 * プランアイテムのバリデーション
 */
export function validatePlanItem(item: {
  name: string;
  type: string;
  cost?: number;
  duration?: number;
}): PlanValidationResult {
  const errors: PlanValidationError[] = [];

  // 名前のバリデーション
  if (!item.name || item.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'アイテム名を入力してください',
    });
  } else if (item.name.length > 200) {
    errors.push({
      field: 'name',
      message: '200文字以内で入力してください',
    });
  }

  // タイプのバリデーション
  const validTypes = ['restaurant', 'activity', 'cafe', 'transport', 'shopping', 'other'];
  if (!item.type || !validTypes.includes(item.type)) {
    errors.push({
      field: 'type',
      message: '有効なタイプを選択してください',
    });
  }

  // 費用のバリデーション
  if (item.cost !== undefined && item.cost !== null) {
    if (typeof item.cost !== 'number' || isNaN(item.cost)) {
      errors.push({
        field: 'cost',
        message: '正しい金額を入力してください',
      });
    } else if (item.cost < 0) {
      errors.push({
        field: 'cost',
        message: '0円以上で入力してください',
      });
    } else if (item.cost > 100000) {
      errors.push({
        field: 'cost',
        message: '100,000円以下で入力してください',
      });
    }
  }

  // 所要時間のバリデーション（分）
  if (item.duration !== undefined && item.duration !== null) {
    if (typeof item.duration !== 'number' || isNaN(item.duration)) {
      errors.push({
        field: 'duration',
        message: '正しい時間を入力してください',
      });
    } else if (item.duration < 0) {
      errors.push({
        field: 'duration',
        message: '0分以上で入力してください',
      });
    } else if (item.duration > 720) {
      // 最大12時間
      errors.push({
        field: 'duration',
        message: '720分（12時間）以下で入力してください',
      });
    }
  }

  return {
    is_valid: errors.length === 0,
    errors,
  };
}

/**
 * プラン更新時のバリデーション
 */
export function validatePlanUpdate(plan: {
  title?: string;
  budget?: number;
  duration?: number;
}): PlanValidationResult {
  const errors: PlanValidationError[] = [];

  // タイトルのバリデーション
  if (plan.title !== undefined) {
    if (plan.title.trim() === '') {
      errors.push({
        field: 'title',
        message: 'タイトルを入力してください',
      });
    } else if (plan.title.length > 200) {
      errors.push({
        field: 'title',
        message: '200文字以内で入力してください',
      });
    }
  }

  // 予算のバリデーション
  if (plan.budget !== undefined) {
    if (typeof plan.budget !== 'number' || isNaN(plan.budget)) {
      errors.push({
        field: 'budget',
        message: '正しい金額を入力してください',
      });
    } else if (plan.budget < BUDGET_MIN) {
      errors.push({
        field: 'budget',
        message: `${BUDGET_MIN.toLocaleString()}円以上で入力してください`,
      });
    } else if (plan.budget > BUDGET_MAX) {
      errors.push({
        field: 'budget',
        message: `${BUDGET_MAX.toLocaleString()}円以下で入力してください`,
      });
    }
  }

  // 所要時間のバリデーション（分）
  if (plan.duration !== undefined) {
    if (typeof plan.duration !== 'number' || isNaN(plan.duration)) {
      errors.push({
        field: 'duration',
        message: '正しい時間を入力してください',
      });
    } else if (plan.duration < 0) {
      errors.push({
        field: 'duration',
        message: '0分以上で入力してください',
      });
    }
  }

  return {
    is_valid: errors.length === 0,
    errors,
  };
}

/**
 * バリデーション定数をエクスポート
 */
export const validationConstants = {
  BUDGET_MIN,
  BUDGET_MAX,
  DURATION_MIN,
  DURATION_MAX,
  PREFERENCES_MAX,
  SPECIAL_REQUESTS_MAX_LENGTH,
};
