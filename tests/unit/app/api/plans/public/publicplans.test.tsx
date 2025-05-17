import { GET } from '@/app/api/plans/public/route';
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
      findMany: jest.fn(),
    },
  },
}));

describe('GET /api/plans/public', () => {
  const mockToken = 'test-token';
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockPublicPlans = [
    {
      id: 'plan-1',
      userId: 'user-1',
      title: '東京旅行',
      description: '東京観光プラン',
      date: '2024-01-01T00:00:00.000Z',
      region: 'tokyo',
      budget: 10000,
      isPublic: true,
      createdAt: '2025-04-20T01:47:14.359Z',
      updatedAt: '2025-04-20T01:47:14.359Z',
      locations: [],
      likes: [],
      profile: { name: 'ユーザー1' },
      _count: { likes: 0 },
    },
    {
      id: 'plan-2',
      userId: 'user-2',
      title: '大阪旅行',
      description: '大阪観光プラン',
      date: '2024-02-01T00:00:00.000Z',
      region: 'osaka',
      budget: 8000,
      isPublic: true,
      createdAt: '2025-04-20T01:47:14.359Z',
      updatedAt: '2025-04-20T01:47:14.359Z',
      locations: [],
      likes: [],
      profile: { name: 'ユーザー2' },
      _count: { likes: 0 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('公開プラン一覧を正常に取得', async () => {
    // Supabaseのモック設定
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    // Prismaのモック設定
    (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPublicPlans);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.data).toEqual(mockPublicPlans);

    // Prismaのクエリを確認
    expect(prisma.plan.findMany).toHaveBeenCalledWith({
      where: { isPublic: true },
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
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('認証トークンがない場合でも公開プランを取得できる', async () => {
    // Supabaseのモック設定
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Prismaのモック設定
    (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPublicPlans);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.data).toEqual(mockPublicPlans);
  });

  it('ユーザーが見つからない場合でも公開プランを取得できる', async () => {
    // Supabaseのモック設定
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('User not found'),
    });

    // Prismaのモック設定
    (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPublicPlans);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.data).toEqual(mockPublicPlans);
  });

  it('予期せぬエラーの場合、500エラーを返す', async () => {
    // Prismaのモック設定
    (prisma.plan.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await GET();
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('公開プランの取得に失敗しました');
  });
});
