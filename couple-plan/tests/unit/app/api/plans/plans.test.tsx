import { GET, POST } from '@/app/api/plans/route';
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
      create: jest.fn(),
    },
  },
}));

// コンソールエラーをモック化
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('plans API', () => {
  const mockToken = 'test-token';
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockPlan = {
    id: 'plan-1',
    title: 'Test Plan',
    description: 'Test Description',
    date: '2024-01-01T00:00:00.000Z',
    location: 'Test Location',
    budget: 1000,
    isPublic: false,
    userId: mockUser.id,
    createdAt: '2024-02-17T12:14:23.310Z',
    updatedAt: '2024-02-17T12:14:23.310Z',
    profile: { name: 'Test User' },
    likes: [],
    _count: { likes: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans', () => {
    it('プラン一覧を正常に取得', async () => {
      // Supabaseの認証モック
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      // Prismaのモック
      (prisma.plan.findMany as jest.Mock).mockResolvedValueOnce([mockPlan]);

      const request = new NextRequest('http://localhost/api/plans', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toEqual([mockPlan]);

      // Prismaのクエリを確認
      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          profile: { select: { name: true } },
          likes: true,
          _count: { select: { likes: true } },
        },
      });
    });

    it('認証トークンがない場合、401エラーを返す', async () => {
      const request = new NextRequest('http://localhost/api/plans');

      const response = await GET(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('認証が必要です');
    });

    it('ユーザーが見つからない場合、401エラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: new Error('User not found'),
      });

      const request = new NextRequest('http://localhost/api/plans', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('認証が必要です');
    });

    it('Supabaseエラーの場合、401エラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Supabase error'),
      });

      const request = new NextRequest('http://localhost/api/plans', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('認証が必要です');
    });

    it('Prismaエラーの場合、500エラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });
      (prisma.plan.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/plans', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe('プランの取得に失敗しました');
      expect(console.error).toHaveBeenCalledWith('プラン取得エラー:', expect.any(Error));
    });

    it('非Errorオブジェクトのエラーの場合も適切に処理される', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });
      (prisma.plan.findMany as jest.Mock).mockRejectedValueOnce('文字列エラー');

      const request = new NextRequest('http://localhost/api/plans', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe('プランの取得に失敗しました');
      expect(console.error).toHaveBeenCalledWith('プラン取得エラー:', expect.any(Error));
    });
  });

  describe('POST /api/plans', () => {
    it('プランを正常に作成', async () => {
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
            url: 'https://example.com/tokyo-tower',
            address: '東京都港区芝公園4-2-8',
            latitude: 35.6585805,
            longitude: 139.7454329,
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

      // レスポンスの検証
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
            name: '東京タワー',
            url: 'https://example.com/tokyo-tower',
            address: '東京都港区芝公園4-2-8',
            latitude: 35.6585805,
            longitude: 139.7454329,
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
});
