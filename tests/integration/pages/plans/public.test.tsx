import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicPlansContent from '@/components/features/plans/PublicPlansContent';
import { api } from '@/lib/api';
import { AuthProvider } from '@/contexts/AuthContext';

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

describe('PublicPlansContent - 統合テスト', () => {
  const mockAdminPlan = {
    id: 'admin-plan-1',
    title: '初デート成功の心理学戦略プラン【渋谷編】',
    description:
      '心理学に基づいた初デートの成功確率を最大化するプラン。ミラーリング効果、近接効果、共感的理解を活用し、自然な会話の流れを作る5段階構成。',
    region: 'tokyo',
    budget: 12000,
    category: '定番デート',
    isPublic: true,
    isRecommended: true,
    userId: 'admin-user-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    profile: {
      id: 'admin-profile-1',
      name: '管理者',
      avatarUrl: null,
      isAdmin: true,
    },
    locations: [
      {
        id: 'loc-1',
        name: '渋谷スカイ（心理的距離を縮める効果）',
        url: 'https://www.shibuya-sky.com/',
      },
    ],
    likes: [],
    _count: { likes: 15 },
  };

  const mockUserPlan = {
    id: 'user-plan-1',
    title: '横浜デートプラン',
    description: '横浜でのロマンチックなデートプラン',
    region: 'yokohama',
    budget: 8000,
    category: '観光',
    isPublic: true,
    isRecommended: false,
    userId: 'user-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    profile: {
      id: 'user-profile-1',
      name: 'カップルA',
      avatarUrl: null,
      isAdmin: false,
    },
    locations: [
      {
        id: 'loc-2',
        name: '横浜中華街',
        url: 'https://www.chinatown.or.jp/',
      },
    ],
    likes: [],
    _count: { likes: 5 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('プロが監修したデートプラン集のヒーローセクションが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });

    render(<PublicPlansContent />);

    expect(screen.getByText('プロが監修した')).toBeInTheDocument();
    expect(screen.getByText('デートプラン集')).toBeInTheDocument();
    expect(screen.getByText(/恋愛・デートの専門家が監修したプランから/)).toBeInTheDocument();
    expect(screen.getByText(/あなたの理想のデートがここにあります。/)).toBeInTheDocument();
  });

  it('恋愛・デート専門家監修プランセクションが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [mockAdminPlan] });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('恋愛・デート専門家監修プラン')).toBeInTheDocument();
    });

    expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
    expect(
      screen.getByText(/心理学に基づいた初デートの成功確率を最大化するプラン/)
    ).toBeInTheDocument();
    expect(screen.getByText('📍 tokyo')).toBeInTheDocument();
    expect(screen.getByText('💰 ¥12,000')).toBeInTheDocument();
    expect(screen.getByText('❤️ 15')).toBeInTheDocument();
    expect(screen.getByText('専門家監修')).toBeInTheDocument();
  });

  it('実際のカップルが成功したプランセクションが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [mockUserPlan] });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('実際のカップルが成功したプラン')).toBeInTheDocument();
    });

    expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
    expect(screen.getByText('横浜でのロマンチックなデートプラン')).toBeInTheDocument();
    expect(screen.getByText('📍 yokohama')).toBeInTheDocument();
    expect(screen.getByText('💰 ¥8,000')).toBeInTheDocument();
    expect(screen.getByText('❤️ 5')).toBeInTheDocument();
    expect(screen.getByText('実体験')).toBeInTheDocument();
  });

  it('地域フィルターが正しく機能する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan, mockUserPlan],
    });

    const user = userEvent.setup();
    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
      expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
    });

    // 地域フィルターを東京に設定
    const regionSelect = screen.getByLabelText('地域:');
    await user.selectOptions(regionSelect, 'tokyo');

    // 東京のプランのみが表示される
    expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
    expect(screen.queryByText('横浜デートプラン')).not.toBeInTheDocument();
  });

  it('カテゴリフィルターが正しく機能する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan, mockUserPlan],
    });

    const user = userEvent.setup();
    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
      expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
    });

    // カテゴリフィルターを観光に設定
    const categorySelect = screen.getByLabelText('カテゴリ:');
    await user.selectOptions(categorySelect, '観光');

    // 観光カテゴリのプランのみが表示される
    expect(screen.queryByText('初デート成功の心理学戦略プラン【渋谷編】')).not.toBeInTheDocument();
    expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
  });

  it('詳細を見るボタンがサインアップページにリンクしている', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [mockAdminPlan] });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByText('詳細を見る');
    expect(detailButtons[0]).toHaveAttribute('href', '/signup');
  });

  it('プランが見つからない場合の適切なメッセージが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('プランが見つかりません')).toBeInTheDocument();
    });

    expect(screen.getByText('公開されているプランがまだありません。')).toBeInTheDocument();
  });

  it('APIエラー時にプランが見つからないメッセージが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('プランが見つかりません')).toBeInTheDocument();
    });
  });

  it('メリット紹介セクションが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [] });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('あなたもデートプランを作成しませんか？')).toBeInTheDocument();
    });

    expect(screen.getByText('思い出を共有')).toBeInTheDocument();
    expect(screen.getByText('評価を獲得')).toBeInTheDocument();
    expect(screen.getByText('新しい発見')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '無料でアカウントを作成する' })).toHaveAttribute(
      'href',
      '/signup'
    );
  });

  it('心理学的根拠を含む専門コンテンツが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [mockAdminPlan] });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText(/ミラーリング効果、近接効果、共感的理解/)).toBeInTheDocument();
    });

    expect(screen.getByText(/5段階構成/)).toBeInTheDocument();
    // 恋愛心理学に基づいて設計された、という文言を確認
    expect(screen.getByText(/恋愛心理学に基づいて設計された/)).toBeInTheDocument();
  });

  it('ローディング状態が正しく表示される', () => {
    (api.plans.listPublic as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // 永続的なpending状態
    );

    render(<PublicPlansContent />);

    // ローディングスピナーのクラスを確認
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass(
      'rounded-full',
      'h-12',
      'w-12',
      'border-4',
      'border-rose-200',
      'border-t-rose-600'
    );
  });

  it('プランの並び順が正しい（管理者プランが優先される）', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan, mockUserPlan],
    });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('恋愛・デート専門家監修プラン')).toBeInTheDocument();
    });

    // 専門家監修プランセクションが先に表示される
    const expertSection = screen.getByText('恋愛・デート専門家監修プラン');
    const userSection = screen.getByText('実際のカップルが成功したプラン');

    expect(
      expertSection.compareDocumentPosition(userSection) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('フィルター条件に一致しない場合の適切なメッセージが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [mockAdminPlan] });

    const user = userEvent.setup();
    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
    });

    // 該当しない地域でフィルタリング
    const regionSelect = screen.getByLabelText('地域:');
    await user.selectOptions(regionSelect, 'osaka');

    await waitFor(() => {
      expect(screen.getByText('プランが見つかりません')).toBeInTheDocument();
      expect(
        screen.getByText(
          '選択された条件に一致するプランがありません。フィルターを変更してお試しください。'
        )
      ).toBeInTheDocument();
    });
  });
});
