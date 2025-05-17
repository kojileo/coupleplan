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
    access_token: process.env.TEST_ACCESS_TOKEN,
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
    (api.plans.create as jest.Mock).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { data: { id: '1' } };
    });

    render(<NewPlanPage />);
    const submitButton = screen.getByRole('button', { name: '作成' });
    const titleInput = screen.getByLabelText('タイトル');
    const budgetInput = screen.getByLabelText('予算');
    const locationInput = screen.getByLabelText('場所URL');

    await userEvent.type(titleInput, 'テストプラン');
    await userEvent.type(budgetInput, '1000');
    await userEvent.type(locationInput, 'https://example.com');
    await userEvent.click(submitButton);

    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('作成中...')).toBeInTheDocument();
  });

  it('エラーが発生した場合はエラーメッセージが表示される', async () => {
    const errorMessage = 'プランの作成に失敗しました';
    (api.plans.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<NewPlanPage />);
    const submitButton = screen.getByRole('button', { name: '作成' });
    const titleInput = screen.getByLabelText('タイトル');
    const budgetInput = screen.getByLabelText('予算');
    const locationInput = screen.getByLabelText('場所URL');

    await userEvent.type(titleInput, 'テストプラン');
    await userEvent.type(budgetInput, '1000');
    await userEvent.type(locationInput, 'https://example.com');
    await userEvent.click(submitButton);

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

    await userEvent.type(titleInput, 'テストプラン');
    await userEvent.type(budgetInput, '1000');
    await userEvent.type(locationInput, 'https://example.com');
    await userEvent.click(submitButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('プラン作成が成功した場合はプラン一覧ページに遷移する', async () => {
    (api.plans.create as jest.Mock).mockResolvedValue({ data: { id: '1' } });

    render(<NewPlanPage />);
    const submitButton = screen.getByRole('button', { name: '作成' });
    const titleInput = screen.getByLabelText('タイトル');
    const budgetInput = screen.getByLabelText('予算');
    const locationInput = screen.getByLabelText('場所URL');

    await userEvent.type(titleInput, 'テストプラン');
    await userEvent.type(budgetInput, '1000');
    await userEvent.type(locationInput, 'https://example.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/plans');
    });
  });

  it('キャンセルボタンをクリックすると前のページに戻る', async () => {
    render(<NewPlanPage />);
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    await userEvent.click(cancelButton);
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
