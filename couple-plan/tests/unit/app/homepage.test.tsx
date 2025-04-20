import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Home コンポーネント', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('isLoadingがtrueの場合、ローディング表示がされること', () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null, isLoading: true });
    const { container } = render(<Home />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('認証されていない場合、ホームコンテンツが表示されること', () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null, isLoading: false });
    render(<Home />);

    // メインタイトルの確認
    expect(screen.getByText('Couple Plan')).toBeInTheDocument();
    expect(
      screen.getByText('カップルのためのデートプラン作成・共有・公開アプリ')
    ).toBeInTheDocument();

    // 説明文の確認
    expect(
      screen.getByText(/行きたい場所を保存して、カップルで予定を共有・公開しよう！！/)
    ).toBeInTheDocument();

    // 機能説明カードの確認
    expect(screen.getByText('カップルでデートプランを管理')).toBeInTheDocument();
    expect(screen.getByText('行きたい場所管理')).toBeInTheDocument();
    expect(screen.getByText('公開されているデートプランを参考')).toBeInTheDocument();

    // ボタンの確認
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /新規登録/i })).toBeInTheDocument();

    // 公開プランへのリンク確認
    expect(screen.getByText('公開されているデートプランを見る →')).toBeInTheDocument();
  });

  it('認証されている場合、/plansにリダイレクトされること', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: '123' } },
      isLoading: false,
    });
    render(<Home />);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/plans');
    });
  });

  it('認証状態が変更された場合、適切にリダイレクトされること', async () => {
    const { rerender } = render(<Home />);

    // 未認証状態
    (useAuth as jest.Mock).mockReturnValue({ session: null, isLoading: false });
    rerender(<Home />);
    expect(screen.getByText('Couple Plan')).toBeInTheDocument();

    // 認証状態に変更
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: '123' } },
      isLoading: false,
    });
    rerender(<Home />);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/plans');
    });
  });
});
