'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { Plan } from '@/types/plan'
import ShareDialog from '@/components/features/plans/ShareDialog'

export default function PlanDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        setPlan(data)
      } catch (error) {
        console.error('プランの取得に失敗しました:', error)
        router.push('/plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [user, params.id, router])

  const handleDelete = async () => {
    if (!confirm('このプランを削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user?.id)

      if (error) throw error
      router.push('/plans')
    } catch (error) {
      console.error('プランの削除に失敗しました:', error)
      alert('プランの削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{plan.title}</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setIsShareDialogOpen(true)}
          >
            共有
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/plans/${params.id}/edit`)}
          >
            編集
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
          >
            削除
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">説明</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{plan.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-2">日付</h2>
            <p className="text-gray-800">
              {plan.date ? new Date(plan.date).toLocaleDateString() : '未設定'}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-2">予算</h2>
            <p className="text-gray-800">¥{plan.budget.toLocaleString()}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-2">場所</h2>
            <p className="text-gray-800">{plan.location || '未設定'}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-500">
            <span>作成日: {new Date(plan.createdAt).toLocaleDateString()}</span>
            <span>更新日: {new Date(plan.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <ShareDialog
        planId={params.id}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </div>
  )
}