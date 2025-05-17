import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExplorePlansPage from '@/app/(dashboard)/plans/explore/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

// モック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      listPublic: jest.fn(),
    },
  },
}));

describe('ExplorePlansPage コンポーネント', () => {
  const mockPlans: Plan[] = [
    {
      id: 'plan-1',
      title: '東京デートプラン',
      description: '東京でのデートプラン',
      date: new Date('2024-03-20'),
      budget: 10000,
      locations: [
        {
          id: 'loc-1',
          url: 'https://example.com/1',
          name: '東京タワー',
          planId: 'plan-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ],
      region: 'tokyo',
      category: 'デート',
      isPublic: true,
      isRecommended: false,
      userId: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'plan-2',
      title: '大阪グルメプラン',
      description: '大阪でのグルメプラン',
      date: new Date('2024-03-21'),
      budget: 15000,
      locations: [
        {
          id: 'loc-2',
          url: 'https://example.com/2',
          name: '道頓堀',
          planId: 'plan-2',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ],
      region: 'osaka',
      category: 'グルメ',
      isPublic: true,
      isRecommended: false,
      userId: 'user-2',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      session: { access_token: 'test-token' },
    });
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: mockPlans,
    });
  });

  it('ローディング中はスピナーが表示される', () => {
    render(<ExplorePlansPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('プランが正しく表示される', async () => {
    render(<ExplorePlansPage />);

    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
      expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
    });
  });

  it('地域フィルターが機能する', async () => {
    render(<ExplorePlansPage />);

    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
    });

    // 地域フィルターを変更
    const regionSelect = screen.getByLabelText('地域:');
    fireEvent.change(regionSelect, { target: { value: 'tokyo' } });

    // 東京のプランのみが表示される
    expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
    expect(screen.queryByText('大阪グルメプラン')).not.toBeInTheDocument();
  });

  it('カテゴリフィルターが機能する', async () => {
    render(<ExplorePlansPage />);

    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
    });

    // カテゴリフィルターを変更
    const categorySelect = screen.getByLabelText('カテゴリ:');
    fireEvent.change(categorySelect, { target: { value: 'グルメ' } });

    // グルメカテゴリのプランのみが表示される
    expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
    expect(screen.queryByText('東京デートプラン')).not.toBeInTheDocument();
  });

  it('フィルター条件に一致するプランがない場合、メッセージが表示される', async () => {
    render(<ExplorePlansPage />);

    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
    });

    // 存在しない地域を選択
    const regionSelect = screen.getByLabelText('地域:');
    fireEvent.change(regionSelect, { target: { value: 'kyoto' } });

    // メッセージが表示される
    expect(screen.getByText('選択された条件に一致するプランがありません')).toBeInTheDocument();
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    // APIエラーをモック
    (api.plans.listPublic as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));

    render(<ExplorePlansPage />);

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('プランの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('セッションがない場合、ローディングが終了する', async () => {
    // セッションがない状態をモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });

    render(<ExplorePlansPage />);

    // ローディングが終了する
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
