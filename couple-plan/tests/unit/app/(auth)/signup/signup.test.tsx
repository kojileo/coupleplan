import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpPage from '@/app/(auth)/signup/page';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TEST_USER } from '@tests/utils/test-constants';

// next/navigation の useRouter をモック化
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// サインアップ処理をエミュレートするためのモックを作成
jest.mock('@/lib/api', () => ({
  api: {
    auth: {
      signup: jest.fn(),
    },
  },
}));

describe('SignUpPage コンポーネント', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('サインアップフォームが正しくレンダリングされること', () => {
    render(<SignUpPage />);
    expect(screen.getByPlaceholderText('お名前')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /アカウント作成/i })).toBeInTheDocument();
  });

  it('サインアップ成功時に、メール確認待ちページへリダイレクトされること', async () => {
    // 成功時は error プロパティを含まないレスポンスを返す
    (api.auth.signup as jest.Mock).mockResolvedValueOnce({});
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('お名前'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: TEST_USER.EMAIL } });
    // 実際のパスワードを使わない
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: '********' } });
    fireEvent.click(screen.getByRole('button', { name: /アカウント作成/i }));

    await waitFor(() => {
      // api.auth.signupが呼ばれたことを検証するが、細かい内容は検証しない
      expect(api.auth.signup).toHaveBeenCalled();
      // emailとnameは検証するが、パスワードは検証しない
      expect(api.auth.signup).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        email: TEST_USER.EMAIL,
      }));
    });
    
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(`/verify-email?email=${encodeURIComponent(TEST_USER.EMAIL)}`);
    });
  });

  it('サインアップ失敗時にエラーメッセージが表示されること', async () => {
    (api.auth.signup as jest.Mock).mockResolvedValueOnce({ error: new Error('Signup error') });
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('お名前'), { target: { value: 'Fail User' } });
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: '********' } });
    fireEvent.click(screen.getByRole('button', { name: /アカウント作成/i }));

    await waitFor(() => {
      expect(api.auth.signup).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('サインアップに失敗しました')).toBeInTheDocument();
    });
  });
});