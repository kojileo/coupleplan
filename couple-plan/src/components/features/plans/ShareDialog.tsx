'use client'

import { useState } from 'react'
import Button from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { CreateShareInvitationInput } from '@/types/share'

interface ShareDialogProps {
  planId: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareDialog({ planId, isOpen, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('share_invitations')
        .insert([
          {
            plan_id: planId,
            email,
            status: 'pending',
          },
        ])

      if (error) throw error

      // メール送信処理は省略（Supabaseのメール機能やサードパーティのサービスを使用）

      setEmail('')
      onClose()
    } catch (error) {
      alert('共有の招待に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">プランを共有</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
            />
          </div>

          <div className="flex justify-end gap-4">
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
              {loading ? '送信中...' : '招待を送信'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}