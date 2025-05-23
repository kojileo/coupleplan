import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ResetPasswordPage from '@/app/(auth)/reset-password/page';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-auth';
import { TEST_AUTH, TEST_USER } from '@tests/utils/test-constants';

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
    // console.error をモック化して、テスト中のエラーログを抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('有効なセッションの場合、パスワードリセットフォームが表示されること', async () => {
    // 有効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: TEST_USER.ID } } },
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

  it('セッションはないがハッシュに type=recovery が含まれる場合、パスワードリセットフォームが表示されること', async () => {
    // セッションなしをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    
    // ハッシュに type=recovery を設定
    window.location.hash = `#type=recovery&access_token=${TEST_AUTH.ACCESS_TOKEN}`;

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
  });

  it('セッション取得時にエラーが発生した場合、エラーメッセージが表示されること', async () => {
    // セッション取得エラーをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: new Error('セッション取得エラー'),
    });

    render(<ResetPasswordPage />);

    // エラーメッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('セッションの確認中にエラーが発生しました。再度リセットメールを送信してください。')).toBeInTheDocument();
    });

    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();
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

  it('無効なパスワードリセットリンクエラーの場合、パスワードリセットページへのリンクが表示されること', async () => {
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

    // パスワードリセットページへのリンクが表示されることを確認
    const resetLink = screen.getByText('パスワードリセットページへ');
    expect(resetLink).toBeInTheDocument();
    expect(resetLink).toHaveAttribute('href', '/forgot-password');
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
      data: { session: { user: { id: TEST_USER.ID } } },
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
      data: { session: { user: { id: TEST_USER.ID } } },
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
      data: { session: { user: { id: TEST_USER.ID } } },
      error: null,
    });

      // パスワード更新成功をモック
      (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: TEST_USER.ID } },
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
    
    fireEvent.change(passwordInput, { target: { value: TEST_USER.PASSWORD } });
    fireEvent.change(confirmPasswordInput, { target: { value: TEST_USER.PASSWORD } });
    
    // フォーム送信
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/i }));

    // 成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワードが正常に更新されました。ログインページに移動します...')).toBeInTheDocument();
    });

    // APIが正しく呼び出されたことを確認
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: TEST_USER.PASSWORD,
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
      data: { session: { user: { id: TEST_USER.ID } } },
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
    
    fireEvent.change(passwordInput, { target: { value: TEST_USER.PASSWORD } });
    fireEvent.change(confirmPasswordInput, { target: { value: TEST_USER.PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/i }));

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワード更新に失敗しました')).toBeInTheDocument();
    });
  });

  it('Errorインスタンスでないエラーの場合、デフォルトエラーメッセージが表示されること', async () => {
    // 有効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: TEST_USER.ID } } },
      error: null,
    });

    // Errorインスタンスでないエラーをモック
    (supabase.auth.updateUser as jest.Mock).mockImplementationOnce(() => {
      throw 'エラーオブジェクトではない文字列';
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
    
    fireEvent.change(passwordInput, { target: { value: TEST_USER.PASSWORD } });
    fireEvent.change(confirmPasswordInput, { target: { value: TEST_USER.PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/i }));

    // デフォルトのエラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワードの更新に失敗しました')).toBeInTheDocument();
    });

    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();
  });

  it('ローディング中はボタンが無効化され、テキストが「更新中...」に変わる', async () => {
    // 有効なセッションをモック
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: TEST_USER.ID } } },
      error: null,
    });

    // 更新処理が完了しない Promise を返す
    (supabase.auth.updateUser as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

    const { container } = render(<ResetPasswordPage />);

    // isValidSessionがtrueになるまで待機
    await waitFor(() => {
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    // 有効なパスワードを入力
    const passwordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');
    
    fireEvent.change(passwordInput, { target: { value: TEST_USER.PASSWORD } });
    fireEvent.change(confirmPasswordInput, { target: { value: TEST_USER.PASSWORD } });
    
    // フォーム送信
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/i }));

    // ボタンが無効化され、テキストが変わることを確認
    const updateButton = screen.getByRole('button', { name: /更新中/i });
    expect(updateButton).toBeDisabled();
    expect(updateButton).toHaveTextContent('更新中...');
  });
}); 