/**
 * サーキットブレーカー テスト
 *
 * テスト対象: src/lib/circuit-breaker.ts
 * テスト計画: Docs/tests/TEST_STRATEGY.md § エラーハンドリングテスト
 * 目標カバレッジ: 90%以上
 */

import { authCircuitBreaker } from '@/lib/circuit-breaker';

describe('AuthCircuitBreaker', () => {
  beforeEach(() => {
    // 各テスト前にサーキットブレーカーをリセット
    authCircuitBreaker.reset();
    jest.clearAllMocks();
  });

  /**
   * TC-CB-001: 初期状態
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-CB-001: 初期状態', () => {
    it('初期状態ではクローズドである', () => {
      expect(authCircuitBreaker.isOpen()).toBe(false);
    });

    it('初期状態の統計情報が正しい', () => {
      const state = authCircuitBreaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
      expect(state.successCount).toBe(0);
      expect(state.lastFailureTime).toBe(0);
    });
  });

  /**
   * TC-CB-002: 失敗の記録
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-CB-002: 失敗の記録', () => {
    it('失敗を記録できる', () => {
      authCircuitBreaker.recordFailure();
      const state = authCircuitBreaker.getState();
      expect(state.failureCount).toBe(1);
      expect(state.lastFailureTime).toBeGreaterThan(0);
    });

    it('複数の失敗を記録できる', () => {
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      const state = authCircuitBreaker.getState();
      expect(state.failureCount).toBe(2);
    });

    it('3回連続失敗でサーキットがオープンになる', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.isOpen()).toBe(false);

      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.isOpen()).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('サーキットブレーカー: オープン')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  /**
   * TC-CB-003: 成功の記録
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-CB-003: 成功の記録', () => {
    it('成功を記録できる', () => {
      authCircuitBreaker.recordSuccess();
      const state = authCircuitBreaker.getState();
      expect(state.successCount).toBe(1);
    });

    it('成功を記録すると失敗カウントがリセットされる', () => {
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.getState().failureCount).toBe(2);

      authCircuitBreaker.recordSuccess();
      expect(authCircuitBreaker.getState().failureCount).toBe(0);
      expect(authCircuitBreaker.getState().successCount).toBe(1);
    });

    it('2回連続成功でサーキットがクローズになる', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // まずサーキットをオープンにする
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.isOpen()).toBe(true);

      // 1回成功（まだオープン）
      authCircuitBreaker.recordSuccess();
      expect(authCircuitBreaker.isOpen()).toBe(true);

      // 2回成功（クローズになる）
      authCircuitBreaker.recordSuccess();
      expect(authCircuitBreaker.isOpen()).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('サーキットブレーカー: クローズ')
      );

      consoleLogSpy.mockRestore();
    });
  });

  /**
   * TC-CB-004: タイムアウトによるリセット
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-CB-004: タイムアウトによるリセット', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('1分後にサーキットが自動的にリセットされる', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // サーキットをオープンにする
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.isOpen()).toBe(true);

      // 1分進める
      jest.advanceTimersByTime(60001);

      // isOpen()を呼ぶと自動的にリセットされる
      expect(authCircuitBreaker.isOpen()).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('サーキットブレーカー: リセット')
      );

      consoleLogSpy.mockRestore();
    });

    it('1分未満ではリセットされない', () => {
      // サーキットをオープンにする
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.isOpen()).toBe(true);

      // 30秒進める
      jest.advanceTimersByTime(30000);

      // まだオープンのまま
      expect(authCircuitBreaker.isOpen()).toBe(true);
    });
  });

  /**
   * TC-CB-005: reset 関数
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-CB-005: reset 関数', () => {
    it('reset()で状態が初期化される', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // サーキットをオープンにする
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.isOpen()).toBe(true);

      // リセット
      authCircuitBreaker.reset();

      const state = authCircuitBreaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
      expect(state.successCount).toBe(0);
      expect(state.lastFailureTime).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('サーキットブレーカー: リセット')
      );

      consoleLogSpy.mockRestore();
    });
  });

  /**
   * TC-CB-006: getState 関数
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-CB-006: getState 関数', () => {
    it('現在の状態を取得できる', () => {
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();

      const state = authCircuitBreaker.getState();
      expect(state.failureCount).toBe(2);
      expect(state.isOpen).toBe(false);
    });

    it('getState()は状態のコピーを返す（元の状態を変更しない）', () => {
      const state1 = authCircuitBreaker.getState();
      state1.failureCount = 999;

      const state2 = authCircuitBreaker.getState();
      expect(state2.failureCount).toBe(0);
    });
  });

  /**
   * TC-CB-007: シナリオテスト
   * Priority: P1 (High)
   * Test Type: Integration
   */
  describe('TC-CB-007: シナリオテスト', () => {
    it('失敗→成功→失敗のサイクル', () => {
      // 2回失敗
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.isOpen()).toBe(false);

      // 成功（失敗カウントリセット）
      authCircuitBreaker.recordSuccess();
      expect(authCircuitBreaker.getState().failureCount).toBe(0);

      // 再度失敗
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.getState().failureCount).toBe(1);
      expect(authCircuitBreaker.isOpen()).toBe(false);
    });

    it('オープン→成功2回→クローズのサイクル', () => {
      // オープンにする
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      authCircuitBreaker.recordFailure();
      expect(authCircuitBreaker.isOpen()).toBe(true);

      // 2回成功でクローズ
      authCircuitBreaker.recordSuccess();
      authCircuitBreaker.recordSuccess();
      expect(authCircuitBreaker.isOpen()).toBe(false);
    });
  });
});
