import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'
import type { Profile } from '@/types/profile'

// グローバルのfetchをモック化
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('api', () => {
  const mockToken = 'test-token'
  const mockUserId = 'user-1'

  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('auth', () => {
    it('ログインリクエストを送信', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'password' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { token: mockToken } }),
      })

      await api.auth.login(mockCredentials)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      })
    })

    it('サインアップリクエストを送信', async () => {
      const mockData = { email: 'test@example.com', password: 'password', name: 'Test User' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { token: mockToken } }),
      })

      await api.auth.signup(mockData)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockData),
      })
    })
  })

  describe('profile', () => {
    const mockProfile: Profile = {
      userId: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('プロフィール情報を取得', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockProfile }),
      })

      await api.profile.get(mockToken, mockUserId)

      expect(mockFetch).toHaveBeenCalledWith(`/api/profile/${mockUserId}`, {
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    })

    it('プロフィール情報を更新', async () => {
      const updateData = { name: 'Updated Name', email: 'updated@example.com' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { ...mockProfile, ...updateData } }),
      })

      await api.profile.update(mockToken, updateData.name, updateData.email)

      expect(mockFetch).toHaveBeenCalledWith('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(updateData),
      })
    })
  })

  describe('plans', () => {
    const mockPlan: Plan = {
      id: 'plan-1',
      title: 'Test Plan',
      description: 'Test Description',
      date: new Date('2024-01-01'),
      location: 'Test Location',
      budget: 1000,
      isPublic: false,
      userId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: [],
    }

    it('プラン一覧を取得', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [mockPlan] }),
      })

      await api.plans.list(mockToken)

      expect(mockFetch).toHaveBeenCalledWith('/api/plans', {
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    })

    it('プランを作成', async () => {
      const planData = {
        title: mockPlan.title,
        description: mockPlan.description ?? '',
        date: mockPlan.date instanceof Date ? mockPlan.date : null,
        location: mockPlan.location ?? null,
        budget: mockPlan.budget,
        isPublic: mockPlan.isPublic,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockPlan }),
      })

      await api.plans.create(mockToken, planData)

      expect(mockFetch).toHaveBeenCalledWith('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(planData),
      })
    })

    it('プラン作成時のエラーハンドリング', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.plans.create(mockToken, {} as any)

      expect(result).toEqual({
        error: 'プランの作成に失敗しました'
      })
    })

    it('プランの公開設定を更新', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { ...mockPlan, isPublic: true } }),
      })

      await api.plans.publish(mockToken, mockPlan.id, true)

      expect(mockFetch).toHaveBeenCalledWith(`/api/plans/${mockPlan.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({ isPublic: true }),
      })
    })
  })

  describe('likes', () => {
    it('いいねを作成', async () => {
      const planId = 'plan-1'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { id: 'like-1' } }),
      })

      await api.likes.create(mockToken, planId)

      expect(mockFetch).toHaveBeenCalledWith(`/api/plans/${planId}/likes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    })

    it('いいねを削除', async () => {
      const planId = 'plan-1'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: null }),
      })

      await api.likes.delete(mockToken, planId)

      expect(mockFetch).toHaveBeenCalledWith(`/api/plans/${planId}/likes`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    })
  })
})
