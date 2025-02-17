import { render, screen, fireEvent } from '@testing-library/react'
import { PlanCard } from '@/components/features/plans/PlanCard'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { Plan } from '@/types/plan'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

describe('PlanCard', () => {
  const mockRouter = { push: jest.fn() }
  const mockPlan: Plan = {
    id: '1',
    title: 'テストプラン',
    description: 'テストの説明文',
    date: '2024-01-01T09:00:00Z',
    budget: 10000,
    location: 'https://example.com/location',
    isPublic: false,
    userId: 'test-user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    likes: [],
    profile: {
      name: 'テストユーザー',
    },
    _count: {
      likes: 5,
    },
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: 'test-user' } },
    })
  })

  it('プランの情報が正しく表示される', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)

    expect(screen.getByText('テストプラン')).toBeInTheDocument()
    expect(screen.getByText('テストの説明文')).toBeInTheDocument()
    expect(screen.getByText(/2024年1月1日/)).toBeInTheDocument()
    expect(screen.getByText(/18:00/)).toBeInTheDocument()
    expect(screen.getByText(/10,000/)).toBeInTheDocument()
    expect(screen.getByText(/円/)).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getByText('作成者: テストユーザー')).toBeInTheDocument()
  })

  it('日付がない場合、日時の項目が表示されない', () => {
    const planWithoutDate: Plan = {
      ...mockPlan,
      date: null,
    }
    render(<PlanCard plan={planWithoutDate} isPublic={false} />)
    
    expect(screen.queryByText('日時：')).not.toBeInTheDocument()
  })

  it('場所URLがない場合、代替テキストが表示される', () => {
    const planWithoutLocation: Plan = {
      ...mockPlan,
      location: null,
    }
    render(<PlanCard plan={planWithoutLocation} isPublic={false} />)
    
    expect(screen.getByText(/場所URL未設定/)).toBeInTheDocument()
  })

  it('場所URLをクリックしても親要素のクリックイベントが発火しない', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)
    
    const locationLink = screen.getByRole('link', { name: 'example.com' })
    fireEvent.click(locationLink)
    
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('非公開プランの場合、編集リンクが表示される', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)
    
    expect(screen.getByText('編集する')).toBeInTheDocument()
  })

  it('公開プランの場合、編集リンクが表示されない', () => {
    render(<PlanCard plan={mockPlan} isPublic={true} />)
    
    expect(screen.queryByText('編集する')).not.toBeInTheDocument()
  })
})
