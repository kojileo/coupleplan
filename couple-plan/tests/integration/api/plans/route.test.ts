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

// Supabaseのモック
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('プランAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      const req = new NextRequest('http://localhost:3000/api/plans');

      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('認証済みユーザーのプラン一覧を返す', async () => {
      const mockUser = { id: 'user-123' };
      const mockPlans = [
        {
          id: 'plan-1',
          title: 'テストプラン1',
          description: 'テスト説明1',
          date: '2024-03-20T00:00:00.000Z',
          budget: 10000,
          region: 'tokyo',
          isPublic: true,
          likes: [],
          locations: [
            {
              id: 'loc-1',
              name: '東京タワー',
              url: 'https://example.com/1',
              planId: 'plan-1',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
          profile: {
            name: 'テストユーザー',
          },
          _count: {
            likes: 0,
          },
        },
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const req = new NextRequest('http://localhost:3000/api/plans', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ data: mockPlans });

      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: {
          profile: {
            select: {
              name: true,
            },
          },
          likes: true,
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('POST /api/plans', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      const req = new NextRequest('http://localhost:3000/api/plans', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('新しいプランを作成して返す', async () => {
      const mockUser = { id: 'user-123' };
      const testDate = new Date('2024-03-20');
      const testDateString = testDate.toISOString();

      const planData = {
        title: 'テストプラン',
        description: 'テスト説明',
        date: new Date('2024-01-01').toISOString(),
        locations: [{ url: 'https://example.com', name: '東京タワー' }],
        region: 'tokyo',
        budget: 10000,
        isPublic: false,
      };

      const mockPlan = {
        id: 'test-plan-id',
        title: planData.title,
        description: planData.description,
        date: planData.date,
        locations: [{ url: 'https://example.com', name: '東京タワー' }],
        region: planData.region,
        budget: planData.budget,
        isPublic: planData.isPublic,
        userId: mockUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (prisma.plan.create as jest.Mock).mockResolvedValue(mockPlan);

      const req = new NextRequest('http://localhost:3000/api/plans', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toEqual({ data: mockPlan });

      expect(prisma.plan.create).toHaveBeenCalledWith({
        data: {
          ...planData,
          userId: mockUser.id,
          date: new Date(planData.date),
          locations: {
            create: planData.locations.map((location) => ({
              name: location.name,
              url: location.url,
            })),
          },
          category: null,
        },
        include: {
          profile: { select: { name: true } },
          likes: true,
          _count: { select: { likes: true } },
        },
      });
    });
  });
});
