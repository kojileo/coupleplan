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
    // 成功時は error プロパティを含まないレスポンスを返すことで、例外が発生しないようにする
    (api.auth.signup as jest.Mock).mockResolvedValueOnce({});
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('お名前'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: TEST_USER.EMAIL } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: TEST_USER.PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /アカウント作成/i }));

    await waitFor(() => {
      expect(api.auth.signup).toHaveBeenCalledWith({
        name: 'Test User',
        email: TEST_USER.EMAIL,
        password: TEST_USER.PASSWORD,
      });
    });
    // 成功時はメール確認待ち画面へリダイレクトされる
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(`/verify-email?email=${encodeURIComponent(TEST_USER.EMAIL)}`);
    });
  });

  it('サインアップ失敗時にエラーメッセージが表示されること', async () => {
    // 失敗時はエラーを示すオブジェクトを返す
    (api.auth.signup as jest.Mock).mockResolvedValueOnce({ error: new Error('Signup error') });
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('お名前'), { target: { value: 'Fail User' } });
    fireEvent.change(screen.getByPlaceholderText('メールアドレス'), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /アカウント作成/i }));

    await waitFor(() => {
      expect(api.auth.signup).toHaveBeenCalledWith({
        name: 'Fail User',
        email: 'fail@example.com',
        password: 'wrongpassword',
      });
    });

    // ※ サインアップ失敗時は、現状 production コードでは alert ではなくエラー状態をセットしているのみです。
    // そのため、もし UI にエラーメッセージを表示する実装がない場合は、
    // 以下のアサーションは router.push が呼ばれていないことなどに置き換える必要があります。
    await waitFor(() => {
      // 例えば、エラー状態に応じたテキストがレンダリングされる場合
      expect(screen.getByText('サインアップに失敗しました')).toBeInTheDocument();
    });
    // もしくは、push が呼ばれていないことを確認
    // await waitFor(() => {
    //   expect(push).not.toHaveBeenCalled();
    // });
  });
});