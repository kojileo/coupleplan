import { renderHook, act } from '@testing-library/react'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { profileApi } from '@/lib/api/profile'
import type { Profile } from '@/types/profile'

// モックの設定
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/api/profile', () => ({
  profileApi: {
    get: jest.fn(),
    update: jest.fn(),
  },
}))

describe('useProfile', () => {
  const mockUser = { id: 'test-user' }
  const mockSession = { access_token: 'dummy-token' }
  const mockProfile = {
    userId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      session: mockSession,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('初期状態ではローディング中で、プロフィールはnull', () => {
    const { result } = renderHook(() => useProfile())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('プロフィール取得に成功した場合、プロフィールが設定される', async () => {
    (profileApi.get as jest.Mock).mockResolvedValueOnce({
      data: mockProfile,
    })

    const { result } = renderHook(() => useProfile())

    // プロフィール取得が完了するまで待機
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.error).toBeNull()
  })

  it('プロフィール取得に失敗した場合、エラーが設定される', async () => {
    (profileApi.get as jest.Mock).mockResolvedValueOnce({
      error: 'プロフィールの取得に失敗しました',
    })

    const { result } = renderHook(() => useProfile())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBe('プロフィールの取得に失敗しました')
  })

  it('認証情報がない場合、プロフィール取得を実行しない', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      session: null,
    })

    renderHook(() => useProfile())

    expect(profileApi.get).not.toHaveBeenCalled()
  })

  it('プロフィール更新が成功した場合、新しいプロフィールが設定される', async () => {
    const updatedData = {
      userId: 'test-user',
      name: 'Updated Name',
      email: 'updated@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as const

    // 両方のモックを先に設定
    (profileApi.get as jest.Mock).mockResolvedValueOnce({
      data: mockProfile,
    })
    
    ;(profileApi.update as jest.Mock).mockResolvedValueOnce({
      data: updatedData,
    })

    const { result } = renderHook(() => useProfile())

    // 初期データ取得の完了を待つ
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // プロフィール更新を実行
    await act(async () => {
      const response = await result.current.updateProfile(
        'Updated Name',
        'updated@example.com'
      )
      expect(response.data).toBeDefined()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.profile?.name).toBe('Updated Name')
    expect(result.current.profile?.email).toBe('updated@example.com')
    expect(result.current.error).toBeNull()
  })

  it('プロフィール更新が失敗した場合、エラーが返される', async () => {
    const errorMessage = 'プロフィールの更新に失敗しました'
    ;(profileApi.update as jest.Mock).mockResolvedValueOnce({
      error: errorMessage,
    })

    const { result } = renderHook(() => useProfile())

    await act(async () => {
      const response = await result.current.updateProfile('New Name', 'new@example.com')
      expect(response.error).toBe(errorMessage)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('認証情報がない場合、プロフィール更新を実行できない', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      session: null,
    })

    const { result } = renderHook(() => useProfile())

    await act(async () => {
      const response = await result.current.updateProfile('New Name', 'new@example.com')
      expect(response.error).toBe('認証が必要です')
    })
  })
})
