import { ApiResponse, LoginRequest, SignUpRequest, PlanRequest, ShareInvitationRequest } from '@/types/api'

const API_BASE = '/api'

export const api = {
  auth: {
    login: async (data: LoginRequest): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    signup: async (data: SignUpRequest): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return response.json()
    },
  },

  plans: {
    list: async (token: string): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },

    create: async (token: string, data: PlanRequest): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    get: async (token: string, id: string): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/plans/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },

    update: async (token: string, id: string, data: PlanRequest): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    delete: async (token: string, id: string): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/plans/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },

    share: async (token: string, planId: string, data: ShareInvitationRequest): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/plans/${planId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    getInvitations: async (token: string, planId: string): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/plans/${planId}/share`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },
  },
}
