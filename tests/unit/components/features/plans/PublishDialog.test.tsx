import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PublishDialog from '@/components/features/plans/PublishDialog'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'
import { TEST_USER, TEST_AUTH } from '@tests/utils/test-constants'

// useAuthのモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

// apiのモック
jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      get: jest.fn(),
      publish: jest.fn()
    }
  }
}))

describe('PublishDialog', () => {
  const mockPlan: Plan = {
    id: '1',
    title: 'テストプラン',
    description: '説明',
    date: '2024-01-01',
    budget: 10000,
    location: 'https://example.com',
    isPublic: false,
    userId: TEST_USER.ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: []
  }

  const mockSession = {
    user: { id: TEST_USER.ID },
    access_token: TEST_AUTH.ACCESS_TOKEN
  }

  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ session: mockSession })
    ;(api.plans.get as jest.Mock).mockResolvedValue({ data: mockPlan })
  })

  it('isOpen=falseの場合、何も表示しない', () => {
    render(
      <PublishDialog
        planId="1"
        isOpen={false}
        onClose={mockOnClose}
      />
    )
    
    expect(screen.queryByText('プランの公開設定')).not.toBeInTheDocument()
  })

  it('非公開プランの場合、公開確認メッセージを表示する', async () => {
    render(
      <PublishDialog
        planId="1"
        isOpen={true}
        onClose={mockOnClose}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText(/このプランを公開しますか？/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '公開する' })).toBeInTheDocument()
    })
  })

  it('公開プランの場合、非公開確認メッセージを表示する', async () => {
    ;(api.plans.get as jest.Mock).mockResolvedValueOnce({
      data: { ...mockPlan, isPublic: true }
    })

    render(
      <PublishDialog
        planId="1"
        isOpen={true}
        onClose={mockOnClose}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('このプランは現在公開されています。非公開にしますか？')).toBeInTheDocument()
      expect(screen.getByText('非公開にする')).toBeInTheDocument()
    })
  })

  it('公開設定を更新できる', async () => {
    ;(api.plans.publish as jest.Mock).mockResolvedValueOnce({
      data: { ...mockPlan, isPublic: true }
    })

    render(
      <PublishDialog
        planId="1"
        isOpen={true}
        onClose={mockOnClose}
      />
    )
    
    const publishButton = await screen.findByRole('button', { name: '公開する' })
    
    await waitFor(async () => {
      await fireEvent.click(publishButton)
      expect(api.plans.publish).toHaveBeenCalledWith(
        TEST_AUTH.ACCESS_TOKEN,
        '1',
        true
      )
    })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('キャンセルボタンでダイアログを閉じる', async () => {
    render(
      <PublishDialog
        planId="1"
        isOpen={true}
        onClose={mockOnClose}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('キャンセル')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('キャンセル'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('更新中はボタンを無効化する', async () => {
    let resolvePromise: (value: any) => void
    const publishPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    
    ;(api.plans.publish as jest.Mock).mockImplementationOnce(
      () => publishPromise
    )

    render(
      <PublishDialog
        planId="1"
        isOpen={true}
        onClose={mockOnClose}
      />
    )
    
    const publishButton = await screen.findByRole('button', { name: '公開する' })
    fireEvent.click(publishButton)

    // ローディング状態を確認
    await waitFor(() => {
      const button = screen.getByText('更新中...')
      expect(button).toBeDisabled()
    })

    // クリーンアップ
    resolvePromise!({ data: mockPlan })
  })

  it('APIエラー時にエラーメッセージを表示する', async () => {
    const errorMessage = '公開設定の更新に失敗しました'
    ;(api.plans.publish as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    )

    render(
      <PublishDialog
        planId="1"
        isOpen={true}
        onClose={mockOnClose}
      />
    )
    
    const publishButton = await screen.findByRole('button', { name: '公開する' })
    fireEvent.click(publishButton)

    // エラーメッセージの表示を待機
    await waitFor(() => {
      const errorElement = screen.getByText(errorMessage, { exact: true })
      expect(errorElement).toBeInTheDocument()
    })
  })
})
