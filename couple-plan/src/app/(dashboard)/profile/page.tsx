'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type Profile = {
  name: string
  email: string
}

export default function ProfilePage() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  // プロフィールデータの取得
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      try {
        const response = await fetch(`/api/profile/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        })
        const responseData = await response.json()
        console.log('Profile API Response:', responseData)  // レスポンスの確認
        const { data, error } = responseData
        if (error) {
          throw new Error(error)
        }
        if (data) {
          setProfile(data)
        }
      } catch (error) {
        console.error('プロフィール取得エラー:', error)
      }
    }

    fetchProfile()
  }, [user, session])

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!session?.access_token) {
        throw new Error('認証セッションが見つかりません')
      }

      // Prismaデータベースのプロフィールを更新
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile?.name,
        }),
      })

      const { data, error } = await response.json()
      if (error) throw new Error(error)
      
      if (data) {
        setProfile(data)
        alert('プロフィールを更新しました')
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      alert('プロフィールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-rose-950 mb-8">プロフィール設定</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-rose-900 mb-2"
            >
              お名前
            </label>
            <input
              type="text"
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 border border-rose-200 rounded-md text-rose-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium text-rose-900 mb-2"
            >
              メールアドレス
            </label>
            <p className="text-rose-600">{profile.email}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? '更新中...' : 'プロフィールを更新'}
          </button>
        </form>
      </div>
    </div>
  )
}
