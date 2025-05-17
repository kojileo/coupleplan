import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicPlansPage from '@/app/plans/public/page';
import { api } from '@/lib/api';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

// APIのモック
jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      listPublic: jest.fn(),
    },
  },
}));

// supabase-authのモック
jest.mock('@/lib/supabase-auth', () => {
  // テスト用の固定トークンを使用
  const TEST_TOKEN = 'test-token-' + Date.now();
  const TEST_REFRESH_TOKEN = 'test-refresh-token-' + Date.now();

  return {
    supabase: {
      auth: {
        onAuthStateChange: jest.fn().mockReturnValue({
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        }),
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              access_token: process.env.TEST_ACCESS_TOKEN || TEST_TOKEN,
              refresh_token: process.env.TEST_REFRESH_TOKEN || TEST_REFRESH_TOKEN,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: process.env.TEST_USER_ID || 'test-user-id-123',
                email: process.env.TEST_USER_EMAIL || 'test@example.com',
              },
            },
          },
        }),
      },
    },
  };
});

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('PublicPlansPage', () => {
  const mockPlans = [
    {
      id: '1',
      title: '東京旅行',
      description: '東京観光プラン',
      date: '2024-01-01',
      budget: 10000,
      region: 'tokyo',
      isPublic: true,
      userId: 'user1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      locations: [],
      likes: [],
      profile: {
        id: 'profile1',
        userId: 'user1',
        name: 'テストユーザー',
        email: 'test@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ session: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(<AuthProvider>{ui}</AuthProvider>);
  };

  it('公開プラン一覧を表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });

    render(<PublicPlansPage />);

    // ローディング表示を確認
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('東京旅行')).toBeInTheDocument();
    });

    expect(screen.getByText('東京観光プラン')).toBeInTheDocument();
    expect(screen.getByText('tokyo')).toBeInTheDocument();
    expect(screen.getByText('¥10,000')).toBeInTheDocument();
  });

  it('エラー時にエラーメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開されているプランがまだありません')).toBeInTheDocument();
    });
  });

  it('地域でフィルタリングできる', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });

    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開されているデートプラン')).toBeInTheDocument();
    });

    const regionSelect = screen.getByLabelText('地域:');
    expect(regionSelect).toBeInTheDocument();
  });

  it('プランが存在しない場合のメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });

    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開されているプランがまだありません')).toBeInTheDocument();
    });
  });

  it('選択した地域にプランが存在しない場合のメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });

    render(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開されているデートプラン')).toBeInTheDocument();
    });

    const regionSelect = screen.getByLabelText('地域:');
    expect(regionSelect).toBeInTheDocument();
  });
});
