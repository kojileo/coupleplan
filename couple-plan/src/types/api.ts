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

export interface ApiResponse<T = void> {
  data?: T
  error?: string
  message?: string
}

export type ShareInvitationRequest = {
  email: string
}
