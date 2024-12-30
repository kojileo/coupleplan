'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { Plan } from '@/types/plan'

export default function PlansPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setPlans(data || [])
      } catch (error) {
        console.error('プランの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [user])

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

      {plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">プランがまだありません</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/plans/new')}
          >
            最初のプランを作成
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/plans/${plan.id}`)}
            >
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
          ))}
        </div>
      )}
    </div>
  )
}