import { NextRequest } from 'next/server';
import { GET } from '@/app/api/plans/public/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    plan: {
      findMany: jest.fn(),
    },
  },
}));

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

describe('公開プランAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans/public', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/public');

      // APIエンドポイントの呼び出し
      const res = await GET();
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('公開プラン一覧を返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
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

      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Prismaのモック設定
      (prisma.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/public', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

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
