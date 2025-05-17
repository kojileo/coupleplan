import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/profile/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

describe('プロフィールAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/profile');
      
      // APIエンドポイントの呼び出し
      const res = await GET(req);
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
      const req = new NextRequest('http://localhost:3000/api/profile', {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await GET(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('プロフィールが存在しない場合は404エラーを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(null);
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/profile', {
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await GET(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'プロフィールが見つかりません' });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUser.id }
      });
    });

    it('認証済みユーザーのプロフィールを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const mockProfile = {
        id: 'profile-1',
        userId: mockUser.id,
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
      const req = new NextRequest('http://localhost:3000/api/profile', {
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await GET(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: mockProfile });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUser.id }
      });
    });
  });

  describe('PUT /api/profile', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({})
      });
      
      // APIエンドポイントの呼び出し
      const res = await PUT(req);
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
      const req = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer invalid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      // APIエンドポイントの呼び出し
      const res = await PUT(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('プロフィールを更新して返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const profileData = {
        name: '更新後の名前',
        email: 'updated@example.com'
      };
      
      const updatedProfile = {
        id: 'profile-1',
        userId: mockUser.id,
        ...profileData
      };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.profile.upsert as jest.Mock).mockResolvedValue(updatedProfile);
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      // APIエンドポイントの呼び出し
      const res = await PUT(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: updatedProfile });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.profile.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        update: profileData,
        create: {
          userId: mockUser.id,
          ...profileData
        }
      });
    });
  });
}); 