/**
 * ログインAPI テスト
 *
 * テスト対象: src/app/api/auth/login/route.ts
 * テスト計画: Docs/tests/TEST_CASES.md § 2.2 ログイン
 * 目標カバレッジ: 80%以上
 */

import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントのモック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('/api/auth/login', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Supabaseモックのセットアップ
    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
        getSession: jest.fn(),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // 環境変数のモック
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  /**
   * TC-AUTH-API-001: 正常なログイン
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-API-001: 正常なログイン', () => {
    it('正しい認証情報でログインが成功する', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      const mockSession = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        user: mockUser,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual(mockUser);
      expect(data.session).toEqual(mockSession);
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test1234!',
      });
    });
  });

  /**
   * TC-AUTH-API-002: 誤ったパスワードでのログイン
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-API-002: 誤ったパスワードでのログイン', () => {
    it('誤った認証情報でログインが失敗する', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('メールアドレスまたはパスワードが正しくありません');
    });
  });

  /**
   * TC-AUTH-API-003: 未確認メールアドレスでのログイン
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-API-003: 未確認メールアドレスでのログイン', () => {
    it('メール未確認アカウントでログインが失敗する', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email not confirmed' },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'unconfirmed@example.com',
          password: 'Test1234!',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('確認されていません');
    });
  });

  /**
   * TC-AUTH-API-004: レート制限エラー
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-API-004: レート制限エラー', () => {
    it('レート制限に達した場合、適切なエラーメッセージを返す', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Too many requests' },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('試行回数が多すぎます');
    });
  });

  /**
   * TC-AUTH-API-005: 無効なリクエストデータ
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-API-005: 無効なリクエストデータ', () => {
    it('メールアドレスが欠けている場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'Test1234!',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('無効なリクエストデータです');
    });

    it('パスワードが欠けている場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('無効なリクエストデータです');
    });

    it('空のリクエストボディの場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('無効なリクエストデータです');
    });

    it('nullリクエストボディの場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(null),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('無効なリクエストデータです');
    });
  });

  /**
   * TC-AUTH-API-006: サーバーエラー処理
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-API-006: サーバーエラー処理', () => {
    it('予期しないエラーの場合、500エラーを返す', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('サーバーエラーが発生しました');
    });
  });

  /**
   * TC-AUTH-API-007: セッション確認エラー
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-AUTH-API-007: セッション確認エラー', () => {
    it('セッション確認失敗時でもログイン成功を返す', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockSession = {
        access_token: 'test-access-token',
        user: mockUser,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // セッション確認はエラーになるが、ログインは成功
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session verification failed' },
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API - セッション確認エラー:',
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
