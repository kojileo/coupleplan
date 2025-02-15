// テスト全体で global.fetch をモック関数として定義
if (!global.fetch) {
  global.fetch = jest.fn();
}

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/(dashboard)/profile/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase-auth';

// モックの設定
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    profile: {
      get: jest.fn(),
      update: jest.fn(),
    },
  },
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
  const dummyUser = { id: 'user1' };
  const dummySession = { access_token: 'token123' };
  const dummyProfile = { name: 'Test User', email: 'test@example.com' };

  // 各テスト毎に alert, confirm, fetch のモックをリセット
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: dummyUser,
      session: dummySession,
    });
    // 各テスト開始時に fetch のモックもクリア
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('初回レンダリング時、プロフィールが未取得の場合は「読み込み中...」を表示する', () => {
    // api.profile.get が未解決の場合、初期状態として「読み込み中...」が表示される
    (api.profile.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<ProfilePage />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('プロフィール取得に成功した場合、基本情報フォームが表示される', async () => {
    (api.profile.get as jest.Mock).mockResolvedValueOnce({ data: dummyProfile, error: null });
    render(<ProfilePage />);
    // useEffect 内の fetch が成功したあと、フォームのフィールドが表示される
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /プロフィールを更新/i })).toBeInTheDocument();
    });
  });

  it('プロフィール更新のフォーム送信時、api.profile.update を呼び出し成功した場合、alert で成功メッセージを表示する', async () => {
    (api.profile.get as jest.Mock).mockResolvedValueOnce({ data: dummyProfile, error: null });
    const updatedProfile = { name: 'Updated User', email: 'updated@example.com' };
    (api.profile.update as jest.Mock).mockResolvedValueOnce({ data: updatedProfile, error: null });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ProfilePage />);

    // プロフィール取得完了を待つ
    await waitFor(() => expect(screen.getByDisplayValue('Test User')).toBeInTheDocument());

    // 入力の変更
    const nameInput = screen.getByLabelText('お名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    fireEvent.change(nameInput, { target: { value: updatedProfile.name } });
    fireEvent.change(emailInput, { target: { value: updatedProfile.email } });

    // フォーム送信
    const updateButton = screen.getByRole('button', { name: /プロフィールを更新/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(api.profile.update).toHaveBeenCalledWith(dummySession.access_token, updatedProfile.name, updatedProfile.email);
      expect(alertSpy).toHaveBeenCalledWith('プロフィールを更新しました');
    });
  });

  it('パスワード更新フォームで、新パスワードと確認が一致しない場合、エラーメッセージを alert で表示する', async () => {
    (api.profile.get as jest.Mock).mockResolvedValueOnce({ data: dummyProfile, error: null });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByDisplayValue('Test User')).toBeInTheDocument());

    // パスワード更新フォームの入力（不一致）
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });

    const updatePasswordButton = screen.getByRole('button', { name: /パスワードを更新/i });
    fireEvent.click(updatePasswordButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('新しいパスワードが一致しません');
    });
  });

  it('パスワード更新フォームで、新パスワードと確認が一致する場合、supabase.auth.updateUser を呼び出し成功する', async () => {
    (api.profile.get as jest.Mock).mockResolvedValueOnce({ data: dummyProfile, error: null });
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({ error: null });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByDisplayValue('Test User')).toBeInTheDocument());

    // パスワード更新フォームの入力（一致）
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

    const updatePasswordButton = screen.getByRole('button', { name: /パスワードを更新/i });
    fireEvent.click(updatePasswordButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpass123' });
      expect(alertSpy).toHaveBeenCalledWith('パスワードを更新しました');
      // 更新後、入力が初期化される（空文字）ことをチェック
      expect((newPasswordInput as HTMLInputElement).value).toBe('');
      expect((confirmPasswordInput as HTMLInputElement).value).toBe('');
    });
  });

  it('退会ボタンで confirm がキャンセルされた場合、fetch API は呼ばれない', async () => {
    (api.profile.get as jest.Mock).mockResolvedValueOnce({ data: dummyProfile, error: null });
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByDisplayValue('Test User')).toBeInTheDocument());

    const deleteButton = screen.getByRole('button', { name: /退会する/i });
    fireEvent.click(deleteButton);
    // confirm でキャンセルされたので、fetch は呼ばれない
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('退会ボタンで confirm が承認された場合、fetch API 実行後に supabase.auth.signOut を呼び出し、window.location.href を更新する', async () => {
    (api.profile.get as jest.Mock).mockResolvedValueOnce({ data: dummyProfile, error: null });
    // confirm で退会を承認する
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // fetch をモック：DELETE 処理に成功したケース（エラーなし）
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({}),
    } as Response);

    // window.location.href の書き換えを監視するための設定
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByDisplayValue('Test User')).toBeInTheDocument());

    const deleteButton = screen.getByRole('button', { name: /退会する/i });
    fireEvent.click(deleteButton);

    // 各処理が正しく呼ばれていることを検証
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dummySession.access_token}` },
      });
      expect(alertSpy).toHaveBeenCalledWith('アカウント削除に成功しました。');
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(window.location.href).toBe('/');
    });
  });
});
