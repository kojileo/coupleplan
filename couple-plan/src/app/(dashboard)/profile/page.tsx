'use client'
import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'

export default function ProfilePage() {
  const { session } = useAuth()
  const { profile, isLoading, error, updateProfile } = useProfile()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // プロフィール情報が取得されたら、フォームに値をセット
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setEmail(profile.email || '')
    }
  }, [profile])

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUpdateMessage('')

    try {
      const result = await updateProfile(name, email)
      if (result) {
        setUpdateMessage('プロフィールが更新されました')
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      setUpdateMessage('プロフィールの更新に失敗しました')
    }
  }

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordMessage('新しいパスワードが一致しません')
      return
    }

    try {
      // パスワード更新のAPI呼び出しはこちら
      // この部分は後で実装します
      setPasswordMessage('パスワードが更新されました')
    } catch (error) {
      console.error('パスワード更新エラー:', error)
      setPasswordMessage('パスワードの更新に失敗しました')
    }
  }

  const handleDeleteAccount = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true)
      return
    }

    try {
      // アカウント削除のAPI呼び出しはこちら
      // この部分は後で実装します
      console.log('アカウントが削除されました')
    } catch (error) {
      console.error('アカウント削除エラー:', error)
    }
  }

  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div>エラー: {error.message}</div>
  if (!session) return <div>ログインが必要です</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">プロフィール情報</h2>
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              名前
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {updateMessage && (
            <div className="mb-4 text-green-500">{updateMessage}</div>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            更新
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">パスワード変更</h2>
        <form onSubmit={handleUpdatePassword}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
              現在のパスワード
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
              新しいパスワード
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              新しいパスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {passwordMessage && (
            <div className="mb-4 text-green-500">{passwordMessage}</div>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            パスワード変更
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">アカウント削除</h2>
        <p className="mb-4 text-red-500">
          アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。
        </p>
        {showConfirmDelete ? (
          <div>
            <p className="mb-4 font-bold">本当にアカウントを削除しますか？</p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                はい、削除します
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            アカウントを削除
          </button>
        )}
      </div>
    </div>
  )
}
