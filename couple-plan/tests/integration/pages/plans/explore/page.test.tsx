import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExplorePlansPage from '@/app/(dashboard)/plans/explore/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';
import { createMockSession } from '@tests/utils/test-constants';

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

describe('ExplorePlansPage インテグレーションテスト', () => {
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
    const mockSession = createMockSession('test-user');
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (api.plans.listPublic as jest.Mock).mockResolvedValue({
      data: mockPlans,
    });
  });

  it('プラン一覧が正しく表示され、フィルターが機能する', async () => {
    render(<ExplorePlansPage />);

    // 初期表示の確認
    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
      expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
    });

    // 地域フィルターのテスト
    const regionSelect = screen.getByLabelText('地域:');
    fireEvent.change(regionSelect, { target: { value: 'tokyo' } });

    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
      expect(screen.queryByText('大阪グルメプラン')).not.toBeInTheDocument();
    });

    // カテゴリフィルターのテスト
    const categorySelect = screen.getByLabelText('カテゴリ:');
    fireEvent.change(categorySelect, { target: { value: 'グルメ' } });

    await waitFor(() => {
      expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
      expect(screen.queryByText('東京デートプラン')).not.toBeInTheDocument();
    });
  });

  it('APIエラー時に適切なエラーメッセージが表示される', async () => {
    // APIエラーをモック
    (api.plans.listPublic as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));

    render(<ExplorePlansPage />);

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('プランの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('セッションがない場合でも正常に動作する', async () => {
    // セッションがない状態をモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });

    render(<ExplorePlansPage />);

    // ローディングが終了し、プランが表示される
    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
      expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
    });
  });

  it('フィルター条件に一致するプランがない場合、適切なメッセージが表示される', async () => {
    render(<ExplorePlansPage />);

    // 初期表示の確認
    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
    });

    // 存在しない地域を選択
    const regionSelect = screen.getByLabelText('地域:');
    fireEvent.change(regionSelect, { target: { value: 'kyoto' } });

    // メッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('選択された条件に一致するプランがありません')).toBeInTheDocument();
    });
  });

  it('複数のフィルター条件を組み合わせて使用できる', async () => {
    render(<ExplorePlansPage />);

    // 初期表示の確認
    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
      expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
    });

    // 地域とカテゴリのフィルターを設定
    const regionSelect = screen.getByLabelText('地域:');
    const categorySelect = screen.getByLabelText('カテゴリ:');

    fireEvent.change(regionSelect, { target: { value: 'tokyo' } });
    fireEvent.change(categorySelect, { target: { value: 'デート' } });

    // 条件に一致するプランのみが表示される
    await waitFor(() => {
      expect(screen.getByText('東京デートプラン')).toBeInTheDocument();
      expect(screen.queryByText('大阪グルメプラン')).not.toBeInTheDocument();
    });
  });
});
