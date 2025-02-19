import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { profileApi } from '@/lib/api/profile'
import type { Profile } from '@/types/profile'

export function useProfile() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !session?.access_token) return
      
      setLoading(true)
      setError(null)
      try {
        const response = await profileApi.get(session.access_token, user.id)
        if (response.error) throw new Error(response.error)
        if (response.data) setProfile(response.data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'プロフィールの取得に失敗しました'
        setError(message)
        console.error('プロフィール取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, session])

  const updateProfile = async (name: string, email: string) => {
    if (!session?.access_token) return { error: '認証が必要です' }
    
    setLoading(true)
    setError(null)
    try {
      const response = await profileApi.update(session.access_token, { name, email })
      if (response.error) throw new Error(response.error)
      if (response.data) setProfile(response.data)
      return { data: response.data }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'プロフィールの更新に失敗しました'
      setError(message)
      console.error('プロフィール更新エラー:', error)
      return { error: message }
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    session,
  }
} 