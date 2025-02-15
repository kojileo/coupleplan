import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { PlanCard } from '@/components/features/plans/PlanCard'
import { useAuth } from '@/contexts/AuthContext'
import type { Plan } from '@/types/plan'

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// useAuthのモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

describe('PlanCard', () => {
  const mockPlan: Plan = {
    id: '1',
    title: 'テストプラン',
    description: 'テストの説明文',
    date: '2024-01-01',
    budget: 10000,
    location: 'https://example.com/location',
    isPublic: false,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [
      { id: 'like1', userId: 'user1' }
    ],
    profile: {
      name: 'テストユーザー'
    },
    _count: {
      likes: 5
    }
  } as const

  const mockSession = {
    user: { id: 'user1' },
    access_token: 'dummy-token'
  }

  const mockRouter = {
    push: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue({ session: mockSession })
  })

  it('プランの情報が正しく表示される', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)

    expect(screen.getByText('テストプラン')).toBeInTheDocument()
    expect(screen.getByText('テストの説明文')).toBeInTheDocument()
    expect(screen.getByText('2024/1/1')).toBeInTheDocument()
    expect(screen.getByText('¥10,000')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getByText('作成者: テストユーザー')).toBeInTheDocument()
  })

  it('公開プランの場合、公開バッジが表示される', () => {
    render(<PlanCard plan={mockPlan} isPublic={true} />)
    expect(screen.getByText('公開プラン')).toBeInTheDocument()
  })

  it('非公開プランの場合、クリックでプラン詳細ページに遷移する', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)
    
    const card = screen.getByRole('article')
    fireEvent.click(card)

    expect(mockRouter.push).toHaveBeenCalledWith('/plans/1')
  })

  it('公開プランの場合、クリックしても遷移しない', () => {
    render(<PlanCard plan={mockPlan} isPublic={true} />)
    
    const card = screen.getByRole('article')
    fireEvent.click(card)

    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('場所URLがない場合、代替テキストが表示される', () => {
    const planWithoutLocation = { ...mockPlan, location: '' }
    render(<PlanCard plan={planWithoutLocation} isPublic={false} />)
    
    // 絵文字を含むテキスト全体をチェック
    expect(screen.getByText(/📍.*場所URL未設定/)).toBeInTheDocument()
  })

  it('日付がない場合、代替テキストが表示される', () => {
    const planWithoutDate = { ...mockPlan, date: null }
    render(<PlanCard plan={planWithoutDate} isPublic={false} />)
    
    expect(screen.getByText('日付未設定')).toBeInTheDocument()
  })

  it('場所URLをクリックしても親要素のクリックイベントが発火しない', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)
    
    const locationLink = screen.getByText('example.com')
    fireEvent.click(locationLink)

    expect(mockRouter.push).not.toHaveBeenCalled()
  })
})
