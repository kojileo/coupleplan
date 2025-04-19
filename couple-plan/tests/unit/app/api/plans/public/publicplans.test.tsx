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

  const mockPublicPlan = {
    id: 'plan-1',
    title: '公開テストプラン',
    description: '公開テスト説明',
    date: new Date('2024-01-01T00:00:00.000Z'),
    budget: 1000,
    region: 'tokyo',
    isPublic: true,
    userId: 'user-1',
    createdAt: new Date('2024-02-17T12:14:23.310Z'),
    updatedAt: new Date('2024-02-17T12:14:23.310Z'),
    profile: { name: 'テストユーザー' },
    locations: [
      {
        id: 'loc-1',
        url: 'https://example.com',
        name: '東京タワー',
        planId: 'plan-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
    likes: [],
    _count: { likes: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('公開プラン一覧を正常に取得', async () => {
    // Prismaのモック
    (prisma.plan.findMany as jest.Mock).mockResolvedValueOnce([mockPublicPlan]);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.data).toEqual([mockPublicPlan]);

    // Prismaのクエリを確認
    expect(prisma.plan.findMany).toHaveBeenCalledWith({
      where: { isPublic: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        profile: { select: { name: true } },
        locations: true,
        likes: true,
        _count: { select: { likes: true } },
      },
    });
  });

  it('認証トークンがない場合、401エラーを返す', async () => {
    const request = new NextRequest('http://localhost/api/plans/public');

    const response = await GET();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('認証が必要です');
  });

  it('ユーザーが見つからない場合、401エラーを返す', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('User not found'),
    });

    const request = new NextRequest('http://localhost/api/plans/public', {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });

    const response = await GET();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('認証が必要です');
  });

  it('予期せぬエラーの場合、500エラーを返す', async () => {
    (prisma.plan.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    const response = await GET();
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('公開プランの取得に失敗しました');
  });
});
