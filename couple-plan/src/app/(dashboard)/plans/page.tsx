'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/button'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'
import { PlanCard } from '@/components/features/plans/PlanCard'

export default function MyPlansPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      if (!session) return

      try {
        const response = await api.plans.list(session.access_token)
        if ('error' in response) throw new Error(response.error)
        setPlans(response.data || [])
      } catch (error) {
        console.error('プランの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [session])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">マイプラン一覧</h1>
        <Button onClick={() => router.push('/plans/new')}>
          新規プラン作成
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">プランがまだありません</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/plans/new')}
          >
            新規プラン作成
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} isPublic={false} />
          ))}
        </div>
      )}
    </div>
  )
}