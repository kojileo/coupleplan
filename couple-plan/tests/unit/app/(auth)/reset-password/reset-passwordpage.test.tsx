import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ResetPasswordPage from '@/app/(auth)/reset-password/page';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-auth';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

// window.location.hashをモック化
const originalLocation = window.location;
beforeAll(() => {
  // @ts-ignore
  delete window.location;
  window.location = { ...originalLocation, hash: '' };
});

afterAll(() => {
  window.location = originalLocation;
});

describe('ResetPasswordPage コンポーネント', () => {
  const pushMock = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    window.location.hash = '#type=recovery';
    jest.clearAllMocks();
  });

  it('有効なセッションの場合、パスワードリセットフォームが表示されること', async () => {
    // 有効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

    const { container } = render(<ResetPasswordPage />);

    // isValidSessionがtrueになるまで待機
    await waitFor(() => {
      expect(screen.getByText('新しいパスワードを設定')).toBeInTheDocument();
      // メッセージが表示されることを確認
      expect(screen.getByText('新しいパスワードを設定してください')).toBeInTheDocument();
    });

    // フォームが表示されていることを確認
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();

    // 入力フィールドとボタンの確認
    const passwordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /パスワードを更新/i })).toBeInTheDocument();
  });

  it('無効なセッションの場合、エラーメッセージが表示されること', async () => {
    // 無効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    window.location.hash = ''; // 無効なハッシュ

    render(<ResetPasswordPage />);

    // エラーメッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('無効なパスワードリセットリンクです。再度リセットメールを送信してください。')).toBeInTheDocument();
    });

    // リンクの確認
    expect(screen.getByText('パスワードリセットをやり直す')).toBeInTheDocument();
  });

  it('セッション確認でエラーが発生した場合、エラーメッセージが表示されること', async () => {
    // セッション確認エラーをモック
    (supabase.auth.getSession as jest.Mock).mockRejectedValueOnce(new Error('セッションエラー'));

    render(<ResetPasswordPage />);

    // エラーメッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('セッションの確認中にエラーが発生しました。再度リセットメールを送信してください。')).toBeInTheDocument();
    });
  });

  it('パスワードが一致しない場合、エラーメッセージが表示されること', async () => {
    // 有効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

    const { container } = render(<ResetPasswordPage />);

    // isValidSessionがtrueになるまで待機
    await waitFor(() => {
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    // 異なるパスワードを入力
    const passwordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/i }));

    // エラーメッセージが表示されることを確認
    expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
  });

  it('パスワードが短すぎる場合、エラーメッセージが表示されること', async () => {
    // 有効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

    const { container } = render(<ResetPasswordPage />);

    // isValidSessionがtrueになるまで待機
    await waitFor(() => {
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    // 短いパスワードを入力
    const passwordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');
    
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/i }));

    // エラーメッセージが表示されることを確認
    expect(screen.getByText('パスワードは8文字以上で設定してください')).toBeInTheDocument();
  });

  it('パスワード更新成功時に成功メッセージが表示され、ログインページにリダイレクトされること', async () => {
    // setTimeoutをモック化
    jest.useFakeTimers();
    
    // 有効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

      // パスワード更新成功をモック
      (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null,
      });

      const { container } = render(<ResetPasswordPage />);

    // isValidSessionがtrueになるまで待機
    await waitFor(() => {
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    // 有効なパスワードを入力
    const passwordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');
    
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    // フォーム送信
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/i }));

    // 成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワードが正常に更新されました。ログインページに移動します...')).toBeInTheDocument();
    });

    // APIが正しく呼び出されたことを確認
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'newpassword123',
    });

    // タイマーを進める
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // ログインページにリダイレクトされたことを確認
    expect(pushMock).toHaveBeenCalledWith('/login');
    
    // タイマーをリセット
    jest.useRealTimers();
  });

  it('パスワード更新失敗時にエラーメッセージが表示されること', async () => {
    // 有効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

    // パスワード更新失敗をモック
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: new Error('パスワード更新に失敗しました'),
    });

    const { container } = render(<ResetPasswordPage />);

    // isValidSessionがtrueになるまで待機
    await waitFor(() => {
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    // 有効なパスワードを入力
    const passwordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');
    
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/i }));

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワード更新に失敗しました')).toBeInTheDocument();
    });
  });
}); 