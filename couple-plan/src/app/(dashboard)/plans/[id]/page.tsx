'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/button'
import PublishDialog from '@/components/features/plans/PublishDialog'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default function PlanDetailPage({ params }: Props) {
  const router = useRouter()
  const { session } = useAuth()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [planId, setPlanId] = useState<string>('')

  // params を解決して planId を設定
  useEffect(() => {
    params.then(({ id }) => setPlanId(id))
  }, [params])

  // planId が解決されたらプランデータを取得
  useEffect(() => {
    if (!planId) return

    const fetchPlan = async () => {
      if (!session) {
        setLoading(false)
        return
      }

      try {
        const response = await api.plans.get(session.access_token, planId)
        if ('error' in response) throw new Error(response.error)
        setPlan(response.data || null)
      } catch (error) {
        console.error('プランの取得に失敗しました:', error)
        router.push('/plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [session, planId, router])

  // プランの作成者かどうかを判定
  const isOwner = session?.user?.id === plan?.userId

  // planId が未解決 or データ取得中はローディング表示
  if (!planId || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-rose-950">{plan.title}</h1>
        {isOwner && ( // 作成者の場合のみボタンを表示
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setIsPublishDialogOpen(true)}
            >
              公開設定
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/plans/${planId}/edit`)}
            >
              編集
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!session || !confirm('このプランを削除してもよろしいですか？')) return

                try {
                  const response = await api.plans.delete(session.access_token, planId)
                  if ('error' in response) throw new Error(response.error)
                  router.push('/plans')
                } catch (error) {
                  console.error('プランの削除に失敗しました:', error)
                  alert('プランの削除に失敗しました')
                }
              }}
            >
              削除
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-rose-800 mb-2">説明</h2>
          <p className="text-rose-900 whitespace-pre-wrap">{plan.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-rose-800 mb-2">日付</h2>
            <p className="text-rose-900">
              {plan.date ? new Date(plan.date).toLocaleDateString() : '未設定'}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-rose-800 mb-2">予算</h2>
            <p className="text-rose-900">¥{plan.budget.toLocaleString()}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-rose-800 mb-2">場所URL</h2>
            <p className="text-rose-900">
              {plan.location ? (
                <a 
                  href={plan.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {new URL(plan.location).hostname}
                </a>
              ) : '未設定'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-rose-100">
          <div className="flex justify-between text-sm text-rose-600">
            <span>作成日: {new Date(plan.createdAt).toLocaleDateString()}</span>
            <span>更新日: {new Date(plan.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {isOwner && ( // 作成者の場合のみダイアログを表示
        <PublishDialog
          planId={planId}
          isOpen={isPublishDialogOpen}
          onClose={() => setIsPublishDialogOpen(false)}
        />
      )}
    </div>
  )
}