import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/features/dashboard/Navbar'
import { supabase } from '@/lib/supabase-auth'

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// supabase-authのモック
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      signOut: jest.fn()
    }
  }
}))

describe('Navbar', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it('デスクトップ表示で全てのナビゲーションリンクとログアウトボタンが表示される', () => {
    render(<Navbar />)

    // ロゴ/ブランド名の確認
    expect(screen.getByText('Couple Plan')).toBeInTheDocument()

    // デスクトップメニューの確認
    const desktopMenu = screen.getByRole('navigation')
      .querySelector('.hidden.md\\:flex') // デスクトップメニューを特定
    expect(desktopMenu).toBeInTheDocument()
    
    // デスクトップメニュー内の要素を確認
    const desktopLinks = desktopMenu?.querySelectorAll('a')
    expect(desktopLinks?.[0]).toHaveTextContent('マイプラン一覧')
    expect(desktopLinks?.[1]).toHaveTextContent('公開プラン一覧')
    expect(desktopLinks?.[2]).toHaveTextContent('プロフィール')
    
    const desktopLogoutButton = desktopMenu?.querySelector('button')
    expect(desktopLogoutButton).toHaveTextContent('ログアウト')
  })

  it('モバイル表示でハンバーガーメニューをクリックするとメニューが開閉する', () => {
    render(<Navbar />)

    // 初期状態ではモバイルメニューは非表示
    expect(screen.getByRole('button', { name: 'メニューを開く' })).toBeInTheDocument()
    const mobileMenu = screen.getByRole('navigation').querySelector('[class*="hidden md:hidden"]')
    expect(mobileMenu).toHaveClass('hidden')

    // メニューボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))

    // メニューが表示される
    expect(mobileMenu).not.toHaveClass('hidden')

    // もう一度クリックで閉じる
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(mobileMenu).toHaveClass('hidden')
  })

  it('ログアウトボタンをクリックするとログアウト処理が実行される', async () => {
    // supabase.auth.signOutの成功レスポンスをモック
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null })
    
    render(<Navbar />)

    // デスクトップメニューのログアウトボタンを特定
    const logoutButton = screen.getByRole('navigation')
      .querySelector('.hidden.md\\:flex button')
    expect(logoutButton).toBeInTheDocument()
    
    // ログアウトボタンをクリック
    await fireEvent.click(logoutButton as Element)

    // 非同期処理が完了するのを待つ
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('モバイルメニューのリンクをクリックするとメニューが閉じる', () => {
    render(<Navbar />)

    // メニューを開く
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    
    // モバイルメニューのリンクをクリック
    const mobileLinks = screen.getAllByText('マイプラン一覧')
    fireEvent.click(mobileLinks[1]) // モバイルメニューのリンクを選択

    // メニューが閉じることを確認
    const mobileMenu = screen.getByRole('navigation').querySelector('[class*="hidden md:hidden"]')
    expect(mobileMenu).toHaveClass('hidden')
  })

  it('モバイルメニューのログアウトボタンをクリックするとログアウト処理が実行される', async () => {
    // supabase.auth.signOutの成功レスポンスをモック
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null })
    
    render(<Navbar />)

    // メニューを開く
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    
    // モバイルメニューのログアウトボタンを特定
    const mobileLogoutButtons = screen.getAllByText('ログアウト')
    expect(mobileLogoutButtons.length).toBe(2) // デスクトップとモバイルの両方
    
    // モバイルメニューのログアウトボタンをクリック
    await fireEvent.click(mobileLogoutButtons[1]) // モバイルメニューのボタン
    
    // 非同期処理が完了するのを待つ
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('ログアウト処理でエラーが発生した場合も、ホームページにリダイレクトされる', async () => {
    // supabase.auth.signOutのエラーレスポンスをモック
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ 
      error: new Error('ログアウトエラー') 
    })
    
    // コンソールエラーをモック化して抑制
    const originalConsoleError = console.error
    console.error = jest.fn()
    
    render(<Navbar />)
    
    // ログアウトボタンをクリック
    const logoutButton = screen.getByRole('navigation')
      .querySelector('.hidden.md\\:flex button')
    await fireEvent.click(logoutButton as Element)
    
    // エラーがあってもホームページにリダイレクトされることを確認
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
    
    // コンソールエラーを元に戻す
    console.error = originalConsoleError
  })

  it('ログアウト処理で例外が投げられた場合も、ホームページにリダイレクトされる', async () => {
    // supabase.auth.signOutが例外を投げるようにモック
    (supabase.auth.signOut as jest.Mock).mockRejectedValueOnce(new Error('ネットワークエラー'))
    
    // コンソールエラーをモック化して抑制
    const originalConsoleError = console.error
    console.error = jest.fn()
    
    render(<Navbar />)
    
    // ログアウトボタンをクリック
    const logoutButton = screen.getByRole('navigation')
      .querySelector('.hidden.md\\:flex button')
    await fireEvent.click(logoutButton as Element)
    
    // 例外が発生してもホームページにリダイレクトされることを確認
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
    
    // コンソールエラーを元に戻す
    console.error = originalConsoleError
  })
})
