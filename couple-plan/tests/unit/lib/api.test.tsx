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

    it('ログイン失敗時のエラーレスポンスを処理', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'wrong-password' }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: '認証に失敗しました' }),
      })

      const result = await api.auth.login(mockCredentials)
      expect(result).toEqual({ error: '認証に失敗しました' })
    })

    it('ログイン時のネットワークエラーを処理', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'password' }
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await api.auth.login(mockCredentials)
        // エラーがスローされなかった場合、テストを失敗させる
        fail('Expected an error to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
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

    it('サインアップ失敗時のエラーレスポンスを処理', async () => {
      const mockData = { email: 'existing@example.com', password: 'password', name: 'Test User' }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'このメールアドレスは既に使用されています' }),
      })

      const result = await api.auth.signup(mockData)
      expect(result).toEqual({ error: 'このメールアドレスは既に使用されています' })
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

    it('プロフィール取得失敗時のエラーレスポンスを処理', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'プロフィールが見つかりません' }),
      })

      const result = await api.profile.get(mockToken, 'non-existent-user')
      expect(result).toEqual({ error: 'プロフィールが見つかりません' })
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

    it('プロフィール更新失敗時のエラーレスポンスを処理', async () => {
      const updateData = { name: 'Updated Name', email: 'invalid-email' }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: '無効なメールアドレスです' }),
      })

      const result = await api.profile.update(mockToken, updateData.name, updateData.email)
      expect(result).toEqual({ error: '無効なメールアドレスです' })
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

    it('プラン一覧取得失敗時のエラーレスポンスを処理', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: '認証が必要です' }),
      })

      const result = await api.plans.list('invalid-token')
      expect(result).toEqual({ error: '認証が必要です' })
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

    it('プラン作成時のレスポンスエラーを処理', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'タイトルは必須です' }),
      })

      const result = await api.plans.create(mockToken, { title: '' } as any)

      expect(result).toEqual({
        error: 'プランの作成に失敗しました'
      })
    })

    it('特定のプランを取得', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockPlan }),
      })

      await api.plans.get(mockToken, mockPlan.id)

      expect(mockFetch).toHaveBeenCalledWith(`/api/plans/${mockPlan.id}`, {
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    })

    it('プラン取得失敗時のエラーレスポンスを処理', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'プランが見つかりません' }),
      })

      const result = await api.plans.get(mockToken, 'non-existent-plan')
      expect(result).toEqual({ error: 'プランが見つかりません' })
    })

    it('プランを更新', async () => {
      const updateData = {
        title: 'Updated Plan',
        description: 'Updated Description',
        date: new Date('2024-02-01'),
        location: 'Updated Location',
        budget: 2000,
        isPublic: true,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { ...mockPlan, ...updateData } }),
      })

      await api.plans.update(mockToken, mockPlan.id, updateData)

      expect(mockFetch).toHaveBeenCalledWith(`/api/plans/${mockPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(updateData),
      })
    })

    it('プラン更新失敗時のエラーレスポンスを処理', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'プランの更新に失敗しました' }),
      })

      const result = await api.plans.update(mockToken, mockPlan.id, { title: '' } as any)
      expect(result).toEqual({ error: 'プランの更新に失敗しました' })
    })

    it('プランを削除', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: null }),
      })

      await api.plans.delete(mockToken, mockPlan.id)

      expect(mockFetch).toHaveBeenCalledWith(`/api/plans/${mockPlan.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    })

    it('プラン削除失敗時のエラーレスポンスを処理', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'プランの削除に失敗しました' }),
      })

      const result = await api.plans.delete(mockToken, mockPlan.id)
      expect(result).toEqual({ error: 'プランの削除に失敗しました' })
    })

    it('公開プラン一覧を取得', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [mockPlan] }),
      })

      await api.plans.listPublic(mockToken)

      expect(mockFetch).toHaveBeenCalledWith('/api/plans/public', {
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    })

    it('公開プラン一覧取得失敗時のエラーレスポンスを処理', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: '認証が必要です' }),
      })

      const result = await api.plans.listPublic('invalid-token')
      expect(result).toEqual({ error: '認証が必要です' })
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

    it('プラン公開設定更新失敗時のエラーレスポンスを処理', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'プランの公開設定の更新に失敗しました' }),
      })

      const result = await api.plans.publish(mockToken, mockPlan.id, true)
      expect(result).toEqual({ error: 'プランの公開設定の更新に失敗しました' })
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

    it('いいね作成失敗時のエラーレスポンスを処理', async () => {
      const planId = 'plan-1'
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'いいねの作成に失敗しました' }),
      })

      const result = await api.likes.create(mockToken, planId)
      expect(result).toEqual({ error: 'いいねの作成に失敗しました' })
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

    it('いいね削除失敗時のエラーレスポンスを処理', async () => {
      const planId = 'plan-1'
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'いいねの削除に失敗しました' }),
      })

      const result = await api.likes.delete(mockToken, planId)
      expect(result).toEqual({ error: 'いいねの削除に失敗しました' })
    })
  })
})
