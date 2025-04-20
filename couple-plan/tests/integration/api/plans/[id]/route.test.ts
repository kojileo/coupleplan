import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/plans/[id]/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    plan: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

describe('プラン詳細API統合テスト', () => {
  const mockParams = {
    params: Promise.resolve({ id: 'plan-123' }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans/[id]', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123');

      // APIエンドポイントの呼び出し
      const res = await GET(req, mockParams);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('プランが存在しない場合は404エラーを返す', async () => {
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Prismaのモック設定
      (prisma.plan.findFirst as jest.Mock).mockResolvedValue(null);

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      // APIエンドポイントの呼び出し
      const res = await GET(req, mockParams);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'プランが見つかりません' });
    });

    it('自分のプランを取得できる', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const mockPlan = {
        id: 'plan-123',
        title: 'テストプラン',
        userId: mockUser.id,
        isPublic: false,
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
      (prisma.plan.findFirst as jest.Mock).mockResolvedValue(mockPlan);

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      // APIエンドポイントの呼び出し
      const res = await GET(req, mockParams);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: mockPlan });

      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.plan.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'plan-123',
          OR: [{ userId: mockUser.id }, { isPublic: true }],
        },
        include: {
          profile: { select: { name: true } },
          likes: true,
          _count: { select: { likes: true } },
        },
      });
    });

    it('公開プランを取得できる', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const mockPlan = {
        id: 'plan-123',
        title: 'テストプラン',
        userId: 'other-user-id',
        isPublic: true,
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
      (prisma.plan.findFirst as jest.Mock).mockResolvedValue(mockPlan);

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      // APIエンドポイントの呼び出し
      const res = await GET(req, mockParams);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: mockPlan });
    });
  });

  describe('PUT /api/plans/[id]', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      // APIエンドポイントの呼び出し
      const res = await PUT(req, mockParams);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('プランを更新して返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      const testDate = new Date('2024-03-20');
      const testDateString = testDate.toISOString();

      // リクエストデータ（文字列化された日付を使用）
      const planData = {
        title: '更新されたプラン',
        description: '更新された説明',
        date: testDateString,
        location: '大阪',
        budget: 10000,
        isPublic: true,
      };

      // レスポンスデータ
      const updatedPlan = {
        ...planData,
        id: 'plan-123',
        userId: mockUser.id,
      };

      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Prismaのモック設定
      (prisma.plan.update as jest.Mock).mockResolvedValue(updatedPlan);

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      // APIエンドポイントの呼び出し
      const res = await PUT(req, mockParams);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: updatedPlan });

      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.plan.update).toHaveBeenCalledWith({
        where: {
          id: 'plan-123',
          userId: mockUser.id,
        },
        data: planData,
      });
    });
  });

  describe('DELETE /api/plans/[id]', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123', {
        method: 'DELETE',
      });

      // APIエンドポイントの呼び出し
      const res = await DELETE(req, mockParams);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('プランを削除して成功を返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };

      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Prismaのモック設定
      (prisma.plan.delete as jest.Mock).mockResolvedValue({});

      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/plans/plan-123', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      // APIエンドポイントの呼び出し
      const res = await DELETE(req, mockParams);
      const data = await res.json();

      // レスポンスの検証
      expect(res.status).toBe(200);
      expect(data).toEqual({ data: { success: true } });

      // Prismaが正しいパラメータで呼び出されたか検証
      expect(prisma.plan.delete).toHaveBeenCalledWith({
        where: {
          id: 'plan-123',
          userId: mockUser.id,
        },
      });
    });
  });
});
