// Rate limit用のMap（メモリベース）
export const resetPasswordRateLimitMap = new Map<string, { count: number; resetTime: number }>();
