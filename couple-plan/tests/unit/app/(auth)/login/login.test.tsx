import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-auth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('LoginPage コンポーネント', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ログインフォームが正しくレンダリングされること', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });

  it('ログイン成功時に /plans へリダイレクトされること', async () => {
    // サインイン処理でエラーがない場合のモック設定
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: null });
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans');
    });
  });

  it('ログイン失敗時にエラーメッセージが表示されること', async () => {
    global.alert = jest.fn();
    // サインイン処理でエラーが返るモック設定
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: new Error('Login error') });
    
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'fail@example.com',
        password: 'wrongpassword',
      });
    });
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('ログインに失敗しました');
    });
  });
});
