import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import NewPlanPage from '@/app/(dashboard)/plans/new/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      create: jest.fn(),
    },
  },
}));

describe('NewPlanPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockSession = {
    access_token: 'mock-access-token-123',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    jest.clearAllMocks();
  });

  it('フォームの初期表示が正しい', () => {
    render(<NewPlanPage />);

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('日付')).toBeInTheDocument();
    expect(screen.getByLabelText('予算')).toBeInTheDocument();
    expect(screen.getByLabelText('場所URL')).toBeInTheDocument();
    expect(screen.getByLabelText('地域')).toBeInTheDocument();
    expect(screen.getByLabelText('公開する')).toBeInTheDocument();
  });

  it('ローディング中はスピナーが表示される', async () => {
    let resolveApi: (value: any) => void;
    (api.plans.create as jest.Mock).mockImplementation(async () => {
      return new Promise((resolve) => {
        resolveApi = resolve;
        setTimeout(() => resolve({ data: { id: '1' } }), 200);
      });
    });

    render(<NewPlanPage />);
    const submitButton = screen.getByRole('button', { name: '作成' });
    const titleInput = screen.getByLabelText('タイトル');
    const budgetInput = screen.getByLabelText('予算');
    const locationInput = screen.getByLabelText('場所URL');

    // フォームに有効なデータを入力
    await userEvent.type(titleInput, 'テストプラン');
    await userEvent.type(budgetInput, '1000');
    await userEvent.type(locationInput, 'https://example.com');

    // フォーム送信
    await userEvent.click(submitButton);

    // ローディング状態の確認
    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('作成中...')).toBeInTheDocument();

    // API処理完了を待つ
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/plans');
    });
  });

  it('エラーが発生した場合はエラーメッセージが表示される', async () => {
    const errorMessage = 'プランの作成に失敗しました';
    (api.plans.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<NewPlanPage />);
    const submitButton = screen.getByRole('button', { name: '作成' });
    const titleInput = screen.getByLabelText('タイトル');
    const budgetInput = screen.getByLabelText('予算');
    const locationInput = screen.getByLabelText('場所URL');

    // フォームに有効なデータを入力
    await userEvent.type(titleInput, 'テストプラン');
    await userEvent.type(budgetInput, '1000');
    await userEvent.type(locationInput, 'https://example.com');

    // フォーム送信
    await userEvent.click(submitButton);

    // エラーメッセージの確認
    expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('APIからエラーレスポンスが返された場合はエラーメッセージが表示される', async () => {
    const errorMessage = 'タイトルは必須です';
    (api.plans.create as jest.Mock).mockResolvedValue({ error: errorMessage });

    render(<NewPlanPage />);
    const submitButton = screen.getByRole('button', { name: '作成' });
    const titleInput = screen.getByLabelText('タイトル');
    const budgetInput = screen.getByLabelText('予算');
    const locationInput = screen.getByLabelText('場所URL');

    // フォームに有効なデータを入力
    await userEvent.type(titleInput, 'テストプラン');
    await userEvent.type(budgetInput, '1000');
    await userEvent.type(locationInput, 'https://example.com');

    // フォーム送信
    await userEvent.click(submitButton);

    // APIエラーメッセージの確認
    expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('プラン作成が成功した場合はプラン一覧ページに遷移する', async () => {
    (api.plans.create as jest.Mock).mockResolvedValue({
      data: { id: '1', title: 'テストプラン' },
    });

    render(<NewPlanPage />);
    const submitButton = screen.getByRole('button', { name: '作成' });
    const titleInput = screen.getByLabelText('タイトル');
    const budgetInput = screen.getByLabelText('予算');
    const locationInput = screen.getByLabelText('場所URL');

    // フォームに有効なデータを入力
    await userEvent.type(titleInput, 'テストプラン');
    await userEvent.type(budgetInput, '1000');
    await userEvent.type(locationInput, 'https://example.com');

    // フォーム送信
    await userEvent.click(submitButton);

    // ナビゲーションの確認
    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith('/plans');
      },
      { timeout: 3000 }
    );
  });

  it('キャンセルボタンをクリックすると前のページに戻る', async () => {
    render(<NewPlanPage />);
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    await userEvent.click(cancelButton);
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
