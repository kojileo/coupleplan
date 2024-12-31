'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'

export default function PlanList() {
  const { session } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      if (!session) return

      try {
        const { data, error } = await api.plans.list(session.access_token)
        if (error) throw new Error(error)
        
        setPlans(data || [])
      } catch (error) {
        console.error('プラン一覧の取得に失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [session])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">まだプランがありません</p>
        <Link
          href="/plans/new"
          className="text-blue-600 hover:text-blue-800"
        >
          新しいプランを作成する
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Link
          key={plan.id}
          href={`/plans/${plan.id}`}
          className="block p-4 rounded-lg border hover:border-blue-500 transition-colors"
        >
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{plan.title}</h3>
            {plan.userId !== session?.user.id && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                公開プラン
              </span>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {plan.description && (
              <p className="mb-2">{plan.description}</p>
            )}
            {plan.date && (
              <p>📅 {new Date(plan.date).toLocaleDateString()}</p>
            )}
            {plan.budget > 0 && (
              <p>💰 {plan.budget.toLocaleString()}円</p>
            )}
            {plan.location && (
              <p>📍 {plan.location}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}