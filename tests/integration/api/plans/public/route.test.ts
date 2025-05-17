import { NextRequest } from 'next/server';
import { GET } from '@/app/api/plans/public/route';
import { prisma } from '@/lib/db';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    plan: {
      findMany: jest.fn(),
    },
  },
}));

describe('公開プランAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans/public', () => {
    it('公開プラン一覧を返す', async () => {
      // モックデータの設定
      const mockPlans = [
        {
          id: 'plan-1',
          title: '公開テストプラン1',
          userId: 'other-user-1',
          isPublic: true,
          profile: { name: 'ユーザー1' },
          likes: [],
          _count: { likes: 0 },
        },
        {
          id: 'plan-2',
          title: '公開テストプラン2',
          userId: 'other-user-2',
          isPublic: true,
          profile: { name: 'ユーザー2' },
          likes: [],
          _count: { likes: 0 },
        },
      ];

      // Prismaのモック設定
      (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      // APIエンドポイントの呼び出し
      const res = await GET();
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: mockPlans });

      // Prismaが正しいパラメータで呼び出されたか検証
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
  });
});
