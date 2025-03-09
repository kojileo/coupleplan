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

  describe('fetchUserProfile', () => {
    it('プロフィール取得に成功した場合、プロフィールデータを返す', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockProfile }),
      })

      const result = await profileApi.fetchUserProfile(mockToken, mockUserId)

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/profile/${mockUserId}`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        })
      )
      expect(result).toEqual(mockProfile)
    })

    it('プロフィール取得に失敗した場合、エラーを返す', async () => {
      const errorMessage = 'プロフィールの取得に失敗しました'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      })

      await expect(profileApi.fetchUserProfile(mockToken, mockUserId)).rejects.toThrow(errorMessage)
    })

    it('ネットワークエラーの場合、エラーを返す', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(profileApi.fetchUserProfile(mockToken, mockUserId)).rejects.toThrow('プロフィールの取得に失敗しました')
    })
  })

  describe('updateProfile', () => {
    const newName = 'Updated Name'
    const newEmail = 'updated@example.com'

    it('プロフィール更新に成功した場合、更新されたプロフィールを返す', async () => {
      const updatedProfile = { ...mockProfile, name: newName, email: newEmail }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: updatedProfile }),
      })

      const result = await profileApi.updateProfile(mockToken, newName, newEmail)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ name: newName, email: newEmail }),
        })
      )
      expect(result).toEqual(updatedProfile)
    })

    it('プロフィール更新に失敗した場合、エラーを返す', async () => {
      const errorMessage = 'プロフィールの更新に失敗しました'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      })

      await expect(profileApi.updateProfile(mockToken, newName, newEmail)).rejects.toThrow(errorMessage)
    })

    it('ネットワークエラーの場合、エラーを返す', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(profileApi.updateProfile(mockToken, newName, newEmail)).rejects.toThrow('プロフィールの更新に失敗しました')
    })
  })

  describe('fetchProfile', () => {
    it('プロフィール取得に成功した場合、プロフィールデータを返す', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockProfile }),
      })

      const result = await profileApi.fetchProfile(mockToken)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        })
      )
      expect(result).toEqual(mockProfile)
    })

    it('プロフィール取得に失敗した場合、エラーを返す', async () => {
      const errorMessage = 'プロフィールの取得に失敗しました'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      })

      await expect(profileApi.fetchProfile(mockToken)).rejects.toThrow(errorMessage)
    })

    it('ネットワークエラーの場合、エラーを返す', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(profileApi.fetchProfile(mockToken)).rejects.toThrow('プロフィールの取得に失敗しました')
    })
  })

  describe('deleteAccount', () => {
    it('アカウント削除に成功した場合、成功メッセージを返す', async () => {
      const successMessage = 'アカウントを削除しました'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: successMessage }),
      })

      const result = await profileApi.deleteAccount(mockToken)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/account',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        })
      )
      expect(result).toEqual({ data: successMessage })
    })

    it('アカウント削除に失敗した場合、エラーを返す', async () => {
      const errorMessage = 'アカウントの削除に失敗しました'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      })

      await expect(profileApi.deleteAccount(mockToken)).rejects.toThrow(errorMessage)
    })

    it('ネットワークエラーの場合、エラーを返す', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(profileApi.deleteAccount(mockToken)).rejects.toThrow('アカウントの削除に失敗しました')
    })
  })
})
