import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import { supabase } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';
import { TEST_USER } from '@tests/utils/test-constants';

// モック
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ログインページ統合テスト', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });
    
    // window.alert のモック
    window.alert = jest.fn();
    
    // console.error のモック
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ログインフォームが正しく表示される', () => {
    render(<LoginPage />);
    
    // ヘッダーが表示されることを確認
    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    
    // 各フォーム要素が表示されることを確認
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument();
    
    // ボタンが表示されることを確認
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    
    // パスワードリセットリンクが表示されることを確認
    expect(screen.getByText('パスワードをお忘れですか？')).toBeInTheDocument();
  });

  it('フォームに入力できる', () => {
    render(<LoginPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: TEST_USER.EMAIL } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: TEST_USER.PASSWORD } });
    
    // 入力値が反映されていることを確認
    expect(screen.getByPlaceholderText('メールアドレス')).toHaveValue(TEST_USER.EMAIL);
    expect(screen.getByPlaceholderText('パスワード')).toHaveValue(TEST_USER.PASSWORD);
  });

  it('フォーム送信時にSupabaseが呼ばれる', async () => {
    render(<LoginPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: TEST_USER.EMAIL } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: TEST_USER.PASSWORD } });
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    
    // Supabaseが呼ばれることを確認
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: TEST_USER.EMAIL,
        password: TEST_USER.PASSWORD,
      });
    });
    
    // 成功時にプラン一覧ページに遷移することを確認
    expect(mockRouter.push).toHaveBeenCalledWith('/plans');
  });

  it('必須フィールドが空の場合はフォーム送信できない', () => {
    render(<LoginPage />);
    
    // メールアドレスを空にする
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: '' } });
    
    // パスワードを入力
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: TEST_USER.PASSWORD } });
    
    // フォームを送信
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);
    
    // Supabaseが呼ばれないことを確認
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('送信中はログインボタンが無効化される', async () => {
    // Supabaseレスポンスを遅延させる
    (supabase.auth.signInWithPassword as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );
    
    render(<LoginPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: TEST_USER.EMAIL } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: TEST_USER.PASSWORD } });
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    
    // ボタンのテキストが変わることを確認
    expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    
    // ボタンが無効化されていることを確認
    expect(screen.getByText('ログイン中...')).toBeDisabled();
    
    // Supabaseレスポンス後にページ遷移することを確認
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/plans');
    });
  });

  it('Supabaseがエラーを返した場合はエラーメッセージが表示される', async () => {
    // Supabaseエラーをモック
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });
    
    render(<LoginPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: TEST_USER.EMAIL } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: TEST_USER.PASSWORD } });
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('ログインに失敗しました');
    });
    
    // コンソールエラーが出力されることを確認
    expect(console.error).toHaveBeenCalledWith('ログインエラー:', expect.any(Object));
    
    // ページ遷移が発生しないことを確認
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('パスワードリセットリンクをクリックするとパスワードリセットページに遷移する', () => {
    render(<LoginPage />);
    
    // パスワードリセットリンクを取得
    const resetLink = screen.getByText('パスワードをお忘れですか？');
    
    // リンクのhref属性を確認
    expect(resetLink).toHaveAttribute('href', '/forgot-password');
  });
}); 