'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase-auth'
import Button from '@/components/ui/button'
import type { Profile } from '@/types/profile'

export default function ProfilePage() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !session?.access_token) return
      try {
        const { data, error } = await api.profile.get(session.access_token, user.id)
        if (error) throw new Error(error)
        if (data) setProfile(data)
      } catch (error) {
        console.error('プロフィール取得エラー:', error)
      }
    }

    fetchProfile()
  }, [user, session])

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile?.name || !session?.access_token) return
    setLoading(true)

    try {
      const { data, error } = await api.profile.update(session.access_token, profile.name)
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    
    if (password.new !== password.confirm) {
      alert('新しいパスワードが一致しません')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.new
      })

      if (error) throw error

      alert('パスワードを更新しました')
      setPassword({ current: '', new: '', confirm: '' })
    } catch (error) {
      console.error('パスワード更新エラー:', error)
      alert('パスワードの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-rose-950">プロフィール設定</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-rose-900 mb-6">基本情報</h2>
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

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-rose-900 mb-6">パスワード変更</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label 
              htmlFor="new-password" 
              className="block text-sm font-medium text-rose-900 mb-2"
            >
              新しいパスワード
            </label>
            <input
              type="password"
              id="new-password"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
              className="w-full px-3 py-2 border border-rose-200 rounded-md text-rose-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label 
              htmlFor="confirm-password" 
              className="block text-sm font-medium text-rose-900 mb-2"
            >
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              id="confirm-password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              className="w-full px-3 py-2 border border-rose-200 rounded-md text-rose-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'パスワード更新中...' : 'パスワードを更新'}
          </Button>
        </form>
      </div>
    </div>
  )
}
