/**
 * ユーティリティ関数 テスト
 *
 * テスト対象: src/lib/utils.ts
 * テスト計画: Docs/tests/TEST_STRATEGY.md § ユーティリティテスト
 * 目標カバレッジ: 90%以上
 */

import { cn, formatDate, auth } from '@/lib/utils';
import { NextRequest } from 'next/server';
import * as supabaseAuth from '@/lib/supabase-auth';

describe('utils', () => {
  /**
   * TC-UTILS-001: cn 関数（クラス名マージ）
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-UTILS-001: cn 関数', () => {
    it('単一のクラス名を返す', () => {
      const result = cn('text-red-500');
      expect(result).toBe('text-red-500');
    });

    it('複数のクラス名をマージする', () => {
      const result = cn('text-red-500', 'bg-blue-500', 'p-4');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('p-4');
    });

    it('条件付きクラス名を処理する', () => {
      const isActive = true;
      const result = cn('base-class', {
        'active-class': isActive,
        'inactive-class': !isActive,
      });
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
      expect(result).not.toContain('inactive-class');
    });

    it('falsy値を除外する', () => {
      const result = cn('valid', null, undefined, false, 'also-valid');
      expect(result).toContain('valid');
      expect(result).toContain('also-valid');
    });

    it('Tailwindの競合を解決する', () => {
      const result = cn('p-4', 'p-6');
      // twMergeが後のクラスを優先する
      expect(result).toBe('p-6');
    });

    it('空の引数で空文字列を返す', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });

  /**
   * TC-UTILS-002: formatDate 関数（日付フォーマット）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UTILS-002: formatDate 関数', () => {
    it('Date オブジェクトを日本語形式でフォーマットする', () => {
      const date = new Date('2024-01-01T18:00:00Z');
      const result = formatDate(date);
      expect(result).toBeTruthy();
      expect(result).toContain('2024');
    });

    it('ISO文字列を日本語形式でフォーマットする', () => {
      const result = formatDate('2024-03-20T15:30:00Z');
      expect(result).toBeTruthy();
      expect(result).toContain('2024');
    });

    it('nullの場合、空文字列を返す', () => {
      const result = formatDate(null);
      expect(result).toBe('');
    });

    it('undefinedの場合、空文字列を返す', () => {
      const result = formatDate(undefined);
      expect(result).toBe('');
    });

    it('空文字列の場合、空文字列を返す', () => {
      const result = formatDate('');
      expect(result).toBe('');
    });

    it('無効な日付文字列の場合、空文字列を返す', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('');
    });

    it('無効なDateオブジェクトの場合、空文字列を返す', () => {
      const result = formatDate(new Date('invalid'));
      expect(result).toBe('');
    });
  });

  /**
   * TC-UTILS-003: auth 関数（認証チェック）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UTILS-003: auth 関数', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('有効なトークンの場合、トークンを返す', async () => {
      const mockToken = 'valid-token';
      const mockUser = { id: 'user-id', email: 'test@example.com' };

      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const result = await auth(request);
      expect(result).toBe(mockToken);
      expect(supabaseAuth.supabase.auth.getUser).toHaveBeenCalledWith(mockToken);
    });

    it('Authorizationヘッダーがない場合、nullを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const result = await auth(request);
      expect(result).toBeNull();
    });

    it('無効なトークンの場合、nullを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      const result = await auth(request);
      expect(result).toBeNull();
    });

    it('ユーザーが存在しない場合、nullを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer token',
        },
      });

      const result = await auth(request);
      expect(result).toBeNull();
    });

    it('エラーが発生した場合、nullを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer token',
        },
      });

      const result = await auth(request);
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('認証エラー:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('Bearer プレフィックスを正しく削除する', async () => {
      const mockToken = 'my-token-123';
      const mockUser = { id: 'user-id' };

      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      await auth(request);
      expect(supabaseAuth.supabase.auth.getUser).toHaveBeenCalledWith(mockToken);
    });
  });
});
