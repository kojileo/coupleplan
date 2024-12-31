'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import Button from '@/components/ui/button'
import type { ShareInvitation } from '@/types/share'

type ShareDialogProps = {
  planId: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareDialog({ planId, isOpen, onClose }: ShareDialogProps) {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [invitations, setInvitations] = useState<ShareInvitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setLoading(true)
    setError('')

    try {
      const { data, error } = await api.plans.share(session.access_token, planId, { email })
      if (error) throw new Error(error)
      
      setInvitations([...invitations, data])
      setEmail('')
    } catch (error) {
      console.error('共有招待エラー:', error)
      setError('共有招待の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">プランの共有</h2>
        
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? '送信中...' : '共有'}
            </Button>
          </div>
        </form>

        {invitations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">共有中のユーザー</h3>
            <ul className="space-y-2">
              {invitations.map((invitation) => (
                <li
                  key={invitation.email}
                  className="text-sm text-gray-600"
                >
                  {invitation.recipient?.name || invitation.email}
                  <span className="ml-2 text-xs text-gray-400">
                    ({invitation.status === 'PENDING' ? '招待中' : '承認済み'})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}