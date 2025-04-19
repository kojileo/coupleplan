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
          date: new Date('2024-03-20'),
          budget: 10000,
          region: 'tokyo',
          isPublic: true,
          userId: mockUser.id,
          profile: { name: 'テストユーザー' },
          locations: [
            {
              id: 'loc-1',
              url: 'https://example.com/1',
              name: '東京タワー',
              planId: 'plan-1',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
          ],
          likes: [],
          _count: { likes: 0 },
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
        orderBy: { updatedAt: 'desc' },
        include: {
          profile: { select: { name: true } },
          locations: true,
          likes: true,
          _count: { select: { likes: true } },
        },
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
        date: testDateString,
        budget: 5000,
        locations: [
          {
            url: 'https://example.com',
            name: '東京タワー',
          },
        ],
        region: 'tokyo',
        isPublic: false,
      };

      const createdPlan = {
        ...planData,
        id: 'plan-123',
        userId: mockUser.id,
        profile: { name: 'テストユーザー' },
        locations: [
          {
            id: 'loc-1',
            url: 'https://example.com',
            name: '東京タワー',
            planId: 'plan-123',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        likes: [],
        _count: { likes: 0 },
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (prisma.plan.create as jest.Mock).mockResolvedValue(createdPlan);

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
      expect(data).toEqual({ data: createdPlan });

      expect(prisma.plan.create).toHaveBeenCalledWith({
        data: {
          ...planData,
          userId: mockUser.id,
          date: testDate,
          locations: {
            create: planData.locations.map((location) => ({
              url: location.url,
              name: location.name,
            })),
          },
        },
        include: {
          profile: { select: { name: true } },
          locations: true,
          likes: true,
          _count: { select: { likes: true } },
        },
      });
    });
  });
});
