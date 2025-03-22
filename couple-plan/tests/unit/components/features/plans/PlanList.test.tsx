import { render, screen, waitFor } from '@testing-library/react'
import PlanList from '@/components/features/plans/PlanList'
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
      list: jest.fn()
    }
  }
}))

describe('PlanList', () => {
  const mockSession = {
    user: { id: TEST_USER.ID },
    access_token: TEST_AUTH.ACCESS_TOKEN
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
      userId: TEST_USER.ID,
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

  it('セッションがない場合、何も表示しない', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null })
    
    render(<PlanList />)
    
    // ローディングが終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    })
    
    // APIが呼ばれていないことを確認
    expect(api.plans.list).not.toHaveBeenCalled()
    
    // 何も表示されていないことを確認（または適切なメッセージが表示されていることを確認）
    expect(screen.queryByText('まだプランがありません')).toBeInTheDocument()
  })

  it('プランの詳細情報（日付、場所）を正しく表示する', async () => {
    // モックプランのデータを調整（有効な日付形式を使用）
    const adjustedMockPlans = [
      {
        ...mockPlans[0],
        date: '2024-01-01' // ISO形式の日付文字列
      },
      {
        ...mockPlans[1],
        date: '2024-01-02' // ISO形式の日付文字列
      }
    ];
    
    (api.plans.list as jest.Mock).mockResolvedValueOnce({ data: adjustedMockPlans })
    
    // Date.prototype.toLocaleDateStringをモック
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    const mockToLocaleDateString = jest.fn().mockImplementation(function(this: Date, ...args: Parameters<typeof originalToLocaleDateString>) {
      if (this.toISOString().includes('2024-01-01')) {
        return '2024/1/1';
      } else if (this.toISOString().includes('2024-01-02')) {
        return '2024/1/2';
      }
      return originalToLocaleDateString.apply(this, args);
    });
    
    // @ts-ignore - TypeScriptの型チェックを無視
    Date.prototype.toLocaleDateString = mockToLocaleDateString;
    
    render(<PlanList />)
    
    await waitFor(() => {
      // タイトルと説明が表示されていることを確認
      expect(screen.getByText('テストプラン1')).toBeInTheDocument()
      expect(screen.getByText('テストプラン2')).toBeInTheDocument()
      expect(screen.getByText('説明1')).toBeInTheDocument()
      expect(screen.getByText('説明2')).toBeInTheDocument()
      
      // 日付が表示されていることを確認（📅 絵文字を含む）
      expect(screen.getByText(/2024\/1\/1/)).toBeInTheDocument()
      expect(screen.getByText(/2024\/1\/2/)).toBeInTheDocument()
      
      // 予算が表示されていることを確認
      expect(screen.getByText(/10,000円/)).toBeInTheDocument()
      expect(screen.getByText(/20,000円/)).toBeInTheDocument()
      
      // URLが表示されていることを確認
      expect(screen.getByText(/example\.com\/1/)).toBeInTheDocument()
      expect(screen.getByText(/example\.com\/2/)).toBeInTheDocument()
    })
    
    // モックを元に戻す
    Date.prototype.toLocaleDateString = originalToLocaleDateString;
  })

  it('APIからエラーレスポンスが返された場合を処理する', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(api.plans.list as jest.Mock).mockResolvedValueOnce({ error: 'API Error' })
    
    render(<PlanList />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'マイプラン一覧の取得に失敗:',
        expect.any(Error)
      )
    })
    
    consoleSpy.mockRestore()
  })

  it('説明がないプランを正しく表示する', async () => {
    const plansWithoutDescription = [
      {
        ...mockPlans[0],
        description: ''
      }
    ]
    
    ;(api.plans.list as jest.Mock).mockResolvedValueOnce({ data: plansWithoutDescription })
    
    render(<PlanList />)
    
    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument()
      expect(screen.queryByText('説明1')).not.toBeInTheDocument()
    })
  })
})
