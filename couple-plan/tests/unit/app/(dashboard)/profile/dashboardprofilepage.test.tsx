// テスト全体で global.fetch をモック関数として定義
if (!global.fetch) {
  global.fetch = jest.fn();
}

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/(dashboard)/profile/page';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase-auth';

// モックの設定
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

  beforeEach(() => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      loading: false,
      error: null,
      updateProfile: jest.fn(),
      session: mockSession,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング中は「読み込み中...」を表示する', () => {
    (useProfile as jest.Mock).mockReturnValue({
      loading: true,
      profile: null,
      error: null,
      updateProfile: jest.fn(),
      session: null,
    });

    render(<ProfilePage />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('エラーが発生した場合はエラーメッセージを表示する', () => {
    (useProfile as jest.Mock).mockReturnValue({
      loading: false,
      profile: null,
      error: 'エラーが発生しました',
      updateProfile: jest.fn(),
      session: null,
    });

    render(<ProfilePage />);
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
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
      loading: false,
      error: null,
      updateProfile: mockUpdateProfile,
      session: mockSession,
    });

    render(<ProfilePage />);

    // フォームの入力を変更
    const nameInput = screen.getByLabelText('お名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: /プロフィールを更新/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith('Updated Name', 'updated@example.com');
    });
  });

  it('パスワード更新で不一致エラーを表示する', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    render(<ProfilePage />);

    // パスワードフォームに異なる値を入力
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: /パスワードを更新/i });
    fireEvent.click(submitButton);

    expect(alertMock).toHaveBeenCalledWith('新しいパスワードが一致しません');
  });

  it('パスワード更新が成功する', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<ProfilePage />);

    // パスワードフォームに同じ値を入力
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: /パスワードを更新/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpass123' });
      expect(alertMock).toHaveBeenCalledWith('パスワードを更新しました');
    });
  });

  it('退会処理が正しく動作する', async () => {
    const confirmMock = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    render(<ProfilePage />);

    const deleteButton = screen.getByRole('button', { name: /退会する/i });
    fireEvent.click(deleteButton);

    expect(confirmMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${mockSession.access_token}` },
      });
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith('アカウント削除に成功しました。');
    });
  });
});
