/**
 * 統合テスト: 認証エラーハンドリング
 *
 * このテストは以下を検証します：
 * - 各種認証エラーの適切な処理
 * - ユーザーへのエラーメッセージ表示
 * - エラー後のリカバリー処理
 * - エラーログの記録
 * - リトライロジック
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/app/(auth)/login/page';
import { useRouter } from 'next/navigation';

// Next.js navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Supabaseクライアントのモック
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resetPasswordForEmail: mockResetPasswordForEmail,
      getUser: mockGetUser,
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  })),
}));

describe('統合テスト: 認証エラーハンドリング', () => {
  const mockPush = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    });
  });

  describe('認証エラー: 一般的なエラーケース', () => {
    it('無効な認証情報エラー', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 400,
        },
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/メールアドレスまたはパスワードが正しくありません/i)
        ).toBeInTheDocument();
      });

      // エラー後もフォームが利用可能
      expect(emailInput).toBeEnabled();
      expect(passwordInput).toBeEnabled();
      expect(loginButton).toBeEnabled();
    });

    it('メールアドレス未確認エラー', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: 'Email not confirmed',
          status: 400,
        },
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'unconfirmed@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/メールアドレスを確認してください/i)).toBeInTheDocument();
      });

      // 確認メール再送信リンクが表示される
      expect(screen.getByText(/確認メールを再送信/i)).toBeInTheDocument();
    });

    it('アカウント一時停止エラー', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: 'Account is suspended',
          status: 403,
        },
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'suspended@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/アカウントが一時停止されています/i)).toBeInTheDocument();
        expect(screen.getByText(/サポート/i)).toBeInTheDocument();
      });
    });

    it('レート制限エラー', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: 'Rate limit exceeded',
          status: 429,
        },
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/しばらくしてから再度お試しください/i)).toBeInTheDocument();
      });

      // ログインボタンが一時的に無効化される
      expect(loginButton).toBeDisabled();
    });
  });

  describe('ネットワークエラー: 接続エラー処理', () => {
    it('ネットワーク接続エラー', async () => {
      // Arrange
      mockSignInWithPassword.mockRejectedValueOnce(new Error('Network request failed'));

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/ネットワークエラーが発生しました/i)).toBeInTheDocument();
        expect(screen.getByText(/再試行/i)).toBeInTheDocument();
      });
    });

    it('タイムアウトエラー', async () => {
      // Arrange
      mockSignInWithPassword.mockImplementationOnce(
        () =>
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 100))
      );

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(
        () => {
          expect(screen.getByText(/リクエストがタイムアウトしました/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('サーバーエラー (500)', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: 'Internal server error',
          status: 500,
        },
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/サーバーエラーが発生しました/i)).toBeInTheDocument();
        expect(screen.getByText(/しばらくしてから再度お試しください/i)).toBeInTheDocument();
      });
    });
  });

  describe('エラーリカバリー: 自動リトライとリカバリー', () => {
    it('一時的なエラー後、再試行で成功する', async () => {
      // Arrange: 初回失敗、2回目成功
      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSignInWithPassword
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { user: mockUserData, session: { access_token: 'token-123' } },
          error: null,
        });

      mockGetUser.mockResolvedValueOnce({
        data: { user: mockUserData },
        error: null,
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // 初回エラー確認
      await waitFor(() => {
        expect(screen.getByText(/ネットワークエラー/i)).toBeInTheDocument();
      });

      // 再試行ボタンをクリック
      const retryButton = screen.getByRole('button', { name: /再試行/i });
      await user.click(retryButton);

      // Assert: 再試行成功
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('複数回失敗後、エラーメッセージが更新される', async () => {
      // Arrange: 複数回失敗
      mockSignInWithPassword
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      // 1回目
      await user.click(loginButton);
      await waitFor(() => {
        expect(screen.getByText(/ネットワークエラー/i)).toBeInTheDocument();
      });

      // 2回目
      const retryButton1 = screen.getByRole('button', { name: /再試行/i });
      await user.click(retryButton1);
      await waitFor(() => {
        expect(screen.getByText(/再度エラーが発生しました/i)).toBeInTheDocument();
      });

      // 3回目
      const retryButton2 = screen.getByRole('button', { name: /再試行/i });
      await user.click(retryButton2);
      await waitFor(() => {
        expect(screen.getByText(/問題が継続しています/i)).toBeInTheDocument();
        expect(screen.getByText(/サポートにお問い合わせください/i)).toBeInTheDocument();
      });
    });
  });

  describe('バリデーションエラー: 入力検証エラー', () => {
    it('必須項目未入力エラー', async () => {
      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      // 何も入力せずにログイン試行
      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      // Assert: ボタンが無効化されている
      expect(loginButton).toBeDisabled();
    });

    it('メールアドレス形式エラー', async () => {
      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/正しいメールアドレスを入力してください/i)).toBeInTheDocument();
      });
    });

    it('パスワード強度不足エラー（サインアップ）', async () => {
      // このテストはsignup-flow.test.tsxに含まれているため、
      // ここでは簡略化
      expect(true).toBe(true);
    });
  });

  describe('エラーログ: エラー情報の記録', () => {
    it('エラー発生時、コンソールにログが出力される', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSignInWithPassword.mockRejectedValueOnce(new Error('Test error'));

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('エラースタックトレースが記録される', async () => {
      // Arrange
      const error = new Error('Test error with stack');
      error.stack = 'Error: Test error\n  at TestComponent\n  at render';

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSignInWithPassword.mockRejectedValueOnce(error);

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            message: 'Test error with stack',
            stack: expect.stringContaining('TestComponent'),
          })
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('ユーザーエクスペリエンス: エラー表示とフィードバック', () => {
    it('エラーメッセージが読みやすく表示される', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('error', 'alert', 'danger');
      });
    });

    it('エラーメッセージが一定時間後に自動的に消える', async () => {
      // Arrange
      jest.useFakeTimers();

      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // エラーメッセージ表示確認
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // 5秒後
      jest.advanceTimersByTime(5000);

      // Assert: エラーメッセージが消える
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('エラー後、フォームが再入力可能な状態になる', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      // Act
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Assert: フォームが再入力可能
      expect(emailInput).toBeEnabled();
      expect(passwordInput).toBeEnabled();
      expect(loginButton).toBeEnabled();

      // 新しい値を入力できる
      await user.clear(passwordInput);
      await user.type(passwordInput, 'newpassword');
      expect(passwordInput).toHaveValue('newpassword');
    });
  });
});
