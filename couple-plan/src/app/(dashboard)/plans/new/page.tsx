'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/button'
import { api } from '@/lib/api'
import type { PlanRequest } from '@/types/api'

export default function NewPlanPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PlanRequest>({
    title: '',
    description: '',
    date: '',
    budget: 0,
    location: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setSaving(true)
    try {
      const { data, error } = await api.plans.create(session.access_token, {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
      })
      
      if (error) throw new Error(error)
      router.push('/plans')
    } catch (error) {
      console.error('プランの作成に失敗しました:', error)
      alert('プランの作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">新規プラン作成</h1>
      
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
            type="url"
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
            {saving ? '作成中...' : '作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}