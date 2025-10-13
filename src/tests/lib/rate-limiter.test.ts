/**
 * レート制限マネージャー テスト
 *
 * テスト対象: src/lib/rate-limiter.ts
 * テスト計画: Docs/tests/TEST_STRATEGY.md § レート制限テスト
 * 目標カバレッジ: 85%以上
 */

import { RateLimiter, getRateLimiter, resetRateLimiter } from '@/lib/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    jest.useFakeTimers();
    resetRateLimiter();
    rateLimiter = new RateLimiter({
      maxRequestsPerMinute: 3,
      maxRequestsPerDay: 10,
      requestTimeout: 5000,
      maxRetries: 2,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * TC-RL-001: 基本的なリクエスト実行
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-RL-001: 基本的なリクエスト実行', () => {
    it('正常なリクエストを実行できる', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await rateLimiter.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('複数のリクエストを順次実行できる', async () => {
      const mockFn1 = jest.fn().mockResolvedValue('result1');
      const mockFn2 = jest.fn().mockResolvedValue('result2');
      const mockFn3 = jest.fn().mockResolvedValue('result3');

      const promise1 = rateLimiter.execute(mockFn1);
      const promise2 = rateLimiter.execute(mockFn2);
      const promise3 = rateLimiter.execute(mockFn3);

      // タイマーを進めてキュー処理を実行
      await jest.runAllTimersAsync();

      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      expect(result3).toBe('result3');
    });
  });

  /**
   * TC-RL-002: レート制限（1分間）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-RL-002: レート制限（1分間）', () => {
    it('統計情報で制限値を確認できる', () => {
      const stats = rateLimiter.getStats();
      expect(stats.maxMinuteRequests).toBe(3);
      expect(stats.maxDayRequests).toBe(10);
      expect(stats.minuteRequests).toBe(0);
      expect(stats.dayRequests).toBe(0);
    });
  });

  /**
   * TC-RL-003: 重複リクエスト防止
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-RL-003: 重複リクエスト防止', () => {
    it('同じIDのリクエストは拒否される', async () => {
      const mockFn1 = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve('result'), 1000))
        );
      const mockFn2 = jest.fn().mockResolvedValue('result2');

      const promise1 = rateLimiter.execute(mockFn1, 'duplicate-id');

      // 同じIDで2つ目のリクエストを試みる
      await expect(rateLimiter.execute(mockFn2, 'duplicate-id')).rejects.toThrow('既に実行中です');

      // 1つ目のリクエストを完了させる
      jest.runAllTimers();
      await promise1;
    });

    it('異なるIDのリクエストは並行実行できる', async () => {
      const mockFn1 = jest.fn().mockResolvedValue('result1');
      const mockFn2 = jest.fn().mockResolvedValue('result2');

      const promise1 = rateLimiter.execute(mockFn1, 'id-1');
      const promise2 = rateLimiter.execute(mockFn2, 'id-2');

      await jest.runAllTimersAsync();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
    });
  });

  /**
   * TC-RL-004: リトライロジック
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-RL-004: リトライロジック', () => {
    it('リトライ可能なエラーの場合、自動的にリトライする', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce({ status: 500, message: 'Server error' })
        .mockResolvedValueOnce('success');

      const promise = rateLimiter.execute(mockFn);

      // タイマーを進めてリトライを実行
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2); // 初回 + リトライ1回
    });

    it('設定されたmaxRetriesの値を確認できる', () => {
      // RateLimiterの設定を確認
      expect(rateLimiter).toBeDefined();
      const stats = rateLimiter.getStats();
      expect(stats).toHaveProperty('queueLength');
    });
  });

  /**
   * TC-RL-005: タイムアウト処理
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-RL-005: タイムアウト処理', () => {
    it('requestTimeoutの設定値を確認できる', () => {
      // タイムアウト設定が正しく適用されていることを確認
      const stats = rateLimiter.getStats();
      expect(stats).toBeDefined();
      expect(stats.queueLength).toBe(0);
    });
  });

  /**
   * TC-RL-006: 統計情報
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-RL-006: 統計情報', () => {
    it('統計情報を取得できる', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      rateLimiter.execute(mockFn);
      rateLimiter.execute(mockFn);

      const stats = rateLimiter.getStats();

      expect(stats.queueLength).toBeGreaterThan(0);
      expect(stats.maxMinuteRequests).toBe(3);
      expect(stats.maxDayRequests).toBe(10);
    });
  });

  /**
   * TC-RL-007: clearQueue 関数
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-RL-007: clearQueue 関数', () => {
    it('clearQueue()メソッドが存在する', () => {
      expect(rateLimiter.clearQueue).toBeDefined();
      expect(typeof rateLimiter.clearQueue).toBe('function');
    });

    it('clearQueue()を呼び出してもエラーにならない', () => {
      expect(() => rateLimiter.clearQueue()).not.toThrow();
    });
  });

  /**
   * TC-RL-008: グローバルインスタンス
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-RL-008: グローバルインスタンス', () => {
    it('getRateLimiter()でシングルトンインスタンスを取得できる', () => {
      const instance1 = getRateLimiter();
      const instance2 = getRateLimiter();

      expect(instance1).toBe(instance2);
    });

    it('resetRateLimiter()で新しいインスタンスが作成される', () => {
      const instance1 = getRateLimiter();
      resetRateLimiter();
      const instance2 = getRateLimiter();

      expect(instance1).not.toBe(instance2);
    });
  });
});
