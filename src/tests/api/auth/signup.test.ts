/**
 * サインアップAPI テスト
 *
 * テスト対象: src/app/api/auth/signup/route.ts
 * テスト計画: Docs/tests/TEST_CASES.md § 2.1 ユーザー登録
 * 目標カバレッジ: 80%以上
 */

import { NextRequest } from 'next/server';

import { POST } from '@/app/api/auth/signup/route';
import * as supabaseAuth from '@/lib/supabase-auth';

// Supabaseモックは既にjest.setupで設定済み

describe('/api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-AUTH-SIGNUP-001: 正常な新規登録
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-SIGNUP-001: 正常な新規登録', () => {
    it('正しい情報で登録が成功する', async () => {
      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        created_at: new Date().toISOString(),
      };

      const mockProfile = {
        user_id: 'new-user-id',
        name: 'New User',
        email: 'newuser@example.com',
      };

      (supabaseAuth.supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabaseAuth.supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'Password123',
          name: 'New User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.profile).toEqual(mockProfile);
      expect(data.data.message).toContain('確認メール');
      expect(supabaseAuth.supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'Password123',
        options: {
          data: {
            name: 'New User',
          },
        },
      });
    });

    it('名前なしで登録が成功する（デフォルト名が設定される）', async () => {
      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
      };

      (supabaseAuth.supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabaseAuth.supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { name: 'ユーザー' },
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'Password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(supabaseAuth.supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'Password123',
        options: {
          data: {
            name: 'ユーザー',
          },
        },
      });
    });
  });

  /**
   * TC-AUTH-SIGNUP-002: 既存メールアドレスでの登録
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-SIGNUP-002: 既存メールアドレスでの登録', () => {
    it('既に使用されているメールアドレスでエラーを返す', async () => {
      (supabaseAuth.supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'Password123',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User already registered');
    });
  });

  /**
   * TC-AUTH-SIGNUP-003: パスワード強度不足
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-SIGNUP-003: パスワード強度不足', () => {
    it('6文字未満のパスワードでエラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '12345',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('6文字以上');
    });

    it('空のパスワードでエラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('6文字以上');
    });
  });

  /**
   * TC-AUTH-SIGNUP-004: 無効なメールアドレス
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-SIGNUP-004: 無効なメールアドレス', () => {
    it('@を含まないメールアドレスでエラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalidemail',
          password: 'Password123',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('有効なメールアドレス');
    });

    it('空のメールアドレスでエラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: '',
          password: 'Password123',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('有効なメールアドレス');
    });
  });

  /**
   * TC-AUTH-SIGNUP-005: 無効なリクエストデータ
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-SIGNUP-005: 無効なリクエストデータ', () => {
    it('メールアドレスが欠けている場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          password: 'Password123',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('無効なリクエストデータです');
    });

    it('パスワードが欠けている場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('無効なリクエストデータです');
    });

    it('空のリクエストボディの場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('無効なリクエストデータです');
    });
  });

  /**
   * TC-AUTH-SIGNUP-006: プロフィール作成エラー
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-AUTH-SIGNUP-006: プロフィール作成エラー', () => {
    it('プロフィール作成失敗時でもサインアップは成功する', async () => {
      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
      };

      (supabaseAuth.supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabaseAuth.supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile creation failed' },
            }),
          }),
        }),
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'Password123',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.profile).toBeNull();
      expect(data.data.message).toContain('確認メール');
      expect(consoleErrorSpy).toHaveBeenCalledWith('プロフィール作成エラー:', expect.any(Object));

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * TC-AUTH-SIGNUP-007: サーバーエラー処理
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-AUTH-SIGNUP-007: サーバーエラー処理', () => {
    it('予期しないエラーの場合、500エラーを返す', async () => {
      (supabaseAuth.supabase.auth.signUp as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('ユーザー登録に失敗しました');
    });
  });

  /**
   * TC-AUTH-SIGNUP-008: ユーザー作成失敗
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-AUTH-SIGNUP-008: ユーザー作成失敗', () => {
    it('ユーザーオブジェクトがnullの場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ユーザー登録に失敗しました');
    });
  });
});
