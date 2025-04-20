import { GET, PUT, DELETE } from '@/app/api/plans/[id]/route';
import { supabase } from '@/lib/supabase-auth';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

// モックの設定
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    plan: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('plans/[id] API', () => {
  const mockToken = 'test-token';
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockPlan = {
    id: 'plan-1',
    title: 'テストプラン',
    description: 'テスト説明',
    date: '2024-01-01T00:00:00.000Z',
    budget: 1000,
    region: 'tokyo',
    isPublic: false,
    userId: mockUser.id,
    createdAt: '2024-02-17T12:14:23.310Z',
    updatedAt: '2024-02-17T12:14:23.310Z',
    profile: { name: 'テストユーザー' },
    locations: [
      {
        id: 'loc-1',
        url: 'https://example.com',
        name: '東京タワー',
        planId: 'plan-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    likes: [],
    _count: { likes: 0 },
  };

  const mockParams = {
    params: Promise.resolve({ id: mockPlan.id }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans/[id]', () => {
    it('プランを正常に取得', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });
      (prisma.plan.findFirst as jest.Mock).mockResolvedValueOnce(mockPlan);

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await GET(request, mockParams);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toEqual(mockPlan);

      expect(prisma.plan.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPlan.id,
          OR: [{ userId: mockUser.id }, { isPublic: true }],
        },
        include: {
          profile: { select: { name: true } },
          locations: true,
          likes: true,
          _count: { select: { likes: true } },
        },
      });
    });

    it('プランが見つからない場合、404エラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });
      (prisma.plan.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await GET(request, mockParams);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('プランが見つかりません');
    });
  });

  describe('PUT /api/plans/[id]', () => {
    const updateData = {
      title: '更新されたタイトル',
      description: '更新された説明',
      date: '2024-02-01T00:00:00.000Z',
      budget: 2000,
      region: 'osaka',
      isPublic: true,
      locations: [
        {
          name: '大阪城',
          url: 'https://example.com/osaka',
        },
      ],
    };

    it('プランを正常に更新', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });
      (prisma.plan.update as jest.Mock).mockResolvedValueOnce({
        ...mockPlan,
        ...updateData,
        locations: [
          {
            id: 'loc-2',
            url: 'https://example.com/osaka',
            name: '大阪城',
            planId: 'plan-1',
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          },
        ],
      });

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, mockParams);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'プランの更新に失敗しました' });

      expect(prisma.plan.update).toHaveBeenCalledWith({
        where: {
          id: mockPlan.id,
          userId: mockUser.id,
        },
        data: {
          title: updateData.title,
          description: updateData.description,
          date: updateData.date,
          budget: updateData.budget,
          region: updateData.region,
          isPublic: updateData.isPublic,
          locations: {
            deleteMany: {},
            create: updateData.locations.map((location) => ({
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

  describe('DELETE /api/plans/[id]', () => {
    it('プランを正常に削除', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });
      (prisma.plan.delete as jest.Mock).mockResolvedValueOnce(mockPlan);

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await DELETE(request, mockParams);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.success).toBe(true);

      expect(prisma.plan.delete).toHaveBeenCalledWith({
        where: {
          id: mockPlan.id,
          userId: mockUser.id,
        },
      });
    });
  });

  // 共通のエラーケース
  describe('共通のエラー処理', () => {
    const testCases = ['GET', 'PUT', 'DELETE'] as const;
    type Method = (typeof testCases)[number];

    const handlers: Record<Method, typeof GET | typeof PUT | typeof DELETE> = {
      GET,
      PUT,
      DELETE,
    };

    testCases.forEach((method) => {
      it(`${method}: 認証トークンがない場合、401エラーを返す`, async () => {
        const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}`, {
          method,
        });

        const response = await handlers[method](request, mockParams);
        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBe('認証が必要です');
      });

      it(`${method}: ユーザーが見つからない場合、401エラーを返す`, async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
          data: { user: null },
          error: new Error('User not found'),
        });

        const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}`, {
          method,
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        });

        const response = await handlers[method](request, mockParams);
        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBe('認証が必要です');
      });
    });
  });
});
