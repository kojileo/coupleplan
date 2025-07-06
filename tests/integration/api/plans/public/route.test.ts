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
    it('公開プラン一覧を返す（管理者プランとユーザープランを含む）', async () => {
      // モックデータの設定
      const mockPlans = [
        {
          id: 'admin-plan-1',
          title: '初デート成功の心理学戦略プラン【渋谷編】',
          description: '心理学に基づいた初デートの成功確率を最大化するプラン',
          region: 'tokyo',
          budget: 12000,
          category: '定番デート',
          isPublic: true,
          isRecommended: true,
          userId: 'admin-user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          profile: {
            name: '管理者',
            isAdmin: true,
          },
          locations: [],
          likes: [],
          _count: { likes: 15 },
        },
        {
          id: 'user-plan-1',
          title: '横浜デートプラン',
          description: '横浜でのロマンチックなデートプラン',
          region: 'yokohama',
          budget: 8000,
          category: '観光',
          isPublic: true,
          isRecommended: false,
          userId: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          profile: {
            name: 'カップルA',
            isAdmin: false,
          },
          locations: [],
          likes: [],
          _count: { likes: 5 },
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
        orderBy: [{ isRecommended: 'desc' }, { updatedAt: 'desc' }],
        include: {
          profile: {
            select: {
              name: true,
              isAdmin: true,
            },
          },
          locations: true,
          likes: true,
          _count: { select: { likes: true } },
        },
      });
    });

    it('管理者プランが優先的にソートされる', async () => {
      const mockPlans = [
        {
          id: 'user-plan-1',
          title: 'ユーザープラン1',
          isRecommended: false,
          isPublic: true,
          updatedAt: '2024-01-02',
          profile: { name: 'ユーザー1', isAdmin: false },
          locations: [],
          likes: [],
          _count: { likes: 2 },
        },
        {
          id: 'admin-plan-1',
          title: '専門家プラン1',
          isRecommended: true,
          isPublic: true,
          updatedAt: '2024-01-01',
          profile: { name: '管理者', isAdmin: true },
          locations: [],
          likes: [],
          _count: { likes: 10 },
        },
      ];

      (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toEqual(mockPlans);

      // isRecommendedとupdatedAtの降順でソートされることを検証
      expect(prisma.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ isRecommended: 'desc' }, { updatedAt: 'desc' }],
        })
      );
    });

    it('空の配列を返す場合', async () => {
      (prisma.plan.findMany as jest.Mock).mockResolvedValue([]);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ data: [] });
    });

    it('データベースエラー時に500エラーを返す', async () => {
      (prisma.plan.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: '公開プランの取得に失敗しました' });
    });

    it('プロファイル情報が正しく含まれている', async () => {
      const mockPlans = [
        {
          id: 'admin-plan-1',
          title: '恋愛心理学プラン',
          isPublic: true,
          isRecommended: true,
          profile: {
            name: '恋愛カウンセラー',
            isAdmin: true,
          },
          locations: [
            {
              id: 'loc-1',
              name: '渋谷スカイ',
              url: 'https://www.shibuya-sky.com/',
            },
          ],
          likes: [
            { id: 'like-1', userId: 'user-1' },
            { id: 'like-2', userId: 'user-2' },
          ],
          _count: { likes: 2 },
        },
      ];

      (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data[0].profile.isAdmin).toBe(true);
      expect(data.data[0].profile.name).toBe('恋愛カウンセラー');
      expect(data.data[0].locations).toHaveLength(1);
      expect(data.data[0].likes).toHaveLength(2);
      expect(data.data[0]._count.likes).toBe(2);
    });

    it('専門性の高いプランコンテンツが含まれている', async () => {
      const mockPlans = [
        {
          id: 'expert-plan-1',
          title: '関係性深化の鎌倉マインドフルネスデート',
          description:
            '恋愛関係を深めるための心理学的アプローチを取り入れた鎌倉デート。マインドフルネス技法を活用し、相手への集中力を高める5つのポイント',
          region: 'yokohama',
          budget: 8000,
          category: '観光',
          isPublic: true,
          isRecommended: true,
          profile: {
            name: 'カップルセラピスト',
            isAdmin: true,
          },
          locations: [
            {
              name: '建長寺（マインドフルネス実践・心理的安定効果）',
              url: 'https://www.kenchoji.com/',
            },
          ],
          likes: [],
          _count: { likes: 25 },
        },
      ];

      (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data[0].description).toContain('心理学的アプローチ');
      expect(data.data[0].description).toContain('マインドフルネス技法');
      expect(data.data[0].locations[0].name).toContain('心理的安定効果');
      expect(data.data[0].profile.isAdmin).toBe(true);
    });
  });
});
