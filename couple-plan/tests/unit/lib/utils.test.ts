import { cn, formatDate, auth } from '@/lib/utils';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-auth';

// モックの設定
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('utils', () => {
  describe('cn', () => {
    it('クラス名を正しく結合する', () => {
      expect(cn('base-class', 'additional-class')).toBe('base-class additional-class');
      expect(cn('base-class', { 'conditional-class': true })).toBe('base-class conditional-class');
      expect(cn('base-class', { 'conditional-class': false })).toBe('base-class');
    });
  });

  describe('formatDate', () => {
    it('日付を正しくフォーマットする', () => {
      const date = new Date('2024-03-20T12:34:56Z');
      const expected = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(formatDate(date)).toBe(expected);
    });

    it('文字列の日付を正しくフォーマットする', () => {
      const date = new Date('2024-03-20T12:34:56Z');
      const expected = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(formatDate('2024-03-20T12:34:56Z')).toBe(expected);
    });

    it('無効な日付の場合は空文字を返す', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('auth', () => {
    it('有効なトークンで認証に成功する', async () => {
      const mockToken = 'valid-token';
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const req = new NextRequest('http://localhost', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const result = await auth(req);
      expect(result).toBe(mockToken);
      expect(supabase.auth.getUser).toHaveBeenCalledWith(mockToken);
    });

    it('認証ヘッダーがない場合はnullを返す', async () => {
      const req = new NextRequest('http://localhost');
      const result = await auth(req);
      expect(result).toBeNull();
    });

    it('無効なトークンの場合はnullを返す', async () => {
      const mockToken = 'invalid-token';
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      const req = new NextRequest('http://localhost', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const result = await auth(req);
      expect(result).toBeNull();
    });

    it('エラーが発生した場合はnullを返す', async () => {
      const mockToken = 'error-token';
      (supabase.auth.getUser as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const req = new NextRequest('http://localhost', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const result = await auth(req);
      expect(result).toBeNull();
    });
  });
}); 