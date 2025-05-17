import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await waitFor(
      () => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: '地域:' }), {
        target: { value: 'osaka' },
      });
    });

    await waitFor(() => {
      expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: 'カテゴリ:' }), {
        target: { value: 'グルメ' },
      });
    });

    await waitFor(
      () => {
        expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('APIエラー時に適切なエラーメッセージが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));

    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await waitFor(
      () => {
        expect(screen.getByText('プランの取得に失敗しました')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('セッションがない場合でも正常に動作する', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null });

    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await waitFor(
      () => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('フィルター条件に一致するプランがない場合、適切なメッセージが表示される', async () => {
    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: '地域:' }), {
        target: { value: 'tokyo' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: 'カテゴリ:' }), {
        target: { value: 'グルメ' },
      });
    });

    await waitFor(
      () => {
        expect(screen.getByText('選択された条件に一致するプランがありません')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('複数のフィルター条件を組み合わせて使用できる', async () => {
    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: '地域:' }), {
        target: { value: 'osaka' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: 'カテゴリ:' }), {
        target: { value: 'グルメ' },
      });
    });

    await waitFor(
      () => {
        expect(screen.getByText('大阪グルメプラン')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
