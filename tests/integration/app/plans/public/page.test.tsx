import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { api } from '@/lib/api';
import PublicPlansPage from '@/app/plans/public/page';

// APIモックの設定
jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      listPublic: jest.fn(),
    },
  },
}));

const mockPlans = [
  {
    id: '1',
    title: 'テストプラン1',
    description: '素敵なデートプラン',
    date: new Date('2024-03-20'),
    locations: [{ url: 'https://example.com', name: '東京タワー' }],
    region: 'tokyo',
    budget: 10000,
    isPublic: true,
    isRecommended: false,
    category: '定番デート',
    userId: 'user1',
    profile: {
      id: 'profile1',
      name: 'ユーザー1',
      avatarUrl: null,
      isAdmin: false,
    },
    _count: {
      likes: 5,
    },
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-19'),
  },
  {
    id: '2',
    title: 'テストプラン2',
    description: '観光プラン',
    date: new Date('2024-03-21'),
    locations: [{ url: 'https://example.com', name: '大阪城' }],
    region: 'osaka',
    budget: 15000,
    isPublic: true,
    isRecommended: true,
    category: '観光',
    userId: 'user2',
    profile: {
      id: 'profile2',
      name: '管理者',
      avatarUrl: null,
      isAdmin: true,
    },
    _count: {
      likes: 10,
    },
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-19'),
  },
];

describe('PublicPlansPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('プランの一覧を表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });
    render(<PublicPlansPage />);

    // ローディングスピナーの確認
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();

    // プランの表示を待機
    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });

    expect(screen.getByText('テストプラン2')).toBeInTheDocument();
  });

  it('地域でフィルタリングできる', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });

    // 大阪でフィルタリング
    fireEvent.change(screen.getByLabelText('地域:'), { target: { value: 'osaka' } });

    await waitFor(() => {
      expect(screen.queryByText('テストプラン1')).not.toBeInTheDocument();
      expect(screen.getByText('テストプラン2')).toBeInTheDocument();
    });
  });

  it('カテゴリでフィルタリングできる', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });

    // 観光でフィルタリング
    fireEvent.change(screen.getByLabelText('カテゴリ:'), { target: { value: '観光' } });

    await waitFor(() => {
      expect(screen.queryByText('テストプラン1')).not.toBeInTheDocument();
      expect(screen.getByText('テストプラン2')).toBeInTheDocument();
    });
  });

  it('APIエラー時にプランが表示されない', async () => {
    (api.plans.listPublic as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('プランが見つかりません')).toBeInTheDocument();
    });
  });

  it('プランが存在しない場合適切なメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('プランが見つかりません')).toBeInTheDocument();
      expect(screen.getByText('公開されているプランがまだありません。')).toBeInTheDocument();
    });
  });
});
