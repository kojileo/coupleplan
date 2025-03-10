// テスト全体で global.fetch をモック関数として定義
if (!global.fetch) {
  global.fetch = jest.fn();
}

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/(dashboard)/profile/page';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-auth';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useProfile', () => ({
  useProfile: jest.fn(),
}));

jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

describe('ProfilePage コンポーネント', () => {
  const mockProfile = {
    name: 'Test User',
    email: 'test@example.com',
  };
  const mockSession = { access_token: 'dummy-token' };
  const pushMock = jest.fn();
  
  // コンソールエラーをモック化
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    // useRouterのモック
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    // useAuthのモック
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id' },
      session: mockSession,
      isLoading: false,
      signOut: jest.fn(),
    });

    // useProfileのモック
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング中は「読み込み中...」を表示する', () => {
    (useProfile as jest.Mock).mockReturnValue({
      isLoading: true,
      profile: null,
      error: null,
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<ProfilePage />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('エラーが発生した場合はエラーメッセージを表示する', () => {
    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: null,
      error: { message: 'エラーが発生しました' },
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<ProfilePage />);
    expect(screen.getByText('エラー: エラーが発生しました')).toBeInTheDocument();
  });

  it('セッションがない場合は「ログインが必要です」を表示する', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      signOut: jest.fn(),
    });

    render(<ProfilePage />);
    expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
  });

  it('プロフィール情報が正しく表示される', () => {
    render(<ProfilePage />);
    
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('プロフィール更新が正しく動作する', async () => {
    const mockUpdateProfile = jest.fn().mockResolvedValue({ data: mockProfile });
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: mockUpdateProfile,
      deleteAccount: jest.fn(),
    });

    render(<ProfilePage />);

    // フォームの入力を変更
    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: /更新する/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith('Updated Name', 'updated@example.com');
    });
  });

  it('プロフィール更新が成功した場合、成功メッセージが表示される', async () => {
    const mockUpdateProfile = jest.fn().mockResolvedValue(true);
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: mockUpdateProfile,
      deleteAccount: jest.fn(),
    });

    render(<ProfilePage />);

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: /更新する/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('プロフィールが更新されました')).toBeInTheDocument();
    });
  });

  it('プロフィール更新でエラーが発生した場合、エラーメッセージが表示される', async () => {
    const mockUpdateProfile = jest.fn().mockRejectedValue(new Error('更新エラー'));
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: mockUpdateProfile,
      deleteAccount: jest.fn(),
    });

    render(<ProfilePage />);

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: /更新する/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('プロフィール更新エラー:', expect.any(Error));
      expect(screen.getByText('プロフィールの更新に失敗しました')).toBeInTheDocument();
    });
  });

  it('アカウント削除ボタンをクリックすると確認ダイアログが表示される', () => {
    render(<ProfilePage />);
    
    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除/i });
    fireEvent.click(deleteButton);
    
    // 確認ダイアログが表示されることを確認
    expect(screen.getByText('本当にアカウントを削除しますか？')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /削除する/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /キャンセル/i })).toBeInTheDocument();
  });

  it('退会処理が正しく動作する', async () => {
    const mockDeleteAccount = jest.fn().mockResolvedValue(true);
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      deleteAccount: mockDeleteAccount,
    });

    render(<ProfilePage />);

    // 削除ボタンをクリック（確認ダイアログを表示）
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除/i });
    fireEvent.click(deleteButton);
    
    // 確認ダイアログの「削除する」ボタンをクリック
    const confirmDeleteButton = screen.getByRole('button', { name: /削除する/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('退会処理が失敗した場合（成功フラグがfalse）、エラーメッセージが表示される', async () => {
    const mockDeleteAccount = jest.fn().mockResolvedValue(false);
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      deleteAccount: mockDeleteAccount,
    });

    render(<ProfilePage />);

    // 削除ボタンをクリック（確認ダイアログを表示）
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除/i });
    fireEvent.click(deleteButton);
    
    // 確認ダイアログの「削除する」ボタンをクリック
    const confirmDeleteButton = screen.getByRole('button', { name: /削除する/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('アカウント削除に失敗しました（成功フラグがfalse）');
      expect(screen.getByText('アカウントの削除に失敗しました')).toBeInTheDocument();
    });
  });

  it('退会処理でエラーが発生した場合、エラーメッセージが表示される', async () => {
    const testError = new Error('削除エラー');
    const mockDeleteAccount = jest.fn().mockRejectedValue(testError);
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      deleteAccount: mockDeleteAccount,
    });

    render(<ProfilePage />);

    // 削除ボタンをクリック（確認ダイアログを表示）
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除/i });
    fireEvent.click(deleteButton);
    
    // 確認ダイアログの「削除する」ボタンをクリック
    const confirmDeleteButton = screen.getByRole('button', { name: /削除する/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('アカウント削除エラー:', testError);
      expect(screen.getByText('削除エラー')).toBeInTheDocument();
    });
  });

  it('退会処理でエラーオブジェクトがErrorインスタンスでない場合、デフォルトメッセージが表示される', async () => {
    const mockDeleteAccount = jest.fn().mockRejectedValue('文字列エラー');
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      deleteAccount: mockDeleteAccount,
    });

    render(<ProfilePage />);

    // 削除ボタンをクリック（確認ダイアログを表示）
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除/i });
    fireEvent.click(deleteButton);
    
    // 確認ダイアログの「削除する」ボタンをクリック
    const confirmDeleteButton = screen.getByRole('button', { name: /削除する/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('アカウント削除エラー:', '文字列エラー');
      expect(screen.getByText('アカウントの削除に失敗しました')).toBeInTheDocument();
    });
  });

  it('退会処理がキャンセルできる', () => {
    render(<ProfilePage />);
    
    // 削除ボタンをクリック（確認ダイアログを表示）
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除/i });
    fireEvent.click(deleteButton);
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
    fireEvent.click(cancelButton);
    
    // 確認ダイアログが非表示になることを確認
    expect(screen.queryByText('本当にアカウントを削除しますか？')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /アカウントを削除/i })).toBeInTheDocument();
  });

  it('削除中は削除ボタンが無効化され、テキストが「削除中...」に変わる', async () => {
    // 削除処理が完了する前に状態を確認するため、resolveしない Promise を返す
    const mockDeleteAccount = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        // テスト内で手動で解決しないPromise
        setTimeout(() => resolve(true), 1000);
      });
    });
    
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      deleteAccount: mockDeleteAccount,
    });

    render(<ProfilePage />);

    // 削除ボタンをクリック（確認ダイアログを表示）
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除/i });
    fireEvent.click(deleteButton);
    
    // 確認ダイアログの「削除する」ボタンをクリック
    const confirmDeleteButton = screen.getByRole('button', { name: /削除する/i });
    fireEvent.click(confirmDeleteButton);

    // 削除中のボタンテキストと無効化状態を確認
    await waitFor(() => {
      const deletingButton = screen.getByText('削除中...');
      expect(deletingButton).toBeInTheDocument();
      expect(deletingButton).toBeDisabled();
    });
  });
});
