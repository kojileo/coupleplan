export interface ApiResponse<T = any> {
  data?: T
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
  name?: string
}

export interface PlanRequest {
  title: string
  description?: string
  date?: string
  budget: number
  location?: string
}

export type ShareInvitationRequest = {
  email: string
}
