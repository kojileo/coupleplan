'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/button'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'

export default function EditPlanPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    budget: 0,
    location: '',
  })

  useEffect(() => {
    const fetchPlan = async () => {
      if (!session) return

      try {
        const { data, error } = await api.plans.get(session.access_token, params.id)
        if (error) throw new Error(error)
        
        setPlan(data)
        setFormData({
          title: data.title,
          description: data.description || '',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          budget: data.budget,
          location: data.location || '',
        })
      } catch (error) {
        console.error('プランの取得に失敗しました:', error)
        router.push('/plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [session, params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setSaving(true)
    try {
      const { error } = await api.plans.update(session.access_token, params.id, {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
      })
      
      if (error) throw new Error(error)
      router.push(`/plans/${params.id}`)
    } catch (error) {
      console.error('プランの更新に失敗しました:', error)
      alert('プランの更新に失敗しました')
    } finally {
      setSaving(false)
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
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">プランが見つかりません</p>
        <Button 
          className="mt-4"
          onClick={() => router.push('/plans')}
        >
          プラン一覧に戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">プランの編集</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            予算
          </label>
          <input
            type="number"
            required
            min={0}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            場所
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  )
}