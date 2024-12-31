export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
  name: string
}

export interface PlanRequest {
  title: string
  description: string
  date?: string
  location: string
  budget: number
}

// 成功レスポンス用のインターフェース
interface SuccessResponse<T = void> {
  data?: T
  message?: string
}

// エラーレスポンス用のインターフェース
interface ErrorResponse {
  error: string
}

// ApiResponse型をユニオン型として定義
export type ApiResponse<T = void> = SuccessResponse<T> | ErrorResponse

export type ShareInvitationRequest = {
  email: string
}
