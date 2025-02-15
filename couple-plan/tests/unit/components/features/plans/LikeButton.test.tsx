import { render, screen, fireEvent } from '@testing-library/react'
import { LikeButton } from '@/components/features/plans/LikeButton'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

// useAuthのモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

// apiのモック
jest.mock('@/lib/api', () => ({
  api: {
    likes: {
      create: jest.fn(),
      delete: jest.fn()
    }
  }
}))

describe('LikeButton', () => {
  const mockSession = {
    access_token: 'dummy-token'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // デフォルトのuseAuthモック実装
    ;(useAuth as jest.Mock).mockReturnValue({ session: mockSession })
  })

  it('初期状態が正しく表示される（いいねなし）', () => {
    render(<LikeButton planId="1" initialIsLiked={false} likeCount={5} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('🤍')
    expect(button).toHaveTextContent('5')
    expect(button).not.toBeDisabled()
  })

  it('初期状態が正しく表示される（いいねあり）', () => {
    render(<LikeButton planId="1" initialIsLiked={true} likeCount={5} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('❤️')
    expect(button).toHaveTextContent('5')
    expect(button).not.toBeDisabled()
  })

  it('未ログイン状態ではボタンが無効化される', () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null })
    render(<LikeButton planId="1" initialIsLiked={false} likeCount={5} />)
    
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('いいねを追加できる', async () => {
    (api.likes.create as jest.Mock).mockResolvedValueOnce({})
    render(<LikeButton planId="1" initialIsLiked={false} likeCount={5} />)
    
    const button = screen.getByRole('button')
    await fireEvent.click(button)

    // 非同期更新を待つ
    await screen.findByText('❤️')

    expect(api.likes.create).toHaveBeenCalledWith(mockSession.access_token, '1')
    expect(button).toHaveTextContent('❤️')
    expect(button).toHaveTextContent('6')
  })

  it('いいねを削除できる', async () => {
    (api.likes.delete as jest.Mock).mockResolvedValueOnce({})
    render(<LikeButton planId="1" initialIsLiked={true} likeCount={5} />)
    
    const button = screen.getByRole('button')
    await fireEvent.click(button)

    // 非同期更新を待つ
    await screen.findByText('🤍')

    expect(api.likes.delete).toHaveBeenCalledWith(mockSession.access_token, '1')
    expect(button).toHaveTextContent('🤍')
    expect(button).toHaveTextContent('4')
  })

  it('ローディング中はボタンが無効化される', async () => {
    // APIコールを遅延させる
    (api.likes.create as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<LikeButton planId="1" initialIsLiked={false} likeCount={5} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // スピナーの要素を確認
    const spinner = button.querySelector('span')
    expect(button).toBeDisabled()
    expect(spinner).toHaveClass('opacity-50')
  })

  it('APIエラー時にコンソールエラーが出力される', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const error = new Error('API Error')
    ;(api.likes.create as jest.Mock).mockRejectedValueOnce(error)
    
    render(<LikeButton planId="1" initialIsLiked={false} likeCount={5} />)
    
    const button = screen.getByRole('button')
    await fireEvent.click(button)

    expect(consoleSpy).toHaveBeenCalledWith('いいねの操作に失敗しました:', error)
    consoleSpy.mockRestore()
  })
})
