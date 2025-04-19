import { render, screen, waitFor } from '@testing-library/react';
import PublicPlansPage from '@/app/plans/public/page';
import { api } from '@/lib/api';

// APIモックの設定
jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      listPublic: jest.fn(),
    },
  },
}));

describe('PublicPlansPage コンポーネント', () => {
  const mockPlans = [
    {
      id: '1',
      title: '東京デートプラン',
      description: '東京でのデートプラン',
      date: '2024-03-20',
      budget: 10000,
      region: 'tokyo',
      category: '定番デート',
      isPublic: true,
      locations: [
        {
          id: '1',
          url: 'https://example.com',
          name: '東京タワー',
        },
      ],
    },
    {
      id: '2',
      title: '大阪デートプラン',
      description: '大阪でのデートプラン',
      date: '2024-03-21',
      budget: 8000,
      region: 'osaka',
      category: 'グルメ',
      isPublic: true,
      locations: [
        {
          id: '2',
          url: 'https://example.com',
          name: '道頓堀',
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング中はスピナーが表示されること', () => {
    (api.plans.listPublic as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<PublicPlansPage />);
    expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument();
  });

  it('プラン一覧が正しく表示されること', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
      expect(screen.getByText('大阪デートプラン')).toBeInTheDocument();
    });
  });

  it('地域フィルターが機能すること', () => {
    render(<PublicPlansPage />);

    // 地域フィルターの選択肢が正しく表示されることを確認
    const regionOptions = screen.getAllByText('すべて');
    expect(regionOptions[0]).toBeInTheDocument();
    expect(screen.getByText('東京')).toBeInTheDocument();
    expect(screen.getByText('大阪')).toBeInTheDocument();
  });

  it('カテゴリフィルターが機能すること', () => {
    render(<PublicPlansPage />);

    // カテゴリフィルターの選択肢が正しく表示されることを確認
    const categoryOptions = screen.getAllByText('すべて');
    expect(categoryOptions[1]).toBeInTheDocument();
    expect(screen.getByText('定番デート')).toBeInTheDocument();
    expect(screen.getByText('グルメ')).toBeInTheDocument();
  });

  it('プランが存在しない場合のメッセージが表示されること', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開されているプランがまだありません')).toBeInTheDocument();
    });
  });

  it('APIエラー時にエラーメッセージが表示されること', async () => {
    (api.plans.listPublic as jest.Mock).mockRejectedValue(new Error('APIエラー'));
    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開されているプランがまだありません')).toBeInTheDocument();
    });
  });
});
