import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ExplorePlansPage from '@/app/(dashboard)/plans/explore/page';
import { api } from '@/lib/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

jest.mock('@/lib/api');
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: process.env.TEST_ACCESS_TOKEN } },
      }),
    },
  }),
}));

describe('ExplorePlansPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPlan = {
    id: '1',
    title: 'テストプラン1',
    description: '説明1',
    budget: 10000,
    region: 'tokyo',
    category: '定番デート',
    profile: { name: 'テストユーザー1' },
    likes: [],
    locations: [{ url: 'https://example.com/location1' }],
    isPublic: true,
    isRecommended: false,
    date: new Date().toISOString(),
    _count: { likes: 0 },
  };

  it('プランが正しく表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [mockPlan] });

    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });
  });

  it('地域フィルターが機能する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [mockPlan] });

    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('地域:'), { target: { value: 'tokyo' } });
    });

    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });
  });

  it('カテゴリフィルターが機能する', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValue({ data: [mockPlan] });

    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('カテゴリ:'), { target: { value: '定番デート' } });
    });

    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockRejectedValue(new Error('APIエラー'));

    await act(async () => {
      render(<ExplorePlansPage />);
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('プランの取得に失敗しました');
    });
  });
});
