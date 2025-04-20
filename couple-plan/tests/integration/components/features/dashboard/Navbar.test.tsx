import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/features/dashboard/Navbar';
import { supabase } from '@/lib/supabase-auth';

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// supabase-authのモック
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

describe('Navbar コンポーネントのインテグレーションテスト', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ナビゲーションリンクをクリックすると正しいページに遷移する', () => {
    render(<Navbar />);

    // デスクトップリンクのテスト
    const myPlansLinks = screen.getAllByText('マイプラン一覧');
    const explorePlansLink = screen.getByText('プランを探す');

    fireEvent.click(myPlansLinks[0]);
    expect(mockPush).toHaveBeenCalledWith('/plans');

    fireEvent.click(explorePlansLink);
    expect(mockPush).toHaveBeenCalledWith('/plans/explore');
  });

  it('モバイルメニューのリンクをクリックすると正しいページに遷移する', () => {
    render(<Navbar />);

    // モバイルリンクのテスト
    const mobileMyPlansLinks = screen.getAllByText('マイプラン一覧');
    const mobileExplorePlansLink = screen.getByText('プランを探す');

    fireEvent.click(mobileMyPlansLinks[1]);
    expect(mockPush).toHaveBeenCalledWith('/plans');

    fireEvent.click(mobileExplorePlansLink);
    expect(mockPush).toHaveBeenCalledWith('/plans/explore');
  });

  it('ログアウト処理が正常に完了するとホームページにリダイレクトされる', async () => {
    // supabase.auth.signOutの成功レスポンスをモック
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<Navbar />);

    // ログアウトボタンをクリック
    const logoutButton = screen.getByRole('navigation').querySelector('.hidden.md\\:flex button');
    await fireEvent.click(logoutButton as Element);

    // 非同期処理が完了するのを待つ
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('ログアウト処理でエラーが発生してもホームページにリダイレクトされる', async () => {
    // supabase.auth.signOutのエラーレスポンスをモック
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
      error: new Error('ログアウトエラー'),
    });

    // コンソールエラーをモック化して抑制
    const originalConsoleError = console.error;
    console.error = jest.fn();

    render(<Navbar />);

    // ログアウトボタンをクリック
    const logoutButton = screen.getByRole('navigation').querySelector('.hidden.md\\:flex button');
    await fireEvent.click(logoutButton as Element);

    // エラーがあってもホームページにリダイレクトされることを確認
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // コンソールエラーを元に戻す
    console.error = originalConsoleError;
  });

  it('モバイルメニューのログアウトボタンをクリックするとログアウト処理が実行される', async () => {
    // supabase.auth.signOutの成功レスポンスをモック
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<Navbar />);

    // メニューを開く
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }));

    // モバイルメニューのログアウトボタンをクリック
    const mobileLogoutButtons = screen.getAllByText('ログアウト');
    await fireEvent.click(mobileLogoutButtons[1]); // モバイルメニューのボタン

    // 非同期処理が完了するのを待つ
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
