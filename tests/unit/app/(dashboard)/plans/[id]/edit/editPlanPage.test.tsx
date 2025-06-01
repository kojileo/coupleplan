import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';

import EditPlanPage from '@/app/(dashboard)/plans/[id]/edit/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api');

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
    update: jest.fn(),
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

const mockAuthContext = {
  user: null,
  isLoading: false,
  signOut: jest.fn(),
};

describe('EditPlanPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue(mockRouter as any);
    mockUseAuth.mockReturnValue({ ...mockAuthContext, session: mockSession } as any);
    mockApi.plans.get.mockResolvedValue({ data: mockPlan });
  });

  describe('ローディング状態', () => {
    it('planIdが未解決の場合、ローディングスピナーを表示する', () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('データ取得中はローディングスピナーを表示する', async () => {
      mockApi.plans.get.mockImplementation(() => new Promise(() => {})); // 永続的に保留

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });
  });

  describe('フォーム表示', () => {
    it('プラン情報がフォームに正しく設定される', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('テストプラン')).toBeInTheDocument();
        expect(screen.getByDisplayValue('テスト用の説明')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('テスト場所')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example2.com')).toBeInTheDocument();
      });
    });

    it('地域のセレクトボックスが正しく設定される', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const regionSelect = screen.getByDisplayValue('東京') as HTMLSelectElement;
        expect(regionSelect.value).toBe('tokyo');
      });
    });

    it('場所が設定されていない場合も正しく表示される', async () => {
      const planWithoutLocations = { ...mockPlan, locations: [] };
      mockApi.plans.get.mockResolvedValue({ data: planWithoutLocations });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('マイプランの編集')).toBeInTheDocument();
      });
    });

    it('日付が設定されていない場合も正しく表示される', async () => {
      const planWithoutDate = { ...mockPlan, date: null };
      mockApi.plans.get.mockResolvedValue({ data: planWithoutDate });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('日付') as HTMLInputElement;
        expect(dateInput.value).toBe('');
      });
    });
  });

  describe('フォーム操作', () => {
    it('タイトルを変更できる', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: '新しいタイトル' } });
        expect(titleInput.value).toBe('新しいタイトル');
      });
    });

    it('説明を変更できる', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const descriptionInput = screen.getByLabelText('説明') as HTMLTextAreaElement;
        fireEvent.change(descriptionInput, { target: { value: '新しい説明' } });
        expect(descriptionInput.value).toBe('新しい説明');
      });
    });

    it('予算を変更できる', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const budgetInput = screen.getByLabelText('予算') as HTMLInputElement;
        fireEvent.change(budgetInput, { target: { value: '20000' } });
        expect(budgetInput.value).toBe('20000');
      });
    });

    it('地域を変更できる', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const regionSelect = screen.getByLabelText('地域') as HTMLSelectElement;
        fireEvent.change(regionSelect, { target: { value: 'osaka' } });
        expect(regionSelect.value).toBe('osaka');
      });
    });
  });

  describe('場所管理', () => {
    it('URLを追加ボタンで新しい場所を追加できる', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const addButton = screen.getByText('URLを追加');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const urlInputs = screen.getAllByPlaceholderText('URL');
        expect(urlInputs.length).toBe(3); // 元の2つ + 新しく追加した1つ
      });
    });

    it('場所のURLを変更できる', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const urlInputs = screen.getAllByPlaceholderText('URL');
        fireEvent.change(urlInputs[0], { target: { value: 'https://newurl.com' } });
        expect((urlInputs[0] as HTMLInputElement).value).toBe('https://newurl.com');
      });
    });

    it('場所の名前を変更できる', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const nameInputs = screen.getAllByPlaceholderText('名前（任意）');
        fireEvent.change(nameInputs[0], { target: { value: '新しい場所名' } });
        expect((nameInputs[0] as HTMLInputElement).value).toBe('新しい場所名');
      });
    });

    it('削除ボタンで場所を削除できる', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('削除');
        const initialCount = screen.getAllByPlaceholderText('URL').length;

        fireEvent.click(deleteButtons[0]);

        const afterDeleteCount = screen.getAllByPlaceholderText('URL').length;
        expect(afterDeleteCount).toBe(initialCount - 1);
      });
    });
  });

  describe('フォーム送信', () => {
    it('正常にプランを更新できる', async () => {
      mockApi.plans.update.mockResolvedValue({ data: mockPlan });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockApi.plans.update).toHaveBeenCalledWith(
          process.env.TEST_ACCESS_TOKEN || TEST_ACCESS_TOKEN,
          'plan-123',
          {
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
          }
        );
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });

    it('フォーム送信中は保存ボタンが無効になる', async () => {
      mockApi.plans.update.mockImplementation(() => new Promise(() => {})); // 永続的に保留

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('保存中...')).toBeInTheDocument();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });

    it('更新に失敗した場合エラーメッセージを表示する', async () => {
      mockApi.plans.update.mockResolvedValue({ error: '更新に失敗しました' });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('プランの更新に失敗しました')).toBeInTheDocument();
      });
    });

    it('キャンセルボタンで前のページに戻る', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const cancelButton = screen.getByText('キャンセル');
        fireEvent.click(cancelButton);
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('プラン取得に失敗した場合、プラン一覧にリダイレクトする', async () => {
      mockApi.plans.get.mockResolvedValue({ error: 'プランが見つかりません' });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/plans');
      });
    });

    it('セッションがない場合、ローディングを停止する', async () => {
      mockUseAuth.mockReturnValue({ ...mockAuthContext, session: null } as any);

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('プランが見つからない場合、エラーメッセージを表示する', async () => {
      mockApi.plans.get.mockResolvedValue({ data: null });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        expect(screen.getByText('マイプランが見つかりません')).toBeInTheDocument();
        expect(screen.getByText('マイプラン一覧に戻る')).toBeInTheDocument();
      });
    });

    it('プランが見つからない場合のボタンクリックでプラン一覧に遷移する', async () => {
      mockApi.plans.get.mockResolvedValue({ data: null });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const backButton = screen.getByText('マイプラン一覧に戻る');
        fireEvent.click(backButton);
        expect(mockRouter.push).toHaveBeenCalledWith('/plans');
      });
    });

    it('params解決に失敗した場合、プラン一覧にリダイレクトする', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<EditPlanPage params={Promise.reject(new Error('Failed to resolve params'))} />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/plans');
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('フォームバリデーション', () => {
    it('必須フィールドのタイトルが空の場合、送信できない', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: '' } });

        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);

        // HTML5バリデーションにより送信がブロックされる
        expect(mockApi.plans.update).not.toHaveBeenCalled();
      });
    });

    it('予算フィールドが負の値の場合、送信できない', async () => {
      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const budgetInput = screen.getByLabelText('予算') as HTMLInputElement;
        fireEvent.change(budgetInput, { target: { value: '-1000' } });

        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);

        // HTML5バリデーションにより送信がブロックされる
        expect(mockApi.plans.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('日付処理', () => {
    it('日付がnullの場合、適切に処理される', async () => {
      mockApi.plans.update.mockResolvedValue({ data: mockPlan });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('日付') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '' } });

        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockApi.plans.update).toHaveBeenCalledWith(
          process.env.TEST_ACCESS_TOKEN || TEST_ACCESS_TOKEN,
          'plan-123',
          expect.objectContaining({
            date: null,
          })
        );
      });
    });

    it('新しい日付を設定できる', async () => {
      mockApi.plans.update.mockResolvedValue({ data: mockPlan });

      render(<EditPlanPage params={Promise.resolve({ id: 'plan-123' })} />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('日付') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2025-01-15' } });

        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockApi.plans.update).toHaveBeenCalledWith(
          process.env.TEST_ACCESS_TOKEN || TEST_ACCESS_TOKEN,
          'plan-123',
          expect.objectContaining({
            date: '2025-01-15T00:00:00.000Z',
          })
        );
      });
    });
  });
});
