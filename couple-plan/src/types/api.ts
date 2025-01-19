export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
  name: string
}

export type PlanRequest = {
  title: string
  description: string
  date?: Date | null
  location?: string | null
  budget: number
  isPublic: boolean
}

export interface ApiResponse<T = void> {
  data?: T
  error?: string
  message?: string
}

export type ShareInvitationRequest = {
  email: string
}
