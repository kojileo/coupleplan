/**
 * manual-auth テスト
 *
 * テスト対象: src/lib/manual-auth.ts
 * テスト計画: Docs/tests/TEST_CASES.md § 2. 認証機能テストケース
 * 目標カバレッジ: 85%以上
 */

import {
  checkAuthStatus,
  refreshToken,
  safeAuthCheck,
  clearSession,
  detectAndClearCorruptedSession,
  AuthMonitor,
} from '@/lib/manual-auth';
import * as supabaseAuth from '@/lib/supabase-auth';
import * as circuitBreaker from '@/lib/circuit-breaker';
import * as authStop from '@/lib/auth-stop';

// モック
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      refreshSession: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('@/lib/circuit-breaker', () => ({
  authCircuitBreaker: {
    isOpen: jest.fn(),
    recordSuccess: jest.fn(),
    recordFailure: jest.fn(),
  },
}));

jest.mock('@/lib/auth-stop', () => ({
  authStopManager: {
    isAuthStopped: jest.fn(),
    autoStopOnRefreshTokenError: jest.fn(),
  },
}));

describe('manual-auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (circuitBreaker.authCircuitBreaker.isOpen as jest.Mock).mockReturnValue(false);
    (authStop.authStopManager.isAuthStopped as jest.Mock).mockReturnValue(false);
  });

  /**
   * TC-AUTH-MANUAL-001: checkAuthStatus - 正常な認証状態
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-001: checkAuthStatus - 正常な認証状態', () => {
    it('認証されている場合、isAuthenticatedがtrueになる', async () => {
      const mockSession = {
        access_token: 'test-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1時間後
        user: { id: 'test-user-id', email: 'test@example.com' },
      };

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(true);
      expect(result.needsRefresh).toBe(false);
      expect(result.error).toBeUndefined();
      expect(circuitBreaker.authCircuitBreaker.recordSuccess).toHaveBeenCalled();
    });

    it('認証されていない場合、isAuthenticatedがfalseになる', async () => {
      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(false);
      expect(result.needsRefresh).toBe(false);
    });

    it('トークンの有効期限が5分以内の場合、needsRefreshがtrueになる', async () => {
      const mockSession = {
        access_token: 'test-token',
        expires_at: Math.floor(Date.now() / 1000) + 240, // 4分後（5分未満）
        user: { id: 'test-user-id' },
      };

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(true);
      expect(result.needsRefresh).toBe(true);
    });
  });

  /**
   * TC-AUTH-MANUAL-002: checkAuthStatus - グローバル停止フラグ
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-002: checkAuthStatus - グローバル停止フラグ', () => {
    it('認証システムが停止中の場合、エラーを返す', async () => {
      (authStop.authStopManager.isAuthStopped as jest.Mock).mockReturnValue(true);

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(false);
      expect(result.needsRefresh).toBe(false);
      expect(result.error).toContain('停止中');
    });
  });

  /**
   * TC-AUTH-MANUAL-003: checkAuthStatus - サーキットブレーカー
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-003: checkAuthStatus - サーキットブレーカー', () => {
    it('サーキットブレーカーがオープンの場合、エラーを返す', async () => {
      (circuitBreaker.authCircuitBreaker.isOpen as jest.Mock).mockReturnValue(true);

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(false);
      expect(result.error).toContain('一時的に利用できません');
    });
  });

  /**
   * TC-AUTH-MANUAL-004: checkAuthStatus - リフレッシュトークンエラー
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-004: checkAuthStatus - リフレッシュトークンエラー', () => {
    it('refresh_token_not_foundエラーの場合、グローバル停止をトリガー', async () => {
      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'refresh_token_not_found' },
      });

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(false);
      expect(authStop.authStopManager.autoStopOnRefreshTokenError).toHaveBeenCalled();
      expect(circuitBreaker.authCircuitBreaker.recordFailure).toHaveBeenCalled();
    });

    it('Invalid Refresh Tokenエラーの場合、グローバル停止をトリガー', async () => {
      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid Refresh Token' },
      });

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(false);
      expect(authStop.authStopManager.autoStopOnRefreshTokenError).toHaveBeenCalled();
    });
  });

  /**
   * TC-AUTH-MANUAL-005: refreshToken - 正常なリフレッシュ
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-005: refreshToken - 正常なリフレッシュ', () => {
    it('トークンリフレッシュが成功する', async () => {
      (supabaseAuth.supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'new-token' } },
        error: null,
      });

      const result = await refreshToken();

      expect(result).toBe(true);
    });

    it('リフレッシュエラーの場合、falseを返す', async () => {
      (supabaseAuth.supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Refresh failed' },
      });

      const result = await refreshToken();

      expect(result).toBe(false);
    });

    it('レート制限エラーの場合、falseを返す', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      (supabaseAuth.supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'rate limit exceeded' },
      });

      const result = await refreshToken();

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('レート制限'));

      consoleWarnSpy.mockRestore();
    });
  });

  /**
   * TC-AUTH-MANUAL-006: safeAuthCheck - 安全な認証チェック
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-006: safeAuthCheck - 安全な認証チェック', () => {
    it('リフレッシュが不要な場合、そのまま返す', async () => {
      const mockSession = {
        access_token: 'test-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: 'test-user-id' },
      };

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await safeAuthCheck();

      expect(result.isAuthenticated).toBe(true);
      expect(result.needsRefresh).toBe(false);
    });

    it('リフレッシュが必要な場合、自動的にリフレッシュする', async () => {
      const mockSession = {
        access_token: 'test-token',
        expires_at: Math.floor(Date.now() / 1000) + 240, // 4分後
        user: { id: 'test-user-id' },
      };

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabaseAuth.supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'new-token' } },
        error: null,
      });

      const result = await safeAuthCheck();

      expect(result.isAuthenticated).toBe(true);
      expect(supabaseAuth.supabase.auth.refreshSession).toHaveBeenCalled();
    });

    it('リフレッシュ失敗時でもセッションを維持する', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockSession = {
        access_token: 'test-token',
        expires_at: Math.floor(Date.now() / 1000) + 240,
        user: { id: 'test-user-id' },
      };

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabaseAuth.supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Refresh failed' },
      });

      const result = await safeAuthCheck();

      expect(result.isAuthenticated).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('リフレッシュに失敗しましたが、セッションは維持します')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  /**
   * TC-AUTH-MANUAL-007: clearSession - セッションクリア
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-007: clearSession - セッションクリア', () => {
    it('セッションが正常にクリアされる', async () => {
      (supabaseAuth.supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await clearSession();

      expect(supabaseAuth.supabase.auth.signOut).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('セッションをクリアしました');

      consoleLogSpy.mockRestore();
    });

    it('windowオブジェクトが存在する場合、localStorageとsessionStorageをクリアする', async () => {
      // JSDOMではwindowオブジェクトが存在するため、このテストは実際の環境で動作する
      (supabaseAuth.supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      // localStorageとsessionStorageをモック
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
      const clearSpy = jest.spyOn(Storage.prototype, 'clear');

      await clearSession();

      expect(supabaseAuth.supabase.auth.signOut).toHaveBeenCalled();
      // JSDOMでは実際にストレージ操作が行われることを確認
      expect(clearSpy).toHaveBeenCalled();

      removeItemSpy.mockRestore();
      clearSpy.mockRestore();
    });
  });

  /**
   * TC-AUTH-MANUAL-008: detectAndClearCorruptedSession - 破損検知
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-008: detectAndClearCorruptedSession - 破損検知', () => {
    it('破損したセッションを検出してクリアする', async () => {
      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'refresh_token_not_found' },
      });

      (supabaseAuth.supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await detectAndClearCorruptedSession();

      expect(result).toBe(true);
      expect(supabaseAuth.supabase.auth.signOut).toHaveBeenCalled();
    });

    it('正常なセッションの場合、falseを返す', async () => {
      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      });

      const result = await detectAndClearCorruptedSession();

      expect(result).toBe(false);
    });
  });

  /**
   * TC-AUTH-MANUAL-009: AuthMonitor - 監視クラス
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-AUTH-MANUAL-009: AuthMonitor - 監視クラス', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('監視を開始できる', () => {
      const monitor = new AuthMonitor();

      expect(monitor['isRunning']).toBe(false);

      monitor.start(1000);

      expect(monitor['isRunning']).toBe(true);
      expect(monitor['intervalId']).not.toBeNull();

      monitor.stop();
    });

    it('監視を停止できる', () => {
      const monitor = new AuthMonitor();

      monitor.start(1000);
      expect(monitor['isRunning']).toBe(true);

      monitor.stop();

      expect(monitor['isRunning']).toBe(false);
      expect(monitor['intervalId']).toBeNull();
    });

    it('定期的に認証状態をチェックする', async () => {
      const mockSession = {
        access_token: 'test-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: 'test-user-id' },
      };

      (supabaseAuth.supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const monitor = new AuthMonitor();
      monitor.start(1000); // 1秒間隔

      // 1秒進める
      jest.advanceTimersByTime(1000);

      // 非同期処理を待つ
      await Promise.resolve();

      expect(supabaseAuth.supabase.auth.getSession).toHaveBeenCalled();

      monitor.stop();
    });

    it('既に実行中の場合、再度開始しない', () => {
      const monitor = new AuthMonitor();

      monitor.start(1000);
      const firstIntervalId = monitor['intervalId'];

      monitor.start(1000); // 再度開始を試みる
      const secondIntervalId = monitor['intervalId'];

      expect(firstIntervalId).toBe(secondIntervalId);

      monitor.stop();
    });
  });
});
