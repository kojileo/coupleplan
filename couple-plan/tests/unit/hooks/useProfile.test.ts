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
    fetchProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteAccount: jest.fn(),
  },
}))

describe('useProfile', () => {
  const mockUser = { id: 'test-user' }
  const mockSession = { access_token: 'dummy-token' }
  const mockProfile: Profile = {
    name: 'Test User',
    email: 'test@example.com',
    userId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // useAuthのモック
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      session: mockSession,
      isLoading: false,
      signOut: jest.fn().mockResolvedValue(undefined),
    })
  })

  it('初期状態ではローディング中で、プロフィールはnull', () => {
    const { result } = renderHook(() => useProfile())
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('プロフィール取得に成功した場合、プロフィールが設定される', async () => {
    (profileApi.fetchProfile as jest.Mock).mockResolvedValueOnce(mockProfile)

    const { result } = renderHook(() => useProfile())

    // 初期レンダリング後にuseEffectが実行される
    await act(async () => {
      // useEffectの非同期処理を待機
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.error).toBeNull()
  })

  it('プロフィール取得に失敗した場合、エラーが設定される', async () => {
    const errorMessage = 'プロフィールの取得に失敗しました'
    const mockError = new Error(errorMessage)
    
    // fetchProfileがエラーをスローするようにモック
    ;(profileApi.fetchProfile as jest.Mock).mockRejectedValueOnce(mockError)

    const { result } = renderHook(() => useProfile())

    // 初期レンダリング後にuseEffectが実行される
    await act(async () => {
      // useEffectの非同期処理を待機
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toEqual(mockError)
  })

  it('セッションがない場合、プロフィールは取得されない', () => {
    // セッションがない状態をモック
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
    })

    renderHook(() => useProfile())

    expect(profileApi.fetchProfile).not.toHaveBeenCalled()
  })

  it('プロフィール更新が成功した場合、新しいプロフィールが設定される', async () => {
    const updatedProfile: Profile = {
      ...mockProfile,
      name: 'Updated Name',
      email: 'updated@example.com',
    }

    // 両方のモックを先に設定
    ;(profileApi.fetchProfile as jest.Mock).mockResolvedValueOnce(mockProfile)
    
    ;(profileApi.updateProfile as jest.Mock).mockResolvedValueOnce(updatedProfile)

    const { result } = renderHook(() => useProfile())

    // 初期レンダリング後にuseEffectが実行される
    await act(async () => {
      // useEffectの非同期処理を待機
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // プロフィール更新を実行
    await act(async () => {
      const response = await result.current.updateProfile(
        'Updated Name',
        'updated@example.com'
      )
      expect(response).toEqual(updatedProfile)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.profile?.name).toBe('Updated Name')
    expect(result.current.profile?.email).toBe('updated@example.com')
    expect(result.current.error).toBeNull()
  })

  it('プロフィール更新が失敗した場合、エラーが返される', async () => {
    const errorMessage = 'プロフィールの更新に失敗しました'
    const mockError = new Error(errorMessage)
    
    // updateProfileがエラーをスローするようにモック
    ;(profileApi.updateProfile as jest.Mock).mockRejectedValueOnce(mockError)

    const { result } = renderHook(() => useProfile())

    // プロフィール更新を実行
    await act(async () => {
      const response = await result.current.updateProfile('New Name', 'new@example.com')
      expect(response).toBeNull()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toEqual(mockError)
  })

  it('認証情報がない場合、プロフィール更新を実行できない', async () => {
    // セッションがない状態をモック
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
    })

    const { result } = renderHook(() => useProfile())

    await act(async () => {
      const response = await result.current.updateProfile('New Name', 'new@example.com')
      expect(response).toBeNull()
    })

    // APIが呼ばれていないことを確認
    expect(profileApi.updateProfile).not.toHaveBeenCalled()
  })

  it('アカウント削除が成功した場合、trueを返す', async () => {
    // deleteAccountが成功するようにモック
    ;(profileApi.deleteAccount as jest.Mock).mockResolvedValueOnce({})
    
    // signOutのモック
    const mockSignOut = jest.fn().mockResolvedValueOnce({})
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      session: mockSession,
      isLoading: false,
      signOut: mockSignOut,
    })

    const { result } = renderHook(() => useProfile())

    // アカウント削除を実行
    await act(async () => {
      const success = await result.current.deleteAccount()
      expect(success).toBe(true)
    })

    expect(profileApi.deleteAccount).toHaveBeenCalledWith(mockSession.access_token)
    expect(mockSignOut).toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })

  it('アカウント削除が失敗した場合、falseを返す', async () => {
    const errorMessage = 'アカウントの削除に失敗しました'
    const mockError = new Error(errorMessage)
    
    // deleteAccountがエラーをスローするようにモック
    ;(profileApi.deleteAccount as jest.Mock).mockRejectedValueOnce(mockError)

    const { result } = renderHook(() => useProfile())

    // アカウント削除を実行
    await act(async () => {
      const success = await result.current.deleteAccount()
      expect(success).toBe(false)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toEqual(mockError)
  })

  it('認証情報がない場合、アカウント削除を実行できない', async () => {
    // セッションがない状態をモック
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      signOut: jest.fn(),
    })

    const { result } = renderHook(() => useProfile())

    // アカウント削除を実行
    let success: boolean | undefined
    await act(async () => {
      success = await result.current.deleteAccount()
    })

    // 戻り値がfalseであることを確認
    expect(success).toBe(false)
    
    // APIが呼ばれていないことを確認
    expect(profileApi.deleteAccount).not.toHaveBeenCalled()
    // セッションがない場合はsetIsLoadingが呼ばれないため、isLoadingはtrueのまま
    expect(result.current.isLoading).toBe(true)
  })

  it('非Errorオブジェクトがスローされた場合も適切に処理される（fetchProfile）', async () => {
    // 文字列エラーをスローするようにモック
    ;(profileApi.fetchProfile as jest.Mock).mockRejectedValueOnce('文字列エラー')

    const { result } = renderHook(() => useProfile())

    // 初期レンダリング後にuseEffectが実行される
    await act(async () => {
      // useEffectの非同期処理を待機
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('プロフィールの取得に失敗しました')
  })

  it('非Errorオブジェクトがスローされた場合も適切に処理される（updateProfile）', async () => {
    // 文字列エラーをスローするようにモック
    ;(profileApi.updateProfile as jest.Mock).mockRejectedValueOnce('文字列エラー')

    const { result } = renderHook(() => useProfile())

    // プロフィール更新を実行
    await act(async () => {
      const response = await result.current.updateProfile('New Name', 'new@example.com')
      expect(response).toBeNull()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('プロフィールの更新に失敗しました')
  })

  it('非Errorオブジェクトがスローされた場合も適切に処理される（deleteAccount）', async () => {
    // 文字列エラーをスローするようにモック
    ;(profileApi.deleteAccount as jest.Mock).mockRejectedValueOnce('文字列エラー')

    const { result } = renderHook(() => useProfile())

    // アカウント削除を実行
    await act(async () => {
      const success = await result.current.deleteAccount()
      expect(success).toBe(false)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('アカウントの削除に失敗しました')
  })

  it('fetchProfileを手動で呼び出すことができる', async () => {
    ;(profileApi.fetchProfile as jest.Mock).mockResolvedValueOnce(mockProfile)

    const { result } = renderHook(() => useProfile())

    // 手動でfetchProfileを呼び出す前の状態をリセット
    await act(async () => {
      // 初期状態のuseEffectによる呼び出しを待機
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // fetchProfileのモックをリセットして再設定
    ;(profileApi.fetchProfile as jest.Mock).mockClear()
    ;(profileApi.fetchProfile as jest.Mock).mockResolvedValueOnce(mockProfile)

    // 手動でfetchProfileを呼び出す
    await act(async () => {
      await result.current.fetchProfile()
      // 状態更新を待機
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(profileApi.fetchProfile).toHaveBeenCalledWith(mockSession.access_token)
    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.isLoading).toBe(false)
  })
});
