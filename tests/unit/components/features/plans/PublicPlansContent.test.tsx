import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicPlansContent from '@/components/features/plans/PublicPlansContent';
import { api } from '@/lib/api';

// APIのモック
jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      listPublic: jest.fn(),
    },
  },
}));

// Next.js Linkのモック
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('PublicPlansContent', () => {
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
    _count: {
      likes: 15,
    },
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
    _count: {
      likes: 5,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング状態を表示する', () => {
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

  it('専門家監修プランを正しく表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan],
    });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('恋愛・デート専門家監修プラン')).toBeInTheDocument();
    });

    // プラン詳細の確認
    expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
    expect(
      screen.getByText(/心理学に基づいた初デートの成功確率を最大化するプラン/)
    ).toBeInTheDocument();
    expect(screen.getByText('📍 tokyo')).toBeInTheDocument();
    expect(screen.getByText('💰 ¥12,000')).toBeInTheDocument();
    expect(screen.getByText('❤️ 15')).toBeInTheDocument();
    expect(screen.getByText('専門家監修')).toBeInTheDocument();
  });

  it('ユーザープランを正しく表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockUserPlan],
    });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('実際のカップルが成功したプラン')).toBeInTheDocument();
    });

    // プラン詳細の確認
    expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
    expect(screen.getByText('横浜でのロマンチックなデートプラン')).toBeInTheDocument();
    expect(screen.getByText('📍 yokohama')).toBeInTheDocument();
    expect(screen.getByText('💰 ¥8,000')).toBeInTheDocument();
    expect(screen.getByText('❤️ 5')).toBeInTheDocument();
    expect(screen.getByText('実体験')).toBeInTheDocument();
  });

  it('管理者プランとユーザープランを分離して表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan, mockUserPlan],
    });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('恋愛・デート専門家監修プラン')).toBeInTheDocument();
      expect(screen.getByText('実際のカップルが成功したプラン')).toBeInTheDocument();
    });

    // 両方のプランが表示される
    expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
    expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
  });

  it('地域フィルターが正しく動作する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan, mockUserPlan],
    });

    const user = userEvent.setup();
    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
      expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
    });

    // 地域フィルターを変更
    const regionSelect = screen.getByLabelText('地域:');
    await user.selectOptions(regionSelect, 'tokyo');

    // 東京のプランのみ表示される
    expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
    expect(screen.queryByText('横浜デートプラン')).not.toBeInTheDocument();
  });

  it('カテゴリフィルターが正しく動作する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan, mockUserPlan],
    });

    const user = userEvent.setup();
    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
      expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
    });

    // カテゴリフィルターを変更
    const categorySelect = screen.getByLabelText('カテゴリ:');
    await user.selectOptions(categorySelect, '観光');

    // 観光カテゴリのプランのみ表示される
    expect(screen.queryByText('初デート成功の心理学戦略プラン【渋谷編】')).not.toBeInTheDocument();
    expect(screen.getByText('横浜デートプラン')).toBeInTheDocument();
  });

  it('プランが見つからない場合のメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [],
    });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('プランが見つかりません')).toBeInTheDocument();
      expect(screen.getByText('公開されているプランがまだありません。')).toBeInTheDocument();
    });
  });

  it('フィルター条件に一致しない場合のメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan],
    });

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

  it('APIエラー時にプランが見つからないメッセージを表示する', async () => {
    (api.plans.listPublic as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('プランが見つかりません')).toBeInTheDocument();
    });
  });

  it('詳細ボタンがサインアップページにリンクしている', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan],
    });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText('初デート成功の心理学戦略プラン【渋谷編】')).toBeInTheDocument();
    });

    const detailButton = screen.getByRole('link', { name: '詳細を見る' });
    expect(detailButton).toHaveAttribute('href', '/signup');
  });

  it('メリット紹介セクションが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [],
    });

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

  it('ヒーローセクションが正しく表示される', () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [],
    });

    render(<PublicPlansContent />);

    expect(screen.getByText('プロが監修した')).toBeInTheDocument();
    expect(screen.getByText('デートプラン集')).toBeInTheDocument();
    expect(screen.getByText(/恋愛・デートの専門家が監修したプランから/)).toBeInTheDocument();
    expect(screen.getByText(/あなたの理想のデートがここにあります。/)).toBeInTheDocument();
  });

  it('フィルターセクションが正しく表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [],
    });

    render(<PublicPlansContent />);

    expect(screen.getByText('公開プラン一覧')).toBeInTheDocument();
    expect(screen.getByLabelText('地域:')).toBeInTheDocument();
    expect(screen.getByLabelText('カテゴリ:')).toBeInTheDocument();
  });

  it('専門用語と心理学的根拠が含まれている', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: [mockAdminPlan],
    });

    render(<PublicPlansContent />);

    await waitFor(() => {
      expect(screen.getByText(/ミラーリング効果、近接効果、共感的理解/)).toBeInTheDocument();
      expect(screen.getByText(/5段階構成/)).toBeInTheDocument();
      expect(screen.getByText(/恋愛心理学に基づいて設計された/)).toBeInTheDocument();
    });
  });
});
