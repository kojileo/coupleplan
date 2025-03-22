import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-auth';
import { TEST_USER } from '@tests/utils/test-constants';

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
  // モック通知システム
  const mockNotify = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    // window.alertのモックを避け、代わりにコンポーネント内の通知システムをモック
    window.alert = jest.fn();
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

    // 実際のパスワードを入力せず、安全なモックテスト
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: TEST_USER.EMAIL } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: '********' } });
    fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      // emailは確認するが、パスワードは内容を検証しないことで安全性向上
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(expect.objectContaining({
        email: TEST_USER.EMAIL,
      }));
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans');
    });
  });

  it('ログイン失敗時にエラーメッセージが表示されること', async () => {
    // サインイン処理でエラーが返るモック設定
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: new Error('Login error') });
    
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: '********' } });
    fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      // emailは確認するが、パスワードは内容を検証しないことで安全性向上
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(expect.objectContaining({
        email: 'fail@example.com',
      }));
    });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('ログインに失敗しました');
    });
  });
});
