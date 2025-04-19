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
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('ナビゲーションリンクをクリックすると正しいページに遷移する', () => {
    render(<Navbar />);

    // デスクトップメニューのリンクをクリック
    const desktopLinks = screen.getByRole('navigation').querySelectorAll('.hidden.md\\:flex a');
    fireEvent.click(desktopLinks[0]); // マイプラン一覧
    expect(mockPush).toHaveBeenCalledWith('/plans');

    fireEvent.click(desktopLinks[1]); // プランを探す
    expect(mockPush).toHaveBeenCalledWith('/plans/explore');

    fireEvent.click(desktopLinks[2]); // プロフィール
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('モバイルメニューのリンクをクリックすると正しいページに遷移する', () => {
    render(<Navbar />);

    // メニューを開く
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }));

    // モバイルメニューのリンクをクリック
    const mobileLinks = screen
      .getByRole('navigation')
      .querySelectorAll('[class*="hidden md:hidden"] a');
    fireEvent.click(mobileLinks[0]); // マイプラン一覧
    expect(mockPush).toHaveBeenCalledWith('/plans');

    fireEvent.click(mobileLinks[1]); // プランを探す
    expect(mockPush).toHaveBeenCalledWith('/plans/explore');

    fireEvent.click(mobileLinks[2]); // プロフィール
    expect(mockPush).toHaveBeenCalledWith('/profile');
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
