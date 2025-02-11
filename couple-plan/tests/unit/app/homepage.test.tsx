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
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: true });
    const { container } = render(<Home />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('認証されていない場合、ホームコンテンツが表示されること', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: false });
    render(<Home />);
    expect(screen.getByText('Couple Plan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /新規登録/i })).toBeInTheDocument();
  });

  it('認証されている場合、/plansにリダイレクトされること', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: '123' }, isLoading: false });
    render(<Home />);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/plans');
    });
  });
});