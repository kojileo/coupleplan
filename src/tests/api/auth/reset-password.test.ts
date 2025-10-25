/**
 * パスワードリセットAPI テスト
 *
 * テスト対象: src/app/api/auth/reset-password/route.ts
 * テスト計画: Docs/tests/TEST_CASES.md § 2.3 パスワードリセット
 * 目標カバレッジ: 80%以上
 */

import { NextRequest } from 'next/server';

import { POST } from '@/app/api/auth/reset-password/route';
import * as supabaseAuth from '@/lib/supabase-auth';
import { resetPasswordRateLimitMap } from '@/lib/rate-limit-maps';

describe('/api/auth/reset-password', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    // Rate limit mapをクリア（テスト間での干渉を防ぐ）
    if (resetPasswordRateLimitMap) {
      resetPasswordRateLimitMap.clear();
    }
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  /**
   * TC-AUTH-RESET-001: 正常なパスワードリセット
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-RESET-001: 正常なパスワードリセット', () => {
    it('正しいメールアドレスでリセットメールが送信される', async () => {
      (supabaseAuth.supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('パスワードリセットメール');
      expect(supabaseAuth.supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3000/reset-password',
        }
      );
    });
  });

  /**
   * TC-AUTH-RESET-002: 無効なメールアドレス
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-RESET-002: 無効なメールアドレス', () => {
    it('メールアドレスが欠けている場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('メールアドレスは必須です');
    });

    it('空のメールアドレスの場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: '   ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('メールアドレスは必須です');
    });

    it('nullのリクエストボディの場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(null),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('メールアドレスは必須です');
    });
  });

  /**
   * TC-AUTH-RESET-003: 環境変数未設定
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-RESET-003: 環境変数未設定', () => {
    it('NEXT_PUBLIC_APP_URLが未設定の場合、500エラーを返す', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('サーバー設定エラー');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('NEXT_PUBLIC_APP_URL'));

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * TC-AUTH-RESET-004: Supabaseエラー
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-RESET-004: Supabaseエラー', () => {
    it('Supabaseエラーの場合、400エラーを返す', async () => {
      (supabaseAuth.supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Email not found' },
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'notfound@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('パスワードリセットメールの送信に失敗');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Supabaseパスワードリセットエラー:',
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * TC-AUTH-RESET-005: サーバーエラー処理
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-RESET-005: サーバーエラー処理', () => {
    it('予期しないエラーの場合、500エラーを返す', async () => {
      (supabaseAuth.supabase.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('パスワードリセットに失敗しました');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * TC-AUTH-RESET-006: リダイレクトURL生成
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-AUTH-RESET-006: リダイレクトURL生成', () => {
    it('正しいリダイレクトURLが生成される', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

      (supabaseAuth.supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      await POST(request);

      expect(supabaseAuth.supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'https://example.com/reset-password',
        }
      );
    });
  });

  /**
   * TC-AUTH-RESET-007: Rate Limit機能
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-RESET-007: Rate Limit機能', () => {
    it('同一IP・同一メールアドレスで5分間に3回を超えると429エラーを返す', async () => {
      (supabaseAuth.supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      // 3回までは成功するはず
      for (let i = 0; i < 3; i++) {
        const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            email: 'ratelimit@example.com',
          }),
        });
        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // 4回目は429エラーになるはず
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'ratelimit@example.com',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(429);

      const data = await response.json();
      expect(data.error).toContain('メール送信制限に達しました');
    });
  });
});
