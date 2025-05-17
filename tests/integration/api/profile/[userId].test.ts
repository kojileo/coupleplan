import { NextRequest } from 'next/server';
import { GET } from '@/app/api/profile/[userId]/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      findUnique: jest.fn(),
    },
  },
}));

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

describe('特定ユーザーのプロフィールAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile/[userId]', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/profile/user-123');
      
      // パラメータの設定
      const params = Promise.resolve({ userId: 'user-123' });
      
      // APIエンドポイントの呼び出し
      const res = await GET(req, { params });
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('認証が無効な場合は401エラーを返す', async () => {
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('無効なトークン')
      });
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/profile/user-123', {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });
      
      // パラメータの設定
      const params = Promise.resolve({ userId: 'user-123' });
      
      // APIエンドポイントの呼び出し
      const res = await GET(req, { params });
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('プロフィールが存在しない場合は404エラーを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'authenticated-user' };
      const targetUserId = 'user-123';
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(null);
      
      // リクエストの作成
      const req = new NextRequest(`http://localhost:3000/api/profile/${targetUserId}`, {
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // パラメータの設定
      const params = Promise.resolve({ userId: targetUserId });
      
      // APIエンドポイントの呼び出し
      const res = await GET(req, { params });
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'プロフィールが見つかりません' });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: targetUserId }
      });
    });

    it('指定されたユーザーIDのプロフィールを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'authenticated-user' };
      const targetUserId = 'user-123';
      const mockProfile = {
        id: 'profile-1',
        userId: targetUserId,
        name: 'テストユーザー',
        email: 'test@example.com'
      };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      
      // リクエストの作成
      const req = new NextRequest(`http://localhost:3000/api/profile/${targetUserId}`, {
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // パラメータの設定
      const params = Promise.resolve({ userId: targetUserId });
      
      // APIエンドポイントの呼び出し
      const res = await GET(req, { params });
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: mockProfile });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: targetUserId }
      });
    });
  });
}); 