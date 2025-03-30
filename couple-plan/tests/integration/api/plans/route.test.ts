import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/plans/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    plan: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

describe('プランAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans');
      
      // APIエンドポイントの呼び出し
      const res = await GET(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('認証済みユーザーのプラン一覧を返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const mockPlans = [
        { 
          id: 'plan-1', 
          title: 'テストプラン1',
          profile: { name: 'テストユーザー' },
          likes: [],
          _count: { likes: 0 }
        }
      ];
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans', {
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await GET(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: mockPlans });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          profile: { select: { name: true } },
          likes: true,
          _count: { select: { likes: true } }
        }
      });
    });
  });

  describe('POST /api/plans', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      // APIエンドポイントの呼び出し
      const res = await POST(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('新しいプランを作成して返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const testDate = new Date('2024-03-20');
      const testDateString = testDate.toISOString();
      
      // リクエストデータ（文字列化された日付を使用）
      const planData = {
        title: 'テストプラン',
        description: 'テスト説明',
        date: testDateString,
        location: '東京',
        region: '関東',
        budget: 5000,
        isPublic: false
      };
      
      // レスポンスデータ
      const createdPlan = {
        ...planData,
        id: 'plan-123',
        userId: mockUser.id,
        profile: { name: 'テストユーザー' },
        likes: [],
        _count: { likes: 0 }
      };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのモック設定
      (prisma.plan.create as jest.Mock).mockResolvedValue(createdPlan);
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });
      
      // APIエンドポイントの呼び出し
      const res = await POST(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(201);
      expect(data).toEqual({ data: createdPlan });
      
      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.plan.create).toHaveBeenCalledWith({
        data: {
          ...planData,
          userId: mockUser.id
        },
        include: {
          profile: { select: { name: true } },
          likes: true,
          _count: { select: { likes: true } }
        }
      });
    });
  });
}); 