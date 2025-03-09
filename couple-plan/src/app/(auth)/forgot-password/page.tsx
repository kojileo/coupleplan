'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'パスワードリセットに失敗しました')
      }

      setMessage(data.message || 'パスワードリセットメールを送信しました')
    } catch (err) {
      console.error('パスワードリセットエラー:', err)
      setError(err instanceof Error ? err.message : 'パスワードリセットに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-rose-950">
            パスワードをリセット
          </h2>
          <p className="mt-2 text-center text-sm text-rose-600">
            登録したメールアドレスを入力してください
          </p>
        </div>
        
        {message && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">メールアドレス</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-rose-200 placeholder-rose-400 text-rose-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '送信中...' : 'リセットメールを送信'}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <Link 
              href="/login" 
              className="text-sm text-rose-600 hover:text-rose-800"
            >
              ログインに戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 