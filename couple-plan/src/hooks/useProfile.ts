import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { profileApi } from '@/lib/api/profile'
import type { Profile } from '@/types/profile'

export function useProfile() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (session?.access_token) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    if (!session?.access_token) return

    setIsLoading(true)
    setError(null)

    try {
      const profileData = await profileApi.fetchProfile(session.access_token)
      setProfile(profileData)
    } catch (err) {
      console.error('プロフィール取得エラー:', err)
      setError(err instanceof Error ? err : new Error('プロフィールの取得に失敗しました'))
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserProfile = async (name: string, email: string) => {
    if (!session?.access_token) return null

    setIsLoading(true)
    setError(null)

    try {
      const updatedProfile = await profileApi.updateProfile(session.access_token, name, email)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      console.error('プロフィール更新エラー:', err)
      setError(err instanceof Error ? err : new Error('プロフィールの更新に失敗しました'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile: fetchUserProfile,
    updateProfile: updateUserProfile
  }
}