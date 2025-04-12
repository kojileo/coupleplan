import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicPlansPage from '@/app/(dashboard)/plans/public/page';
import { api } from '@/lib/api';
import { AuthProvider } from '@/contexts/AuthContext';
import { randomUUID } from 'crypto';

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
  const generateMockSession = () => ({
    access_token: process.env.TEST_ACCESS_TOKEN || `test-token-${randomUUID()}`,
    refresh_token: process.env.TEST_REFRESH_TOKEN || `refresh-token-${randomUUID()}`,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: process.env.TEST_USER_ID || 'test-user-id-123',
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
    },
  });

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
            session: generateMockSession(),
          },
        }),
      },
    },
  };
});

describe('PublicPlansPage', () => {
  const mockPlans = [
    {
      id: '1',
      title: '東京デート',
      description: '東京でのデートプラン',
      date: '2024-04-01',
      location: 'https://example.com/tokyo',
      region: 'tokyo',
      budget: 10000,
      isPublic: true,
      userId: 'user1',
      createdAt: '2025-03-30T06:41:22.382Z',
      updatedAt: '2025-03-30T06:41:22.382Z',
      profile: { name: 'ユーザー1' },
      likes: [],
      _count: { likes: 0 },
    },
    {
      id: '2',
      title: '大阪デート',
      description: '大阪でのデートプラン',
      date: '2024-04-02',
      location: 'https://example.com/osaka',
      region: 'osaka',
      budget: 8000,
      isPublic: true,
      userId: 'user2',
      createdAt: '2025-03-30T06:41:22.382Z',
      updatedAt: '2025-03-30T06:41:22.382Z',
      profile: { name: 'ユーザー2' },
      likes: [],
      _count: { likes: 0 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(
      <AuthProvider>
        {ui}
      </AuthProvider>
    );
  };

  it('公開プラン一覧を表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: mockPlans });
    renderWithAuth(<PublicPlansPage />);

    // ローディング表示を待つ
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '公開プラン一覧' })).toBeInTheDocument();
    });

    // プランが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('東京デート')).toBeInTheDocument();
      expect(screen.getByText('大阪デート')).toBeInTheDocument();
    });
  });

  it('地域でフィルタリングできる', async () => {
    const mockApi = api.plans.listPublic as jest.Mock;
    mockApi.mockResolvedValue({ data: mockPlans });
    renderWithAuth(<PublicPlansPage />);

    // ローディング表示を待つ
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '公開プラン一覧' })).toBeInTheDocument();
    });

    // 地域セレクトボックスを取得
    const regionSelect = screen.getByLabelText('地域:');

    // 東京を選択
    await userEvent.selectOptions(regionSelect, 'tokyo');
    mockApi.mockResolvedValue({ data: [mockPlans[0]] });
    await waitFor(() => {
      expect(screen.getByText('東京デート')).toBeInTheDocument();
      expect(screen.queryByText('大阪デート')).not.toBeInTheDocument();
    });

    // 大阪を選択
    await userEvent.selectOptions(regionSelect, 'osaka');
    mockApi.mockResolvedValue({ data: [mockPlans[1]] });
    await waitFor(() => {
      expect(screen.queryByText('東京デート')).not.toBeInTheDocument();
      expect(screen.getByText('大阪デート')).toBeInTheDocument();
    });

    // すべてを選択
    await userEvent.selectOptions(regionSelect, '');
    mockApi.mockResolvedValue({ data: mockPlans });
    await waitFor(() => {
      expect(screen.getByText('東京デート')).toBeInTheDocument();
      expect(screen.getByText('大阪デート')).toBeInTheDocument();
    });
  });

  it('プランが存在しない場合のメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });
    renderWithAuth(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('公開プランがまだありません')).toBeInTheDocument();
    });
  });

  it('選択した地域にプランが存在しない場合のメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });
    renderWithAuth(<PublicPlansPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '公開プラン一覧' })).toBeInTheDocument();
    });

    const regionSelect = screen.getByLabelText('地域:');
    await userEvent.selectOptions(regionSelect, 'kyoto');

    await waitFor(() => {
      expect(screen.getByText('選択された地域の公開プランがありません')).toBeInTheDocument();
    });
  });
}); 