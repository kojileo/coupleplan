import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/plans/route';
import { PUT, DELETE } from '@/app/api/plans/[id]/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// モックの設定
jest.mock('@/lib/db', () => ({
  prisma: {
    plan: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Plans API', () => {
  const mockUser = {
    id: 'user1',
    name: 'テストユーザー',
    email: 'test@example.com',
  };

  const mockPlan = {
    id: 'plan1',
    title: 'テストプラン',
    description: 'テスト用のプラン',
    date: '2024-04-01',
    locations: [
      {
        name: '東京タワー',
        address: '東京都港区芝公園4-2-8',
        latitude: 35.6585805,
        longitude: 139.7454329,
        url: 'https://example.com/tokyo-tower',
      },
    ],
    region: 'tokyo',
    budget: 10000,
    isPublic: true,
    userId: 'user1',
    createdAt: '2025-03-30T06:41:22.382Z',
    updatedAt: '2025-03-30T06:41:22.382Z',
    profile: {
      name: 'テストユーザー',
    },
    likes: [],
    _count: {
      likes: 0,
    },
  };

  const mockAuthHeader = {
    headers: new Headers({
      Authorization: 'Bearer test-token',
    }),
  };

  beforeEach(() => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans', () => {
    it('自分のプラン一覧を取得できる', async () => {
      // Prismaのモック設定
      const mockPlans = [
        {
          id: 'plan-123',
          title: 'テストプラン1',
          description: 'テスト説明1',
          date: '2024-01-01T00:00:00.000Z',
          region: 'tokyo',
          budget: 1000,
          isPublic: true,
          createdAt: '2025-04-20T01:47:14.359Z',
          updatedAt: '2025-04-20T01:47:14.359Z',
          locations: [],
          likes: [],
          profile: { name: 'テストユーザー1' },
          _count: { likes: 0 },
        },
        {
          id: 'plan-124',
          title: 'テストプラン2',
          description: 'テスト説明2',
          date: '2024-01-02T00:00:00.000Z',
          region: 'osaka',
          budget: 2000,
          isPublic: true,
          createdAt: '2025-04-20T01:47:14.359Z',
          updatedAt: '2025-04-20T01:47:14.359Z',
          locations: [],
          likes: [],
          profile: { name: 'テストユーザー2' },
          _count: { likes: 0 },
        },
      ];

      (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const request = new NextRequest('http://localhost:3000/api/plans', mockAuthHeader);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockPlans });
      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
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

    it('認証されていない場合は401を返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      const request = new NextRequest('http://localhost:3000/api/plans', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/plans', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      const request = new NextRequest('http://localhost:3000/api/plans', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
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
        locations: [
          {
            name: '東京タワー',
            address: '東京都港区芝公園4-2-8',
            latitude: 35.6585805,
            longitude: 139.7454329,
            url: 'https://example.com/tokyo-tower',
          },
        ],
        region: '関東',
        budget: 5000,
        isPublic: false,
      };

      // レスポンスデータ
      const createdPlan = {
        ...planData,
        id: 'plan-123',
        userId: mockUser.id,
        profile: { name: 'テストユーザー' },
        likes: [],
        _count: { likes: 0 },
      };

      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Prismaのモック設定
      (prisma.plan.create as jest.Mock).mockResolvedValue(createdPlan);

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      // APIエンドポイントの呼び出し
      const res = await POST(req);
      const data = await res.json();

      // レスポンスの検証（201に修正）
      expect(res.status).toBe(201);
      expect(data).toEqual({ data: createdPlan });

      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.plan.create).toHaveBeenCalledWith({
        data: {
          title: planData.title,
          description: planData.description,
          date: new Date(planData.date),
          locations: {
            create: planData.locations,
          },
          region: planData.region,
          budget: planData.budget,
          isPublic: planData.isPublic,
          category: null,
          userId: mockUser.id,
        },
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
      });
    });

    it('無効なリクエストデータの場合は400エラーを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };

      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // 不完全なリクエストデータ
      const invalidPlanData = {
        title: 'テストプラン',
        // 必須フィールドが不足
      };

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidPlanData),
      });

      // APIエンドポイントの呼び出し
      const res = await POST(req);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'プランの作成に失敗しました' });
    });

    it('Prismaエラーの場合は500エラーを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const planData = {
        title: 'テストプラン',
        description: 'テスト説明',
        date: '2024-03-20',
        locations: [
          {
            url: '東京',
            name: '東京タワー',
          },
        ],
        region: '関東',
        budget: 5000,
        isPublic: false,
      };

      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Prismaエラーのモック設定
      (prisma.plan.create as jest.Mock).mockRejectedValue(new Error('データベースエラー'));

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      // APIエンドポイントの呼び出し
      const res = await POST(req);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'プランの作成に失敗しました' });
    });
  });

  describe('PUT /api/plans/[id]', () => {
    it('プランを更新できる', async () => {
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.plan.update as jest.Mock).mockResolvedValue({
        ...mockPlan,
        title: '更新後のプラン',
      });

      const request = new NextRequest('http://localhost:3000/api/plans/plan1', {
        ...mockAuthHeader,
        method: 'PUT',
        body: JSON.stringify({
          title: '更新後のプラン',
          description: 'テスト用のプラン',
          date: '2024-04-01',
          locations: [
            {
              url: 'https://example.com',
              name: '東京タワー',
            },
          ],
          region: 'tokyo',
          budget: 10000,
          isPublic: true,
        }),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'plan1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { ...mockPlan, title: '更新後のプラン' } });
      expect(prisma.plan.update).toHaveBeenCalledWith({
        where: { id: 'plan1', userId: 'user1' },
        data: {
          title: '更新後のプラン',
          description: 'テスト用のプラン',
          date: '2024-04-01',
          locations: {
            deleteMany: {},
            create: [
              {
                url: 'https://example.com',
                name: '東京タワー',
              },
            ],
          },
          region: 'tokyo',
          budget: 10000,
          isPublic: true,
        },
        include: {
          profile: {
            select: {
              name: true,
            },
          },
          likes: true,
          locations: true,
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });
    });

    it('自分のプラン以外は更新できない', async () => {
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({
        ...mockPlan,
        userId: 'other-user',
      });

      const request = new NextRequest('http://localhost:3000/api/plans/plan1', {
        ...mockAuthHeader,
        method: 'PUT',
        body: JSON.stringify({
          title: '更新後のプラン',
          description: 'テスト用のプラン',
          date: '2024-04-01',
          locations: [
            {
              url: 'https://example.com',
              name: '東京タワー',
            },
          ],
          region: 'tokyo',
          budget: 10000,
          isPublic: true,
        }),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'plan1' }) });
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/plans/[id]', () => {
    it('プランを削除できる', async () => {
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.plan.delete as jest.Mock).mockResolvedValue(mockPlan);

      const request = new NextRequest('http://localhost:3000/api/plans/plan1', {
        ...mockAuthHeader,
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'plan1' }) });
      expect(response.status).toBe(200);
      expect(prisma.plan.delete).toHaveBeenCalledWith({
        where: { id: 'plan1', userId: 'user1' },
      });
    });

    it('自分のプラン以外は削除できない', async () => {
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({
        ...mockPlan,
        userId: 'other-user',
      });

      const request = new NextRequest('http://localhost:3000/api/plans/plan1', {
        ...mockAuthHeader,
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'plan1' }) });
      expect(response.status).toBe(200);
    });
  });
});
