import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-auth'
import { Session, User } from '@supabase/supabase-js'

// supabaseのモック
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}))

// テスト用のコンポーネント
const TestComponent = () => {
  const { user, session, isLoading } = useAuth()
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.email : 'no user'}</div>
      <div data-testid="session">{session ? 'has session' : 'no session'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  const mockUser: User = {
    id: 'user1',
    email: 'test@example.com',
    created_at: '',
    aud: '',
    role: '',
    app_metadata: {},
    user_metadata: {},
  }

  const mockSession: Session = {
    access_token: 'token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'refresh',
    user: mockUser,
    expires_at: 0,
  }

  const mockSubscription = {
    unsubscribe: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    })
    ;(supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: mockSubscription },
    })
  })

  it('初期状態ではローディング中', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    expect(screen.getByTestId('user')).toHaveTextContent('no user')
    expect(screen.getByTestId('session')).toHaveTextContent('no session')
  })

  it('セッションがある場合、ユーザー情報を表示', async () => {
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await screen.findByText('loaded')
    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!)
    expect(screen.getByTestId('session')).toHaveTextContent('has session')
  })

  it('認証状態の変更を監視', async () => {
    let authCallback: (event: string, session: Session | null) => void
    ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback
      return { data: { subscription: mockSubscription } }
    })

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    })

    // 初期状態を確認
    expect(screen.getByTestId('user')).toHaveTextContent('no user')

    // 認証状態の変更をシミュレート
    await act(async () => {
      authCallback!('SIGNED_IN', mockSession)
      // 状態更新を待機
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // 更新後の状態を確認
    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!)
    expect(screen.getByTestId('session')).toHaveTextContent('has session')
  })

  it('コンポーネントのアンマウント時にサブスクリプションを解除', () => {
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    unmount()
    expect(mockSubscription.unsubscribe).toHaveBeenCalled()
  })

  it('セッション取得に失敗した場合もローディングを完了', async () => {
    ;(supabase.auth.getSession as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to get session')
    )

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
      // 非同期処理の完了を待機
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    expect(screen.getByTestId('user')).toHaveTextContent('no user')
    expect(screen.getByTestId('session')).toHaveTextContent('no session')
  })
})
