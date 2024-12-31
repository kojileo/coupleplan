'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/button'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'

export default function PlansPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [publicPlans, setPublicPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      if (!session) return

      try {
        // 自分のプランを取得
        const response = await api.plans.list(session.access_token)
        if ('error' in response) throw new Error(response.error)
        
        // 公開プランを取得
        const publicResponse = await api.plans.listPublic(session.access_token)
        if ('error' in publicResponse) throw new Error(publicResponse.error)

        setPlans(response.data || [])
        setPublicPlans(publicResponse.data || [])
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
        <h1 className="text-2xl font-bold">プラン一覧</h1>
        <Button onClick={() => router.push('/plans/new')}>
          新規プラン作成
        </Button>
      </div>

      {plans.length === 0 && publicPlans.length === 0 ? (
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
        <>
          {/* 自分のプラン */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">マイプラン</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} isPublic={false} />
              ))}
            </div>
          </div>

          {/* 公開プラン */}
          {publicPlans.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">公開プラン</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publicPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} isPublic={true} />
                ))}
              </div>
            </div>
          )}
        </>
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