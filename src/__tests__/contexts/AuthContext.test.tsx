/**
 * AuthContext テスト
 *
 * テスト対象: src/contexts/AuthContext.tsx
 * テスト計画: Docs/tests/TEST_CASES.md § 2. 認証機能テストケース
 * 目標カバレッジ: 85%以上
 */

import React from 'react';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as supabaseAuth from '@/lib/supabase-auth';
import * as manualAuth from '@/lib/manual-auth';
import { User, Session } from '@supabase/supabase-js';

// Supabaseのモック
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// manual-authのモック
jest.mock('@/lib/manual-auth', () => ({
  safeAuthCheck: jest.fn(),
  clearSession: jest.fn(),
  detectAndClearCorruptedSession: jest.fn(),
}));

describe('AuthContext', () => {
  // モックのリセット
  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのモック実装
    (supabaseAuth.supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });

    (manualAuth.detectAndClearCorruptedSession as jest.Mock).mockResolvedValue(false);
    (manualAuth.safeAuthCheck as jest.Mock).mockResolvedValue({
      isAuthenticated: false,
      needsRefresh: false,
      error: null,
    });
  });

  /**
   * TC-AUTH-CTX-001: AuthProviderの初期化
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-CTX-001: AuthProvider初期化', () => {
    it('初期状態でローディング中である', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('認証されていない場合、userとsessionがnullになる', async () => {
      (manualAuth.safeAuthCheck as jest.Mock).mockResolvedValue({
        isAuthenticated: false,
        needsRefresh: false,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('認証されている場合、userとsessionが設定される', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      const mockSession: Partial<Session> = {
        user: mockUser as User,
        access_token: 'test-access-token',
      };

      (manualAuth.safeAuthCheck as jest.Mock).mockResolvedValue({
        isAuthenticated: true,
        needsRefresh: false,
        error: null,
      });

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  /**
   * TC-AUTH-CTX-002: セッション破損検知
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-CTX-002: セッション破損検知', () => {
    it('破損したセッションが検出された場合、セッションをクリアする', async () => {
      (manualAuth.detectAndClearCorruptedSession as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.authStatus?.error).toContain('破損');
    });
  });

  /**
   * TC-AUTH-CTX-003: signOut機能
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-CTX-003: signOut機能', () => {
    it('signOutが正常に実行される', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockSession: Partial<Session> = {
        user: mockUser as User,
        access_token: 'test-access-token',
      };

      (manualAuth.safeAuthCheck as jest.Mock).mockResolvedValue({
        isAuthenticated: true,
        needsRefresh: false,
      });

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabaseAuth.supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // 初期化完了を待つ
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 認証状態を確認
      expect(result.current.user).toEqual(mockUser);

      // signOutを実行
      await act(async () => {
        await result.current.signOut();
      });

      // signOutが呼ばれたことを確認
      expect(supabaseAuth.supabase.auth.signOut).toHaveBeenCalled();

      // 状態がクリアされたことを確認
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.authStatus).toBeNull();
    });

    it('signOutエラー時でもエラーをキャッチする', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (supabaseAuth.supabase.auth.signOut as jest.Mock).mockRejectedValue(
        new Error('Signout failed')
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('ログアウトエラー:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * TC-AUTH-CTX-004: refreshAuth機能
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-CTX-004: refreshAuth機能', () => {
    it('refreshAuthが正常に実行される', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockSession: Partial<Session> = {
        user: mockUser as User,
        access_token: 'test-access-token',
      };

      (manualAuth.safeAuthCheck as jest.Mock)
        .mockResolvedValueOnce({
          isAuthenticated: false,
          needsRefresh: false,
        })
        .mockResolvedValueOnce({
          isAuthenticated: true,
          needsRefresh: false,
        });

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 初期状態は未認証
      expect(result.current.user).toBeNull();

      // refreshAuthを実行
      await act(async () => {
        await result.current.refreshAuth();
      });

      // 認証状態が更新される
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.authStatus?.isAuthenticated).toBe(true);
    });
  });

  /**
   * TC-AUTH-CTX-005: clearCorruptedSession機能
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-CTX-005: clearCorruptedSession機能', () => {
    it('破損したセッションを手動でクリアできる', async () => {
      (manualAuth.clearSession as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearCorruptedSession();
      });

      expect(manualAuth.clearSession).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.authStatus?.error).toContain('手動でクリア');
    });
  });

  /**
   * TC-AUTH-CTX-006: 認証状態変更の監視
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-CTX-006: 認証状態変更の監視', () => {
    it('onAuthStateChangeコールバックが登録される', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(supabaseAuth.supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it('認証状態変更時にuserとsessionが更新される', async () => {
      let authCallback: ((event: string, session: Session | null) => void) | null = null;

      (supabaseAuth.supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockUser: Partial<User> = {
        id: 'new-user-id',
        email: 'newuser@example.com',
      };

      const mockSession: Partial<Session> = {
        user: mockUser as User,
        access_token: 'new-access-token',
      };

      // 認証状態変更をシミュレート
      await act(async () => {
        if (authCallback) {
          authCallback('SIGNED_IN', mockSession as Session);
        }
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  /**
   * TC-AUTH-CTX-007: useAuthフックのコンテキスト外使用
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-AUTH-CTX-007: useAuthフック使用', () => {
    it('AuthProvider内でuseAuthが使用できる', () => {
      const TestComponent = () => {
        const auth = useAuth();
        return <div>{auth.isLoading ? 'Loading' : 'Loaded'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText(/Loading|Loaded/)).toBeInTheDocument();
    });
  });
});
