'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'

export default function PublicPlansPage() {
  const { session } = useAuth()
  const [publicPlans, setPublicPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      if (!session) return

      try {
        const publicResponse = await api.plans.listPublic(session.access_token)
        if ('error' in publicResponse) throw new Error(publicResponse.error)
        setPublicPlans(publicResponse.data || [])
      } catch (error) {
        console.error('公開プランの取得に失敗しました:', error)
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
        <h1 className="text-2xl font-bold">公開プラン一覧</h1>
      </div>

      {publicPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">公開プランがまだありません</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} isPublic={true} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlanCard({ plan, isPublic }: { plan: Plan, isPublic: boolean }) {
  const router = useRouter()

  return (
    <div
      className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={() => router.push(`/plans/${plan.id}`)}
    >
      {isPublic && (
        <span className="absolute top-2 right-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          公開プラン
        </span>
      )}
      <h3 className="font-semibold mb-2">{plan.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {plan.description}
      </p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{plan.date ? new Date(plan.date).toLocaleDateString() : '日付未設定'}</span>
        <span>¥{plan.budget.toLocaleString()}</span>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <span>📍 {plan.location || '場所未設定'}</span>
      </div>
    </div>
  )
}