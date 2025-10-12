/**
 * Navbar コンポーネント テスト
 *
 * テスト対象: src/components/layout/navbar.tsx
 * テスト計画: Docs/tests/TEST_CASES.md § ナビゲーション機能
 * 目標カバレッジ: 75%以上
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from '@/components/layout/navbar';
import * as navigation from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// モック
jest.mock('@/lib/supabase/client');

describe('Navbar Component', () => {
  const mockPush = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // useRouterのモック（jest.setupでモックされているものを上書き）
    jest.spyOn(navigation, 'useRouter').mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    } as any);

    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    });
  });

  /**
   * TC-NAV-001: 基本的なレンダリング
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-NAV-001: 基本的なレンダリング', () => {
    it('ダッシュボードでナビゲーションバーが表示される', () => {
      jest.spyOn(navigation, 'usePathname').mockReturnValue('/dashboard');

      render(<Navbar />);

      expect(screen.getByText('CouplePlan')).toBeInTheDocument();
      expect(screen.getByText('🏠 ホーム')).toBeInTheDocument();
    });

    it('ログインページではナビゲーションバーを表示しない', () => {
      // jest.setupのモックを上書き
      const usePathnameSpy = jest.spyOn(navigation, 'usePathname');
      usePathnameSpy.mockReturnValueOnce('/login');

      const { container } = render(<Navbar />);

      expect(container.firstChild).toBeNull();
      usePathnameSpy.mockRestore();
    });

    it('サインアップページではナビゲーションバーを表示しない', () => {
      const usePathnameSpy = jest.spyOn(navigation, 'usePathname');
      usePathnameSpy.mockReturnValueOnce('/signup');

      const { container } = render(<Navbar />);

      expect(container.firstChild).toBeNull();
      usePathnameSpy.mockRestore();
    });

    it('トップページではナビゲーションバーを表示しない', () => {
      const usePathnameSpy = jest.spyOn(navigation, 'usePathname');
      usePathnameSpy.mockReturnValueOnce('/');

      const { container } = render(<Navbar />);

      expect(container.firstChild).toBeNull();
      usePathnameSpy.mockRestore();
    });
  });

  /**
   * TC-NAV-002: ナビゲーションリンク
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-NAV-002: ナビゲーションリンク', () => {
    beforeEach(() => {
      jest.spyOn(navigation, 'usePathname').mockReturnValue('/dashboard');
    });

    it('全ての主要なリンクが表示される', () => {
      render(<Navbar />);

      expect(screen.getAllByText('🏠 ホーム')).toHaveLength(1);
      expect(screen.getAllByText('📅 プラン一覧')).toHaveLength(1);
      expect(screen.getAllByText('✨ プラン作成')).toHaveLength(1);
      expect(screen.getAllByText('👥 パートナー')).toHaveLength(1);
      expect(screen.getAllByText('⚙️ 設定')).toHaveLength(1);
    });

    it('ロゴがダッシュボードにリンクしている', () => {
      render(<Navbar />);

      const logo = screen.getByText('CouplePlan').closest('a');
      expect(logo).toHaveAttribute('href', '/dashboard');
    });
  });

  /**
   * TC-NAV-003: アクティブ状態
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-NAV-003: アクティブ状態', () => {
    it('ダッシュボードページでホームがアクティブになる', () => {
      const usePathnameSpy = jest.spyOn(navigation, 'usePathname');
      usePathnameSpy.mockReturnValue('/dashboard');

      render(<Navbar />);

      const homeLink = screen.getAllByText('🏠 ホーム')[0].closest('a');
      expect(homeLink?.className).toContain('bg-rose-100');

      usePathnameSpy.mockRestore();
    });

    it('プラン一覧ページでプラン一覧がアクティブになる', () => {
      const usePathnameSpy = jest.spyOn(navigation, 'usePathname');
      usePathnameSpy.mockReturnValue('/dashboard/plans');

      render(<Navbar />);

      const plansLink = screen.getAllByText('📅 プラン一覧')[0].closest('a');
      expect(plansLink?.className).toContain('bg-rose-100');

      usePathnameSpy.mockRestore();
    });

    it('プロフィールページで設定がアクティブになる', () => {
      const usePathnameSpy = jest.spyOn(navigation, 'usePathname');
      usePathnameSpy.mockReturnValue('/dashboard/profile');

      render(<Navbar />);

      const profileLink = screen.getAllByText('⚙️ 設定')[0].closest('a');
      expect(profileLink?.className).toContain('bg-rose-100');

      usePathnameSpy.mockRestore();
    });
  });

  /**
   * TC-NAV-004: ログアウト機能
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-NAV-004: ログアウト機能', () => {
    it('ログアウトボタンが表示される', () => {
      const usePathnameSpy = jest.spyOn(navigation, 'usePathname');
      usePathnameSpy.mockReturnValue('/dashboard');

      render(<Navbar />);

      expect(screen.getAllByText('ログアウト')).toHaveLength(1);
      usePathnameSpy.mockRestore();
    });

    it('ログアウトボタンをクリックするとサインアウト処理が実行される', async () => {
      const usePathnameSpy = jest.spyOn(navigation, 'usePathname');
      usePathnameSpy.mockReturnValue('/dashboard');
      mockSignOut.mockResolvedValue({ error: null });

      render(<Navbar />);

      const logoutButton = screen.getAllByText('ログアウト')[0];
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });

      // pushは非同期処理の後に呼ばれる
      expect(mockPush).toHaveBeenCalledWith('/login');
      usePathnameSpy.mockRestore();
    });
  });

  /**
   * TC-NAV-005: モバイルメニュー
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-NAV-005: モバイルメニュー', () => {
    beforeEach(() => {
      jest.spyOn(navigation, 'usePathname').mockReturnValue('/dashboard');
    });

    it('モバイルメニューボタンが表示される', () => {
      render(<Navbar />);

      const menuButton = screen.getByLabelText('メニュー');
      expect(menuButton).toBeInTheDocument();
    });

    it('メニューボタンをクリックするとモバイルメニューが開く', () => {
      render(<Navbar />);

      // 初期状態ではモバイルメニューは非表示
      expect(screen.queryByText('📅 プラン一覧')).toBeInTheDocument();

      const menuButton = screen.getByLabelText('メニュー');
      fireEvent.click(menuButton);

      // モバイルメニューが表示される（デスクトップとモバイルで2つ表示される）
      expect(screen.getAllByText('📅 プラン一覧').length).toBeGreaterThan(1);
    });

    it('メニューを開いた後、再度クリックすると閉じる', () => {
      render(<Navbar />);

      const menuButton = screen.getByLabelText('メニュー');

      // メニューを開く
      fireEvent.click(menuButton);
      expect(screen.getAllByText('📅 プラン一覧').length).toBeGreaterThan(1);

      // 再度クリックして閉じる
      fireEvent.click(menuButton);
      expect(screen.getAllByText('📅 プラン一覧')).toHaveLength(1);
    });

    it('モバイルメニューのリンクをクリックするとメニューが閉じる', () => {
      render(<Navbar />);

      const menuButton = screen.getByLabelText('メニュー');
      fireEvent.click(menuButton);

      // モバイルメニューのリンクをクリック
      const mobileLinks = screen.getAllByText('📅 プラン一覧');
      fireEvent.click(mobileLinks[mobileLinks.length - 1]);

      // メニューが閉じる（デスクトップの1つだけになる）
      waitFor(() => {
        expect(screen.getAllByText('📅 プラン一覧')).toHaveLength(1);
      });
    });
  });

  /**
   * TC-NAV-006: アイコン切り替え
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-NAV-006: アイコン切り替え', () => {
    it('メニューが閉じている時はハンバーガーアイコンを表示', () => {
      jest.spyOn(navigation, 'usePathname').mockReturnValue('/dashboard');

      render(<Navbar />);

      const menuButton = screen.getByLabelText('メニュー');
      const svg = menuButton.querySelector('svg');
      const path = svg?.querySelector('path');

      expect(path?.getAttribute('d')).toContain('M4 6h16M4 12h16M4 18h16');
    });

    it('メニューが開いている時は閉じるアイコンを表示', () => {
      jest.spyOn(navigation, 'usePathname').mockReturnValue('/dashboard');

      render(<Navbar />);

      const menuButton = screen.getByLabelText('メニュー');
      fireEvent.click(menuButton);

      const svg = menuButton.querySelector('svg');
      const path = svg?.querySelector('path');

      expect(path?.getAttribute('d')).toContain('M6 18L18 6M6 6l12 12');
    });
  });
});
