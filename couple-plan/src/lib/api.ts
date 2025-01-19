import { ApiResponse, LoginRequest, SignUpRequest, PlanRequest } from '@/types/api'
import type { Plan } from '@/types/plan'
import type { Profile } from '@/types/profile'

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

  profile: {
    get: async (token: string, userId: string): Promise<ApiResponse<Profile>> => {
      const response = await fetch(`${API_BASE}/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },

    update: async (token: string, name: string): Promise<ApiResponse<Profile>> => {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })
      return response.json()
    },
  },

  plans: {
    list: async (token: string): Promise<ApiResponse<Plan[]>> => {
      const response = await fetch(`${API_BASE}/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },

    create: async (token: string, data: PlanRequest): Promise<ApiResponse<Plan>> => {
      try {
        const response = await fetch(`${API_BASE}/plans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('プランの作成に失敗しました')
        }

        return response.json()
      } catch (error) {
        console.error('API error:', error)
        return {
          error: error instanceof Error ? error.message : 'プランの作成に失敗しました'
        }
      }
    },

    get: async (token: string, id: string): Promise<ApiResponse<Plan>> => {
      const response = await fetch(`${API_BASE}/plans/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },

    update: async (token: string, id: string, data: PlanRequest): Promise<ApiResponse<Plan>> => {
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

    listPublic: async (token: string): Promise<ApiResponse<Plan[]>> => {
      const response = await fetch(`${API_BASE}/plans/public`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },

    publish: async (token: string, planId: string, isPublic: boolean): Promise<ApiResponse<Plan>> => {
      const response = await fetch(`${API_BASE}/plans/${planId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic }),
      })
      return response.json()
    },
  },
}
