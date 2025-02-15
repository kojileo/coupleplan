import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewPlanPage from '@/app/(dashboard)/plans/new/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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

describe('NewPlanPage コンポーネント', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn() });
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: 'token123' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('フォームの入力と送信で新規プランを作成し、/plans へリダイレクトする', async () => {
    // 成功時：エラーがなく空のレスポンスを返す
    (api.plans.create as jest.Mock).mockResolvedValueOnce({});
    render(<NewPlanPage />);
    
    // 入力フォームへの値入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'Plan description' } });
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2023-10-12' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('場所URL'), { target: { value: 'https://example.com' } });
    
    // 送信
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));

    await waitFor(() => {
      expect(api.plans.create).toHaveBeenCalledWith('token123', expect.objectContaining({
        title: 'Test Plan',
        description: 'Plan description',
        budget: 1000,
        location: 'https://example.com',
        // date は Date 型に変換されるので any Date で検証
        date: expect.any(Date),
        isPublic: false,
      }));
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans');
    });
  });

  it('作成失敗時にエラーメッセージが表示される', async () => {
    // 失敗時：error プロパティが返る
    (api.plans.create as jest.Mock).mockResolvedValueOnce({ error: 'Error message' });
    window.alert = jest.fn();
    render(<NewPlanPage />);

    // 同じように入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'Plan description' } });
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2023-10-12' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('場所URL'), { target: { value: 'https://example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('プランの作成に失敗しました');
    });
    expect(push).not.toHaveBeenCalled();
  });
});