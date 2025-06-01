import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';

import PlanDetailPage from '@/app/(dashboard)/plans/[id]/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api');
jest.mock('@/components/features/plans/PublishDialog', () => {
  return function MockPublishDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return isOpen ? (
      <div data-testid="publish-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null;
  };
});

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockApi = {
  plans: {
    get: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
} as any;

// api全体をモック
(api as any).plans = mockApi.plans;

// テスト用のプランデータ
const mockPlan = {
  id: 'plan-123',
  title: 'テストプラン',
  description: 'テスト用の説明',
  date: '2024-12-31T00:00:00.000Z',
  budget: 10000,
  locations: [
    { url: 'https://example.com', name: 'テスト場所' },
    { url: 'https://example2.com', name: null },
  ],
  region: 'tokyo',
  isPublic: false,
  category: null,
  userId: 'user-123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  profile: { id: 'profile-123', name: 'テストユーザー', avatarUrl: null },
  likes: [],
  _count: { likes: 0 },
};

// テスト用の定数
// テスト用の固定トークンを使用
const TEST_ACCESS_TOKEN = 'test-token-' + Date.now();
const TEST_REFRESH_TOKEN = 'test-refresh-token-' + Date.now();

const mockSession = {
  access_token: process.env.TEST_ACCESS_TOKEN || TEST_ACCESS_TOKEN,
  refresh_token: process.env.TEST_REFRESH_TOKEN || TEST_REFRESH_TOKEN,
  expires_in: 3600,
  token_type: 'Bearer',
  user: {
    id: 'user-123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
  },
};

const mockOtherUserSession = {
  access_token: process.env.TEST_ACCESS_TOKEN || TEST_ACCESS_TOKEN,
  refresh_token: process.env.TEST_REFRESH_TOKEN || TEST_REFRESH_TOKEN,
  expires_in: 3600,
  token_type: 'Bearer',
  user: {
    id: 'other-user',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
  },
};

const mockAuthContext = {
  user: null,
  isLoading: false,
  signOut: jest.fn(),
};

describe('PlanDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue(mockRouter as any);
    // windowオブジェクトのモック
    Object.defineProperty(window, 'confirm', {
      value: jest.fn(),
      writable: true,
    });
    Object.defineProperty(window, 'alert', {
      value: jest.fn(),
      writable: true,
    });
  });

  describe('ローディング状態', () => {
    it('planIdが未解決の場合、ローディングスピナーを表示する', () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('データ取得中はローディングスピナーを表示する', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockImplementation(() => new Promise(() => {})); // 永続的に保留

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });
  });

  describe('プラン表示', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({ data: mockPlan });
    });

    it('プランの基本情報を表示する', async () => {
      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('テストプラン')).toBeInTheDocument();
        expect(screen.getByText('テスト用の説明')).toBeInTheDocument();
        expect(screen.getByText('¥10,000')).toBeInTheDocument();
        expect(screen.getByText('東京')).toBeInTheDocument();
      });
    });

    it('場所URLを正しく表示する', async () => {
      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const link1 = screen.getByText('テスト場所');
        expect(link1).toBeInTheDocument();
        expect(link1.closest('a')).toHaveAttribute('href', 'https://example.com');

        const link2 = screen.getByText('example2.com');
        expect(link2).toBeInTheDocument();
        expect(link2.closest('a')).toHaveAttribute('href', 'https://example2.com');
      });
    });

    it('日付を正しい形式で表示する', async () => {
      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('2024/12/31')).toBeInTheDocument();
      });
    });

    it('作成日と更新日を表示する', async () => {
      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText(/作成日: 2024年1月1日/)).toBeInTheDocument();
        expect(screen.getByText(/更新日: 2024年1月1日/)).toBeInTheDocument();
      });
    });
  });

  describe('プラン所有者の表示', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({ data: mockPlan });
    });

    it('所有者の場合、編集・削除・公開設定ボタンを表示する', async () => {
      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('編集')).toBeInTheDocument();
        expect(screen.getByText('削除')).toBeInTheDocument();
        expect(screen.getByText('公開設定')).toBeInTheDocument();
        expect(screen.queryByText('このプランから作成')).not.toBeInTheDocument();
      });
    });

    it('編集ボタンクリックで編集ページに遷移する', async () => {
      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const editButton = screen.getByText('編集');
        fireEvent.click(editButton);
        expect(mockRouter.push).toHaveBeenCalledWith('/plans/plan-123/edit');
      });
    });

    it('公開設定ボタンクリックで公開ダイアログを開く', async () => {
      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const publishButton = screen.getByText('公開設定');
        fireEvent.click(publishButton);
        expect(screen.getByTestId('publish-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('他のユーザーからの表示', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockOtherUserSession } as any);
      mockApi.plans.get.mockResolvedValue({ data: mockPlan });
    });

    it('他のユーザーの場合、「このプランから作成」ボタンを表示する', async () => {
      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('このプランから作成')).toBeInTheDocument();
        expect(screen.queryByText('編集')).not.toBeInTheDocument();
        expect(screen.queryByText('削除')).not.toBeInTheDocument();
        expect(screen.queryByText('公開設定')).not.toBeInTheDocument();
      });
    });
  });

  describe('プラン削除', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({ data: mockPlan });
    });

    it('削除確認でキャンセルした場合、削除されない', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const deleteButton = screen.getByText('削除');
        fireEvent.click(deleteButton);
        expect(mockApi.plans.delete).not.toHaveBeenCalled();
      });
    });

    it('削除確認でOKした場合、プランを削除してリダイレクトする', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      mockApi.plans.delete.mockResolvedValue({ success: true });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const deleteButton = screen.getByText('削除');
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(mockApi.plans.delete).toHaveBeenCalledWith(
          process.env.TEST_ACCESS_TOKEN || TEST_ACCESS_TOKEN,
          'plan-123'
        );
        expect(mockRouter.push).toHaveBeenCalledWith('/plans');
      });
    });

    it('削除に失敗した場合、エラーメッセージを表示する', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      mockApi.plans.delete.mockResolvedValue({ error: '削除に失敗しました' });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const deleteButton = screen.getByText('削除');
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('プランの削除に失敗しました');
      });
    });
  });

  describe('プラン作成（コピー）', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockOtherUserSession } as any);
      mockApi.plans.get.mockResolvedValue({ data: mockPlan });
    });

    it('「このプランから作成」ボタンで新しいプランを作成する', async () => {
      const newPlan = { ...mockPlan, id: 'new-plan-123', title: 'テストプラン (コピー)' };
      mockApi.plans.create.mockResolvedValue({ data: newPlan });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const createButton = screen.getByText('このプランから作成');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(mockApi.plans.create).toHaveBeenCalledWith(
          process.env.TEST_ACCESS_TOKEN || TEST_ACCESS_TOKEN,
          {
            title: 'テストプラン (コピー)',
            description: 'テスト用の説明',
            date: '2024-12-31T00:00:00.000Z',
            locations: [
              { url: 'https://example.com', name: 'テスト場所' },
              { url: 'https://example2.com', name: null },
            ],
            region: 'tokyo',
            budget: 10000,
            isPublic: false,
            category: null,
          }
        );
        expect(mockRouter.push).toHaveBeenCalledWith('/plans/new-plan-123/edit');
      });
    });

    it('プラン作成に失敗した場合、エラーメッセージを表示する', async () => {
      mockApi.plans.create.mockResolvedValue({ error: '作成に失敗しました' });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const createButton = screen.getByText('このプランから作成');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('プランの作成に失敗しました');
      });
    });

    it('APIレスポンスにIDがない場合、エラーメッセージを表示する', async () => {
      mockApi.plans.create.mockResolvedValue({ data: { ...mockPlan, id: undefined } });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const createButton = screen.getByText('このプランから作成');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('プランの作成に失敗しました');
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('プラン取得に失敗した場合、プラン一覧にリダイレクトする', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({ error: 'プランが見つかりません' });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/plans');
      });
    });

    it('セッションがない場合、ローディングを停止して空の状態を表示する', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: null } as any);

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      // ローディングが完了するまで待機
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('プランがnullの場合、空のdivを表示する', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({ data: null });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.queryByText('テストプラン')).not.toBeInTheDocument();
      });
    });
  });

  describe('地域表示', () => {
    const regionTestCases = [
      { region: 'tokyo', expected: '東京' },
      { region: 'osaka', expected: '大阪' },
      { region: 'kyoto', expected: '京都' },
      { region: 'fukuoka', expected: '福岡' },
      { region: 'sapporo', expected: '札幌' },
      { region: 'nagoya', expected: '名古屋' },
      { region: 'yokohama', expected: '横浜' },
      { region: 'kobe', expected: '神戸' },
      { region: 'other', expected: 'その他' },
    ];

    regionTestCases.forEach(({ region, expected }) => {
      it(`地域が${region}の場合、${expected}を表示する`, async () => {
        mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
        mockApi.plans.get.mockResolvedValue({
          data: { ...mockPlan, region },
        });

        render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

        await waitFor(() => {
          expect(screen.getByText(expected)).toBeInTheDocument();
        });
      });
    });

    it('地域がunknownの場合、何も表示されない', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({
        data: { ...mockPlan, region: 'unknown' },
      });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        // 地域セクションが存在するが、中身は空のspanになる
        const regionSection = screen.getByText('地域').closest('div');
        expect(regionSection).toBeInTheDocument();
      });
    });

    it('地域がnullの場合、「未設定」を表示する', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({
        data: { ...mockPlan, region: null },
      });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('未設定')).toBeInTheDocument();
      });
    });
  });

  describe('日付表示', () => {
    it('日付がnullの場合、「未設定」を表示する', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({
        data: { ...mockPlan, date: null },
      });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('未設定')).toBeInTheDocument();
      });
    });
  });

  describe('場所表示', () => {
    it('場所がない場合、「未設定」を表示する', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({
        data: { ...mockPlan, locations: [] },
      });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('未設定')).toBeInTheDocument();
      });
    });

    it('場所がnullの場合、「未設定」を表示する', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
      mockApi.plans.get.mockResolvedValue({
        data: { ...mockPlan, locations: null },
      });

      render(<PlanDetailPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('未設定')).toBeInTheDocument();
      });
    });
  });
});
