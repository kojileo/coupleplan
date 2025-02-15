import { render, screen, waitFor } from '@testing-library/react'
import PlanList from '@/components/features/plans/PlanList'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'

// useAuthのモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

// apiのモック
jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      list: jest.fn()
    }
  }
}))

describe('PlanList', () => {
  const mockSession = {
    user: { id: 'user1' },
    access_token: 'dummy-token'
  }

  const mockPlans: Plan[] = [
    {
      id: '1',
      title: 'テストプラン1',
      description: '説明1',
      date: '2024-01-01',
      budget: 10000,
      location: 'https://example.com/1',
      isPublic: false,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: []
    },
    {
      id: '2',
      title: 'テストプラン2',
      description: '説明2',
      date: '2024-01-02',
      budget: 20000,
      location: 'https://example.com/2',
      isPublic: true,
      userId: 'user2',
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: []
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ session: mockSession })
  })

  it('ローディング中はスケルトンを表示する', () => {
    ;(api.plans.list as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // 永続的なペンディング状態
    )
    
    render(<PlanList />)
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('プランが0件の場合、メッセージと作成リンクを表示する', async () => {
    ;(api.plans.list as jest.Mock).mockResolvedValueOnce({ data: [] })
    
    render(<PlanList />)
    
    await waitFor(() => {
      expect(screen.getByText('まだプランがありません')).toBeInTheDocument()
      expect(screen.getByText('新しいプランを作成する')).toBeInTheDocument()
    })
  })

  it('プラン一覧を表示する', async () => {
    ;(api.plans.list as jest.Mock).mockResolvedValueOnce({ data: mockPlans })
    
    render(<PlanList />)
    
    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument()
      expect(screen.getByText('テストプラン2')).toBeInTheDocument()
      expect(screen.getByText('説明1')).toBeInTheDocument()
      expect(screen.getByText('説明2')).toBeInTheDocument()
      expect(screen.getByText('💰 10,000円')).toBeInTheDocument()
      expect(screen.getByText('💰 20,000円')).toBeInTheDocument()
    })
  })

  it('他のユーザーのプランには公開プランバッジを表示する', async () => {
    ;(api.plans.list as jest.Mock).mockResolvedValueOnce({ data: mockPlans })
    
    render(<PlanList />)
    
    await waitFor(() => {
      expect(screen.getByText('公開プラン')).toBeInTheDocument()
    })
  })

  it('APIエラー時にコンソールエラーを出力する', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(api.plans.list as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
    
    render(<PlanList />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'マイプラン一覧の取得に失敗:',
        expect.any(Error)
      )
    })
    
    consoleSpy.mockRestore()
  })
})
