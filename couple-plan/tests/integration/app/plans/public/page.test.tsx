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
    locations: [
      { name: '東京タワー', address: '東京都港区', latitude: 35.6586, longitude: 139.7454 },
    ],
    region: 'tokyo',
    budget: 10000,
    isPublic: true,
    category: '定番デート',
    userId: 'user1',
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-19'),
  },
  {
    id: '2',
    title: 'テストプラン2',
    description: '観光プラン',
    date: new Date('2024-03-21'),
    locations: [
      { name: '大阪城', address: '大阪府大阪市', latitude: 34.6873, longitude: 135.5262 },
    ],
    region: 'osaka',
    budget: 15000,
    isPublic: true,
    category: '観光',
    userId: 'user2',
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

    // ローディング表示の確認
    expect(screen.getByRole('status')).toBeInTheDocument();

    // プランの表示を待機
    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });

    expect(screen.getByText('テストプラン2')).toBeInTheDocument();
    expect(screen.getByText('東京タワー')).toBeInTheDocument();
    expect(screen.getByText('大阪城')).toBeInTheDocument();
  });

  it('地域でフィルタリングできる', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });

    // 大阪でフィルタリング
    fireEvent.change(screen.getByLabelText('地域:'), { target: { value: 'osaka' } });

    expect(screen.queryByText('テストプラン1')).not.toBeInTheDocument();
    expect(screen.getByText('テストプラン2')).toBeInTheDocument();
  });

  it('カテゴリでフィルタリングできる', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });

    // 観光でフィルタリング
    fireEvent.change(screen.getByLabelText('カテゴリ:'), { target: { value: '観光' } });

    expect(screen.queryByText('テストプラン1')).not.toBeInTheDocument();
    expect(screen.getByText('テストプラン2')).toBeInTheDocument();
  });

  it('APIエラー時にプランが表示されない', async () => {
    (api.plans.listPublic as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開されているプランがまだありません')).toBeInTheDocument();
    });
  });

  it('プランが存在しない場合適切なメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開されているプランがまだありません')).toBeInTheDocument();
    });
  });
});
