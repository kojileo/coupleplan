/**
 * プラン一覧取得API テスト
 *
 * テスト対象: src/app/api/plans/route.ts
 * テスト計画: Docs/tests/TEST_CASES.md § AIデートプラン機能
 * 目標カバレッジ: 80%以上
 */

import { NextRequest } from 'next/server';

import { GET } from '@/app/api/plans/route';

// createClientのモック
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

describe('/api/plans', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  /**
   * TC-PLANS-LIST-001: 正常なプラン一覧取得
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PLANS-LIST-001: 正常なプラン一覧取得', () => {
    it('認証済みユーザーがプラン一覧を取得できる', async () => {
      const mockUser = { id: 'test-user-id' };
      const mockPlans = [
        {
          id: 'plan-1',
          title: 'デートプラン1',
          created_by: 'test-user-id',
          couple_id: null,
          status: 'draft',
        },
        {
          id: 'plan-2',
          title: 'デートプラン2',
          created_by: 'test-user-id',
          couple_id: null,
          status: 'active',
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // couplesテーブルのクエリ
      const couplesQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      // date_plansテーブルのクエリ
      const plansQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockPlans,
          error: null,
          count: 2,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'couples') return couplesQuery;
        if (table === 'date_plans') return plansQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/plans');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.plans).toHaveLength(2);
      expect(data.total_count).toBe(2);
      expect(data.has_more).toBe(false);
    });

    it('カップル連携済みユーザーが個人プランとカップルプランを取得できる', async () => {
      const mockUser = { id: 'test-user-id' };
      const mockCouple = { id: 'couple-id' };
      const mockPlans = [
        {
          id: 'plan-1',
          title: '個人プラン',
          created_by: 'test-user-id',
          couple_id: null,
        },
        {
          id: 'plan-2',
          title: 'カップルプラン',
          created_by: 'test-user-id',
          couple_id: 'couple-id',
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const couplesQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: mockCouple, error: null }),
      };

      const plansQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockPlans,
          error: null,
          count: 2,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'couples') return couplesQuery;
        if (table === 'date_plans') return plansQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/plans');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.plans).toHaveLength(2);
    });
  });

  /**
   * TC-PLANS-LIST-002: 認証エラー
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PLANS-LIST-002: 認証エラー', () => {
    it('未認証ユーザーは401エラーを返す', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/plans');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });
  });

  /**
   * TC-PLANS-LIST-003: クエリパラメータ
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-PLANS-LIST-003: クエリパラメータ', () => {
    it('ステータスフィルターが正しく適用される', async () => {
      const mockUser = { id: 'test-user-id' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const couplesQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const plansQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'couples') return couplesQuery;
        if (table === 'date_plans') return plansQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/plans?status=active');
      await GET(request);

      expect(plansQuery.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('ページネーションパラメータが正しく適用される', async () => {
      const mockUser = { id: 'test-user-id' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const couplesQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const plansQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'couples') return couplesQuery;
        if (table === 'date_plans') return plansQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/plans?limit=10&offset=20');
      await GET(request);

      expect(plansQuery.range).toHaveBeenCalledWith(20, 29);
    });

    it('ソートパラメータが正しく適用される', async () => {
      const mockUser = { id: 'test-user-id' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const couplesQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const plansQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'couples') return couplesQuery;
        if (table === 'date_plans') return plansQuery;
        return {};
      });

      const request = new NextRequest(
        'http://localhost:3000/api/plans?sort_by=title&sort_order=asc'
      );
      await GET(request);

      expect(plansQuery.order).toHaveBeenCalledWith('title', { ascending: true });
    });
  });

  /**
   * TC-PLANS-LIST-004: データベースエラー
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-PLANS-LIST-004: データベースエラー', () => {
    it('プラン取得エラーの場合、500エラーを返す', async () => {
      const mockUser = { id: 'test-user-id' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const couplesQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const plansQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
          count: null,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'couples') return couplesQuery;
        if (table === 'date_plans') return plansQuery;
        return {};
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/plans');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('プランの取得に失敗しました');

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * TC-PLANS-LIST-005: 空のプラン一覧
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-PLANS-LIST-005: 空のプラン一覧', () => {
    it('プランが存在しない場合、空の配列を返す', async () => {
      const mockUser = { id: 'test-user-id' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const couplesQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const plansQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'couples') return couplesQuery;
        if (table === 'date_plans') return plansQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/plans');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.plans).toEqual([]);
      expect(data.total_count).toBe(0);
      expect(data.has_more).toBe(false);
    });
  });
});
