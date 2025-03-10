import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import fetchMock from 'jest-fetch-mock';

// fetchのモック化
global.fetch = fetchMock as any;

describe('ForgotPasswordPage コンポーネント', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    // console.error をモック化して、テスト中のエラーログを抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('パスワードリセットフォームが正しくレンダリングされること', () => {
    render(<ForgotPasswordPage />);
    
    // 見出しとテキストの確認
    expect(screen.getByText('パスワードをリセット')).toBeInTheDocument();
    expect(screen.getByText('登録したメールアドレスを入力してください')).toBeInTheDocument();
    
    // 入力フィールドとボタンの確認
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /リセットメールを送信/i })).toBeInTheDocument();
    
    // リンクの確認
    expect(screen.getByText('ログインに戻る')).toBeInTheDocument();
  });

  it('メールアドレスを入力できること', () => {
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('メールアドレス');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('パスワードリセット成功時に成功メッセージが表示されること', async () => {
    // APIレスポンスのモック
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'パスワードリセットメールを送信しました' }));
    
    render(<ForgotPasswordPage />);
    
    // フォームに入力して送信
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /リセットメールを送信/i }));
    
    // ボタンのテキストが「送信中...」に変わることを確認
    expect(screen.getByRole('button', { name: /送信中/i })).toBeInTheDocument();
    
    // 成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワードリセットメールを送信しました')).toBeInTheDocument();
    });
    
    // ローディング状態が解除されることを確認
    expect(screen.getByRole('button', { name: /リセットメールを送信/i })).toBeInTheDocument();
    
    // APIが正しく呼び出されたことを確認
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
  });

  it('レスポンスにメッセージがない場合、デフォルトメッセージが表示されること', async () => {
    // メッセージフィールドがないAPIレスポンスのモック
    fetchMock.mockResponseOnce(JSON.stringify({}));
    
    render(<ForgotPasswordPage />);
    
    // フォームに入力して送信
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /リセットメールを送信/i }));
    
    // デフォルトの成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワードリセットメールを送信しました')).toBeInTheDocument();
    });
    
    // ローディング状態が解除されることを確認
    expect(screen.getByRole('button', { name: /リセットメールを送信/i })).toBeInTheDocument();
  });

  it('パスワードリセット失敗時にエラーメッセージが表示されること', async () => {
    // APIエラーレスポンスのモック
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'メールアドレスが見つかりません' }), { status: 404 });
    
    render(<ForgotPasswordPage />);
    
    // フォームに入力して送信
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'unknown@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /リセットメールを送信/i }));
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('メールアドレスが見つかりません')).toBeInTheDocument();
    });
    
    // ローディング状態が解除されることを確認
    expect(screen.getByRole('button', { name: /リセットメールを送信/i })).toBeInTheDocument();
  });

  it('エラーレスポンスにエラーメッセージがない場合、デフォルトエラーメッセージが表示されること', async () => {
    // エラーメッセージフィールドがないAPIエラーレスポンスのモック
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });
    
    render(<ForgotPasswordPage />);
    
    // フォームに入力して送信
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /リセットメールを送信/i }));
    
    // デフォルトのエラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワードリセットに失敗しました')).toBeInTheDocument();
    });
    
    // ローディング状態が解除されることを確認
    expect(screen.getByRole('button', { name: /リセットメールを送信/i })).toBeInTheDocument();
  });

  it('ネットワークエラー時にエラーメッセージが表示されること', async () => {
    // ネットワークエラーのモック
    fetchMock.mockRejectOnce(new Error('ネットワークエラー'));
    
    render(<ForgotPasswordPage />);
    
    // フォームに入力して送信
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /リセットメールを送信/i }));
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('ネットワークエラー')).toBeInTheDocument();
    });
    
    // ローディング状態が解除されることを確認
    expect(screen.getByRole('button', { name: /リセットメールを送信/i })).toBeInTheDocument();
    
    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();
  });

  it('Errorインスタンスでないエラーの場合、デフォルトエラーメッセージが表示されること', async () => {
    // Errorインスタンスでないエラーのモック
    // fetchMockを直接使わず、グローバルfetchをモック化して非Errorオブジェクトをスローする
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementationOnce(() => {
      throw { message: 'これはErrorインスタンスではありません' };
    });
    
    render(<ForgotPasswordPage />);
    
    // フォームに入力して送信
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /リセットメールを送信/i }));
    
    // デフォルトのエラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('パスワードリセットに失敗しました')).toBeInTheDocument();
    });
    
    // ローディング状態が解除されることを確認
    expect(screen.getByRole('button', { name: /リセットメールを送信/i })).toBeInTheDocument();
    
    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();
    
    // グローバルfetchを元に戻す
    global.fetch = originalFetch;
  });
}); 