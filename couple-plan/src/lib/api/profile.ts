import type { ProfileResponse, ProfileUpdateRequest } from '@/types/api'
import { Profile } from '@/types/profile'

export const profileApi = {
  // プロフィール情報を取得する関数
  fetchProfile: async (token: string): Promise<Profile> => {
    const response = await fetch('/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'プロフィールの取得に失敗しました')
    }

    const { data } = await response.json()
    return data
  },

  // プロフィール情報を更新する関数
  updateProfile: async (token: string, name: string, email: string): Promise<Profile> => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'プロフィールの更新に失敗しました')
    }

    const { data } = await response.json()
    return data
  },

  // 特定のユーザーIDのプロフィールを取得する関数
  fetchUserProfile: async (token: string, userId: string): Promise<Profile> => {
    const response = await fetch(`/api/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'プロフィールの取得に失敗しました')
    }

    const { data } = await response.json()
    return data
  }
}