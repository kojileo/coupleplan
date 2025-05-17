import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Home コンポーネントのインテグレーションテスト', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('認証状態に応じて適切なコンテンツが表示され、リダイレクトが行われること', async () => {
    // 初期状態（未認証）
    (useAuth as jest.Mock).mockReturnValue({ session: null, isLoading: false });
    const { rerender } = render(<Home />);

    // 未認証時のコンテンツ確認
    expect(screen.getByText('Couple Plan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /新規登録/i })).toBeInTheDocument();

    // ローディング状態
    (useAuth as jest.Mock).mockReturnValue({ session: null, isLoading: true });
    rerender(<Home />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();

    // 認証済み状態
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: '123' } },
      isLoading: false,
    });
    rerender(<Home />);

    // リダイレクトの確認
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/plans');
    });
  });

  it('認証状態の変更がスムーズに行われること', async () => {
    // 初期状態（未認証）
    (useAuth as jest.Mock).mockReturnValue({ session: null, isLoading: false });
    const { rerender } = render(<Home />);

    // 未認証時のコンテンツ確認
    expect(screen.getByText('Couple Plan')).toBeInTheDocument();

    // 認証状態に変更
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: '123' } },
      isLoading: false,
    });
    rerender(<Home />);

    // リダイレクトの確認
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/plans');
    });

    // 再度未認証状態に戻す
    (useAuth as jest.Mock).mockReturnValue({ session: null, isLoading: false });
    rerender(<Home />);

    // 未認証時のコンテンツが再表示されることを確認
    expect(screen.getByText('Couple Plan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });

  it('ローディング状態から認証状態への遷移が正しく行われること', async () => {
    // ローディング状態
    (useAuth as jest.Mock).mockReturnValue({ session: null, isLoading: true });
    const { rerender } = render(<Home />);

    // ローディング表示の確認
    expect(screen.getByRole('status')).toBeInTheDocument();

    // 認証済み状態に変更
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: '123' } },
      isLoading: false,
    });
    rerender(<Home />);

    // リダイレクトの確認
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/plans');
    });
  });
});
