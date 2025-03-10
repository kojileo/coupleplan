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
      signOut: jest.fn(),
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
    ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null })
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

  it('signOut関数が正しく動作する', async () => {
    // signOut関数を使用するためのテストコンポーネント
    const SignOutTestComponent = () => {
      const { signOut } = useAuth()
      return <button onClick={() => signOut()} data-testid="sign-out-button">Sign Out</button>
    }
    
    render(
      <AuthProvider>
        <SignOutTestComponent />
      </AuthProvider>
    )
    
    // ボタンをクリック
    const button = screen.getByTestId('sign-out-button')
    await act(async () => {
      button.click()
    })
    
    // supabaseのsignOutが呼ばれたことを確認
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('signOutでエラーが発生した場合、コンソールにエラーを出力', async () => {
    // コンソールエラーをモック
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    // signOutでエラーを発生させる
    const mockError = new Error('Sign out failed')
    ;(supabase.auth.signOut as jest.Mock).mockRejectedValueOnce(mockError)
    
    // signOut関数を使用するためのテストコンポーネント
    const SignOutTestComponent = () => {
      const { signOut } = useAuth()
      return <button onClick={() => signOut()} data-testid="sign-out-button">Sign Out</button>
    }
    
    render(
      <AuthProvider>
        <SignOutTestComponent />
      </AuthProvider>
    )
    
    // ボタンをクリック
    const button = screen.getByTestId('sign-out-button')
    await act(async () => {
      button.click()
    })
    
    // コンソールエラーが呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalledWith('ログアウトエラー:', mockError)
    
    // スパイをリストア
    consoleSpy.mockRestore()
  })

  it('AuthProviderがisLoadingの状態を正しく管理する', async () => {
    // getSessionの解決を遅延させる
    let resolveGetSession: (value: any) => void
    const getSessionPromise = new Promise(resolve => {
      resolveGetSession = resolve
    })
    
    ;(supabase.auth.getSession as jest.Mock).mockImplementation(() => getSessionPromise)
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // 初期状態ではローディング中
    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    
    // getSessionを解決
    await act(async () => {
      resolveGetSession!({ data: { session: mockSession } })
    })
    
    // 状態更新を待機 - 別のactブロックで実行
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })
    
    // ローディングが完了し、ユーザー情報が表示されていることを確認
    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!)
    expect(screen.getByTestId('session')).toHaveTextContent('has session')
  })

  it('マウント解除後にセッション更新が行われない', async () => {
    let authCallback: (event: string, session: Session | null) => void
    ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback
      return { data: { subscription: mockSubscription } }
    })
    
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // コンポーネントをアンマウント
    unmount()
    
    // アンマウント後に認証状態の変更をシミュレート
    await act(async () => {
      authCallback!('SIGNED_IN', mockSession)
    })
    
    // サブスクリプションが解除されたことを確認
    expect(mockSubscription.unsubscribe).toHaveBeenCalled()
  })
})
