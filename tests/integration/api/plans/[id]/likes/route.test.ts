import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/plans/[id]/likes/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    plan: {
      findUnique: jest.fn(),
    },
    like: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

describe('いいねAPI統合テスト', () => {
  const mockParams = {
    params: Promise.resolve({ id: 'plan-123' })
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/plans/[id]/likes', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123/likes', {
        method: 'POST'
      });
      
      // APIエンドポイントの呼び出し
      const res = await POST(req, mockParams);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('プランが存在しない場合は404エラーを返す', async () => {
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue(null);
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123/likes', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await POST(req, mockParams);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'プランが見つかりません' });
    });

    it('いいねを追加して返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const mockPlan = { id: 'plan-123', title: 'テストプラン' };
      const mockLike = {
        id: 'like-123',
        planId: 'plan-123',
        userId: 'user-123',
        profile: { name: 'テストユーザー' }
      };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.like.create as jest.Mock).mockResolvedValue(mockLike);
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123/likes', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await POST(req, mockParams);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: mockLike });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { id: 'plan-123' }
      });
      expect(prisma.like.create).toHaveBeenCalledWith({
        data: {
          planId: 'plan-123',
          userId: mockUser.id
        },
        include: {
          profile: { select: { name: true } }
        }
      });
    });

    it('既にいいね済みの場合は400エラーを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const mockPlan = { id: 'plan-123', title: 'テストプラン' };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.like.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`planId`,`userId`)')
      );
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123/likes', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await POST(req, mockParams);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(400);
      expect(data).toEqual({ error: '既にいいね済みです' });
    });
  });

  describe('DELETE /api/plans/[id]/likes', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123/likes', {
        method: 'DELETE'
      });
      
      // APIエンドポイントの呼び出し
      const res = await DELETE(req, mockParams);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('いいねを削除して成功を返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.like.delete as jest.Mock).mockResolvedValue({});
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123/likes', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await DELETE(req, mockParams);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: null });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: {
          planId_userId: {
            planId: 'plan-123',
            userId: mockUser.id
          }
        }
      });
    });

    it('いいねが存在しない場合は404エラーを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.like.delete as jest.Mock).mockRejectedValue(
        new Error('Record to delete does not exist.')
      );
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123/likes', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await DELETE(req, mockParams);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'いいねが見つかりません' });
    });
  });
}); 