import type { ProfileResponse, ProfileUpdateRequest } from '@/types/api'

export const profileApi = {
  get: async (token: string, userId: string): Promise<ProfileResponse> => {
    try {
      const response = await fetch(`/api/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      return data
    } catch {
      return { error: 'プロフィールの取得に失敗しました' }
    }
  },

  update: async (token: string, data: ProfileUpdateRequest): Promise<ProfileResponse> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      return result
    } catch {
      return { error: 'プロフィールの更新に失敗しました' }
    }
  },
} 