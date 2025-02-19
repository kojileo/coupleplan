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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('プランの基本情報が正しく表示される', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)

    expect(screen.getByText('テストプラン')).toBeInTheDocument()
    expect(screen.getByText('テストの説明文')).toBeInTheDocument()
    expect(screen.getByText(/10,000円/)).toBeInTheDocument()
    expect(screen.getByText('作成者: テストユーザー')).toBeInTheDocument()
  })

  it('日付が正しくフォーマットされて表示される', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)
    expect(screen.getByText(/2024年1月1日/)).toBeInTheDocument()
  })

  it('日付がnullの場合、日時の項目が表示されない', () => {
    const planWithoutDate = { ...mockPlan, date: null }
    render(<PlanCard plan={planWithoutDate} isPublic={false} />)
    expect(screen.queryByText(/日時：/)).not.toBeInTheDocument()
  })

  it('場所URLが正しく表示され、クリック可能である', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)
    const locationLink = screen.getByRole('link', { name: 'example.com' })
    expect(locationLink).toHaveAttribute('href', 'https://example.com/location')
    expect(locationLink).toHaveAttribute('target', '_blank')
    expect(locationLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('場所URLがnullの場合、代替テキストが表示される', () => {
    const planWithoutLocation = { ...mockPlan, location: null }
    render(<PlanCard plan={planWithoutLocation} isPublic={false} />)
    expect(screen.getByText(/場所URL未設定/)).toBeInTheDocument()
  })

  it('カードをクリックすると詳細ページに遷移する', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)
    const card = screen.getByRole('article')
    fireEvent.click(card)
    expect(mockRouter.push).toHaveBeenCalledWith(`/plans/${mockPlan.id}`)
  })

  it('公開/非公開の切り替えボタンが正しく動作する', async () => {
    const mockToggle = jest.fn()
    render(
      <PlanCard 
        plan={mockPlan} 
        isPublic={false} 
        onPublishToggle={mockToggle}
      />
    )

    const toggleButton = screen.getByRole('button', { name: '非公開' })
    fireEvent.click(toggleButton)

    expect(mockToggle).toHaveBeenCalledWith(mockPlan.id, true)
  })

  it('公開/非公開の切り替えボタンをクリックしてもカード全体のクリックイベントが発火しない', () => {
    const mockToggle = jest.fn()
    render(
      <PlanCard 
        plan={mockPlan} 
        isPublic={false} 
        onPublishToggle={mockToggle}
      />
    )

    const toggleButton = screen.getByRole('button', { name: '非公開' })
    fireEvent.click(toggleButton)

    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('場所URLをクリックしてもカード全体のクリックイベントが発火しない', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />)
    
    const locationLink = screen.getByRole('link', { name: 'example.com' })
    fireEvent.click(locationLink)

    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('公開ページでは公開/非公開の切り替えボタンが表示されない', () => {
    render(<PlanCard plan={mockPlan} isPublic={true} />)
    expect(screen.queryByRole('button', { name: /非公開|公開中/ })).not.toBeInTheDocument()
  })
})
