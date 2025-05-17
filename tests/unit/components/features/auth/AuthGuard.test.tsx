import { render, screen } from '@testing-library/react'
import AuthGuard from '@/components/features/auth/AuthGuard'

// useRequireAuthフックのモック
jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: jest.fn()
}))

// useRequireAuthのインポートを追加
import { useRequireAuth } from '@/hooks/useRequireAuth'

describe('AuthGuard', () => {
  // テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('ローディング中はスピナーを表示する', () => {
    // useRequireAuthのモック実装
    ;(useRequireAuth as jest.Mock).mockReturnValue({
      isLoading: true
    })

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    )

    // スピナーが表示されることを確認
    expect(screen.getByRole('status')).toBeInTheDocument()
    // 子要素が表示されないことを確認
    expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument()
  })

  it('ローディング完了後に子コンポーネントを表示する', () => {
    // useRequireAuthのモック実装
    ;(useRequireAuth as jest.Mock).mockReturnValue({
      isLoading: false
    })

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    )

    // スピナーが表示されないことを確認
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    // 子要素が表示されることを確認
    expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument()
  })
})
