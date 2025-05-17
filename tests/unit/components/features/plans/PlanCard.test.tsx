import { render, screen, fireEvent } from '@testing-library/react';
import { PlanCard } from '@/components/features/plans/PlanCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { ExtendedPlan } from '@/types/plan';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/features/plans/LikeButton', () => ({
  LikeButton: ({
    planId,
    initialIsLiked,
    likeCount,
  }: {
    planId: string;
    initialIsLiked: boolean;
    likeCount: number;
  }) => <button>{likeCount}</button>,
}));

describe('PlanCard', () => {
  const mockRouter = { push: jest.fn() };
  const mockPlan: ExtendedPlan = {
    id: '1',
    title: 'テストプラン',
    description: 'テストの説明文',
    date: new Date('2024-01-01T09:00:00Z'),
    region: '東京都',
    budget: 10000,
    isPublic: false,
    isRecommended: false,
    category: 'デート',
    userId: 'test-user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    locations: [
      {
        id: '1',
        name: 'テスト場所',
        url: 'https://example.com/location',
        planId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    profile: {
      id: '1',
      name: 'テストユーザー',
      email: 'test@example.com',
      userId: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      isAdmin: false,
    },
    likes: [
      {
        id: '1',
        planId: '1',
        userId: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    _count: {
      likes: 5,
    },
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: 'test-user' } },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('プランの基本情報が正しく表示される', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />);

    expect(screen.getByText('テストプラン')).toBeInTheDocument();
    expect(screen.getByText('テストの説明文')).toBeInTheDocument();
    expect(screen.getByText(/10,000円/)).toBeInTheDocument();
    expect(screen.getByText('作成者: テストユーザー')).toBeInTheDocument();
  });

  it('日付が正しくフォーマットされて表示される', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />);
    expect(screen.getByText(/2024年01月01日/)).toBeInTheDocument();
  });

  it('日付がnullの場合、日時の項目が表示されない', () => {
    const planWithoutDate = { ...mockPlan, date: null };
    render(<PlanCard plan={planWithoutDate} isPublic={false} />);
    expect(screen.queryByText(/日時：/)).not.toBeInTheDocument();
  });

  it('場所URLが正しく表示され、クリック可能である', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />);
    const locationLink = screen.getByRole('link', { name: 'example.com' });
    expect(locationLink).toHaveAttribute('href', 'https://example.com/location');
    expect(locationLink).toHaveAttribute('target', '_blank');
    expect(locationLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('場所が空の場合、代替テキストが表示される', () => {
    const planWithoutLocation = { ...mockPlan, locations: [] };
    render(<PlanCard plan={planWithoutLocation} isPublic={false} />);
    expect(screen.getByText(/場所URL未設定/)).toBeInTheDocument();
  });

  it('カードをクリックすると詳細ページに遷移する', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />);
    const card = screen.getByRole('article');
    fireEvent.click(card);
    expect(mockRouter.push).toHaveBeenCalledWith(`/plans/${mockPlan.id}`);
  });

  it('公開/非公開の切り替えボタンが正しく動作する', async () => {
    const mockToggle = jest.fn();
    render(<PlanCard plan={mockPlan} isPublic={false} onPublishToggle={mockToggle} />);

    const toggleButton = screen.getByRole('button', { name: '非公開' });
    fireEvent.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledWith(mockPlan.id, true);
  });

  it('公開/非公開の切り替えボタンをクリックしてもカード全体のクリックイベントが発火しない', () => {
    const mockToggle = jest.fn();
    render(<PlanCard plan={mockPlan} isPublic={false} onPublishToggle={mockToggle} />);

    const toggleButton = screen.getByRole('button', { name: '非公開' });
    fireEvent.click(toggleButton);

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('場所URLをクリックしてもカード全体のクリックイベントが発火しない', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />);

    const locationLink = screen.getByRole('link', { name: 'example.com' });
    fireEvent.click(locationLink);

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('公開ページでは公開/非公開の切り替えボタンが表示されない', () => {
    render(<PlanCard plan={mockPlan} isPublic={true} />);
    expect(screen.queryByRole('button', { name: /非公開|公開中/ })).not.toBeInTheDocument();
  });

  it('公開中のプランでは「公開中」ボタンが表示される', () => {
    const publicPlan = { ...mockPlan, isPublic: true };
    const mockToggle = jest.fn();

    render(<PlanCard plan={publicPlan} isPublic={false} onPublishToggle={mockToggle} />);

    const toggleButton = screen.getByRole('button', { name: '公開中' });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveClass('bg-rose-100 text-rose-700');
  });

  it('プロフィール名がnullの場合、「不明」と表示される', () => {
    const planWithNullProfileName = {
      ...mockPlan,
      profile: {
        id: '1',
        name: null,
        email: 'test@example.com',
        userId: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      },
    };

    render(<PlanCard plan={planWithNullProfileName} isPublic={false} />);

    expect(screen.getByText('作成者: 不明')).toBeInTheDocument();
  });

  it('プロフィールがnullの場合、「不明」と表示される', () => {
    const planWithoutProfile = {
      ...mockPlan,
      profile: null,
    };

    render(<PlanCard plan={planWithoutProfile} isPublic={false} />);

    expect(screen.getByText('作成者: 不明')).toBeInTheDocument();
  });

  it('いいねの初期状態が正しく設定される（いいね済み）', () => {
    const planWithUserLike = {
      ...mockPlan,
      likes: [
        {
          id: '1',
          planId: '1',
          userId: 'test-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    render(<PlanCard plan={planWithUserLike} isPublic={false} />);

    // LikeButtonコンポーネントに正しいpropsが渡されているか確認
    const likeButton = screen.getByRole('button', { name: '5' });
    expect(likeButton).toBeInTheDocument();
  });

  it('いいねの数が_countにない場合、0として表示される', () => {
    const planWithoutLikeCount = {
      ...mockPlan,
      _count: undefined,
    };

    render(<PlanCard plan={planWithoutLikeCount} isPublic={false} />);

    // LikeButtonコンポーネントに正しいpropsが渡されているか確認
    const likeButton = screen.getByRole('button', { name: '0' });
    expect(likeButton).toBeInTheDocument();
  });

  it('onPublishToggleがnullの場合、公開/非公開ボタンが表示されない', () => {
    render(<PlanCard plan={mockPlan} isPublic={false} />);

    expect(screen.queryByRole('button', { name: /非公開|公開中/ })).not.toBeInTheDocument();
  });
});
