import { renderHook } from '@testing-library/react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

describe('useRequireAuth', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  const mockUser: User = {
    id: 'user1',
    email: 'test@example.com',
    created_at: '',
    aud: '',
    role: '',
    app_metadata: {},
    user_metadata: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('ローディング中は何もしない', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    })

    renderHook(() => useRequireAuth())
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('認証済みユーザーの場合、リダイレクトしない', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
    })

    renderHook(() => useRequireAuth())
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('未認証の場合、ホームページにリダイレクト', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    })

    renderHook(() => useRequireAuth())
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('認証状態が変更された場合、適切に処理', () => {
    const states = [
      { user: null, isLoading: true },    // 初期ローディング
      { user: null, isLoading: false },   // ロード完了、未認証
    ]
    let stateIndex = 0

    ;(useAuth as jest.Mock).mockImplementation(() => states[stateIndex])

    const { rerender } = renderHook(() => useRequireAuth())
    expect(mockRouter.push).not.toHaveBeenCalled()

    // 状態を更新
    stateIndex = 1
    rerender()
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('ユーザー情報とローディング状態を返す', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
    })

    const { result } = renderHook(() => useRequireAuth())
    expect(result.current).toEqual({
      user: mockUser,
      isLoading: false,
    })
  })
})
