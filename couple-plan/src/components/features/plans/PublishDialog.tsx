'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import Button from '@/components/ui/button'
import type { Plan } from '@/types/plan'

type PublishDialogProps = {
  planId: string
  isOpen: boolean
  onClose: () => void
}

export default function PublishDialog({ planId, isOpen, onClose }: PublishDialogProps) {
  const { session } = useAuth()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPlan = async () => {
      if (!session || !isOpen) return

      try {
        const response = await api.plans.get(session.access_token, planId)
        if ('error' in response) throw new Error(response.error)
        if (response.data) setPlan(response.data)
      } catch (error) {
        console.error('プランの取得に失敗しました:', error)
      }
    }

    fetchPlan()
  }, [session, planId, isOpen])

  const handlePublish = async () => {
    if (!session || !plan) return

    setLoading(true)
    setError('')

    try {
      const response = await api.plans.publish(
        session.access_token,
        planId,
        !plan.isPublic
      )
      if ('error' in response) throw new Error(response.error)
      
      setPlan(prev => prev ? { ...prev, isPublic: !prev.isPublic } : null)
    } catch (error) {
      console.error('公開設定の更新に失敗しました:', error)
      setError('公開設定の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">プランの公開設定</h2>
        
        <p className="mb-4 text-gray-600">
          {plan?.isPublic 
            ? 'このプランは現在公開されています。非公開にしますか？'
            : 'このプランを公開しますか？公開すると、他のユーザーが閲覧できるようになります。'}
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
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
            type="button"
            onClick={handlePublish}
            disabled={loading}
          >
            {loading ? '更新中...' : (plan?.isPublic ? '非公開にする' : '公開する')}
          </Button>
        </div>
      </div>
    </div>
  )
}