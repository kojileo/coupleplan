import { profileApi } from '@/lib/api/profile'
import type { Profile } from '@/types/profile'

// グローバルのfetchをモック化
global.fetch = jest.fn()

describe('profileApi', () => {
  const mockToken = 'dummy-token'
  const mockUserId = 'test-user'
  const mockProfile: Profile = {
    userId: mockUserId,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    // 各テスト前にfetchのモックをリセット
    jest.clearAllMocks()
  })

  describe('get', () => {
    it('プロフィール取得に成功した場合、プロフィールデータを返す', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockProfile }),
      })

      const result = await profileApi.get(mockToken, mockUserId)

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/profile/${mockUserId}`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      )
      expect(result.data).toEqual(mockProfile)
      expect(result.error).toBeUndefined()
    })

    it('プロフィール取得に失敗した場合、エラーを返す', async () => {
      const errorMessage = 'プロフィールの取得に失敗しました'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      })

      const result = await profileApi.get(mockToken, mockUserId)

      expect(result.data).toBeUndefined()
      expect(result.error).toBe(errorMessage)
    })

    it('ネットワークエラーの場合、エラーを返す', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await profileApi.get(mockToken, mockUserId)

      expect(result.data).toBeUndefined()
      expect(result.error).toBe('プロフィールの取得に失敗しました')
    })
  })

  describe('update', () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
    }

    it('プロフィール更新に成功した場合、更新されたプロフィールを返す', async () => {
      const updatedProfile = { ...mockProfile, ...updateData }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: updatedProfile }),
      })

      const result = await profileApi.update(mockToken, updateData)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(updateData),
        })
      )
      expect(result.data).toEqual(updatedProfile)
      expect(result.error).toBeUndefined()
    })

    it('プロフィール更新に失敗した場合、エラーを返す', async () => {
      const errorMessage = 'プロフィールの更新に失敗しました'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      })

      const result = await profileApi.update(mockToken, updateData)

      expect(result.data).toBeUndefined()
      expect(result.error).toBe(errorMessage)
    })

    it('ネットワークエラーの場合、エラーを返す', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await profileApi.update(mockToken, updateData)

      expect(result.data).toBeUndefined()
      expect(result.error).toBe('プロフィールの更新に失敗しました')
    })
  })
})
