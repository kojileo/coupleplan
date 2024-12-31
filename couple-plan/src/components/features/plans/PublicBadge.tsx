'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'

type PublicBadgeProps = {
  planId: string
  isPublic: boolean
  onUpdate?: (plan: Plan) => void
}

export default function PublicBadge({ planId, isPublic: initialIsPublic, onUpdate }: PublicBadgeProps) {
  const { session } = useAuth()
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [loading, setLoading] = useState(false)

  const handleTogglePublic = async () => {
    if (!session || loading) return

    try {
      setLoading(true)
      const { data, error } = await api.plans.publish(session.access_token, planId, !isPublic)
      if (error) throw new Error(error)
      
      if (data) {
        setIsPublic(data.isPublic)
        onUpdate?.(data)
      }
    } catch (error) {
      console.error('公開設定の更新に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleTogglePublic}
      disabled={loading}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        transition-colors duration-200
        ${isPublic
          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {loading ? (
        <span className="animate-pulse">更新中...</span>
      ) : (
        <>
          <span className="mr-1">{isPublic ? '🌐' : '🔒'}</span>
          {isPublic ? '公開中' : '非公開'}
        </>
      )}
    </button>
  )
}