import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditPlanPage from '@/app/(dashboard)/plans/[id]/edit/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      get: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('EditPlanPage コンポーネント', () => {
  const push = jest.fn();
  const back = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push, back });
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: 'token123' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ロード中はスピナーが表示される', () => {
    (api.plans.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('プランが存在しない場合、"マイプランが見つかりません" と戻るボタンが表示され、ボタン押下で /plans に遷移する', async () => {
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: null });
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('マイプランが見つかりません')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /マイプラン一覧に戻る/i }));
    expect(push).toHaveBeenCalledWith('/plans');
  });

  it('正常な更新時に /plans/{id} へリダイレクトされる', async () => {
    const mockPlan = {
      id: '123',
      title: 'Old Title',
      description: 'Old description',
      date: '2023-10-10',
      budget: 1000,
      location: 'https://old.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    (api.plans.update as jest.Mock).mockResolvedValueOnce({});
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    // データ読込完了を待つ
    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    });

    // タイトルの変更と送信
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'New Title' } });
    fireEvent.click(screen.getByRole('button', { name: /保存/i }));

    await waitFor(() => {
      expect(api.plans.update).toHaveBeenCalledWith('token123', '123', expect.objectContaining({
        title: 'New Title'
      }));
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans/123');
    });
  });

  it('更新失敗時にアラートが表示される', async () => {
    const mockPlan = {
      id: '123',
      title: 'Old Title',
      description: 'Old description',
      date: '2023-10-10',
      budget: 1000,
      location: 'https://old.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    (api.plans.update as jest.Mock).mockResolvedValueOnce({ error: 'Update error' });
    window.alert = jest.fn();
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'New Title' } });
    fireEvent.click(screen.getByRole('button', { name: /保存/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('プランの更新に失敗しました');
    });
    expect(push).not.toHaveBeenCalled();
  });
});