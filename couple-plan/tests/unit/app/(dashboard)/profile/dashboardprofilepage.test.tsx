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
});
