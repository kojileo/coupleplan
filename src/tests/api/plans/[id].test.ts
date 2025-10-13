/**
 * プラン詳細API テスト
 *
 * テスト対象: src/app/api/plans/[id]/route.ts
 * テスト計画: Docs/tests/TEST_CASES.md § AIデートプラン機能
 * 目標カバレッジ: 80%以上
 */

import { GET, PUT, DELETE } from '@/app/api/plans/[id]/route';
import { NextRequest } from 'next/server';

// createClientのモック
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

describe('/api/plans/[id]', () => {
  let mockSupabase: any;
  const mockPlanId = 'test-plan-id';
  const mockUserId = 'test-user-id';

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
   * TC-PLANS-DETAIL-001: 正常なプラン詳細取得
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('GET - TC-PLANS-DETAIL-001: 正常なプラン詳細取得', () => {
    it('個人プランの詳細を取得できる', async () => {
      const mockPlan = {
        id: mockPlanId,
        title: 'テストプラン',
        created_by: mockUserId,
        couple_id: null,
        status: 'draft',
      };

      const mockItems = [
        { id: 'item-1', plan_id: mockPlanId, order_index: 0 },
        { id: 'item-2', plan_id: mockPlanId, order_index: 1 },
      ];

      const mockFeedback: unknown[] = [];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'date_plans') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
          };
        }
        if (table === 'plan_items') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
          };
        }
        if (table === 'plan_feedback') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockFeedback, error: null }),
          };
        }
        return {};
      });

      const request = new NextRequest(`http://localhost:3000/api/plans/${mockPlanId}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(mockPlanId);
      expect(data.items).toHaveLength(2);
      expect(data.feedback).toEqual([]);
    });

    it('カップルプランの詳細を取得できる', async () => {
      const mockCoupleId = 'couple-id';
      const mockPlan = {
        id: mockPlanId,
        title: 'カップルプラン',
        created_by: mockUserId,
        couple_id: mockCoupleId,
        status: 'active',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const planQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
      };

      const coupleQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: mockCoupleId, user1_id: mockUserId },
          error: null,
        }),
      };

      const itemsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      const feedbackQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'date_plans') return planQuery;
        if (table === 'couples') return coupleQuery;
        if (table === 'plan_items') return itemsQuery;
        if (table === 'plan_feedback') return feedbackQuery;
        return {};
      });

      const request = new NextRequest(`http://localhost:3000/api/plans/${mockPlanId}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.couple_id).toBe(mockCoupleId);
    });
  });

  /**
   * TC-PLANS-DETAIL-002: アクセス権限エラー
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('GET - TC-PLANS-DETAIL-002: アクセス権限エラー', () => {
    it('他人の個人プランにアクセスできない', async () => {
      const mockPlan = {
        id: mockPlanId,
        created_by: 'other-user-id',
        couple_id: null,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
      });

      const request = new NextRequest(`http://localhost:3000/api/plans/${mockPlanId}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('アクセス権限がありません');
    });

    it('カップルメンバーでない場合、カップルプランにアクセスできない', async () => {
      const mockCoupleId = 'couple-id';
      const mockPlan = {
        id: mockPlanId,
        created_by: 'other-user-id',
        couple_id: mockCoupleId,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const planQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
      };

      const coupleQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'date_plans') return planQuery;
        if (table === 'couples') return coupleQuery;
        return {};
      });

      const request = new NextRequest(`http://localhost:3000/api/plans/${mockPlanId}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('アクセス権限がありません');
    });
  });

  /**
   * TC-PLANS-DETAIL-003: プランが見つからない
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('GET - TC-PLANS-DETAIL-003: プランが見つからない', () => {
    it('存在しないプランIDの場合、404エラーを返す', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      });

      const request = new NextRequest(`http://localhost:3000/api/plans/${mockPlanId}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('プランが見つかりません');
    });
  });

  /**
   * TC-PLANS-DETAIL-004: プラン更新
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('PUT - TC-PLANS-DETAIL-004: プラン更新', () => {
    it('個人プランを更新できる', async () => {
      const mockPlan = {
        id: mockPlanId,
        title: '元のタイトル',
        created_by: mockUserId,
        couple_id: null,
      };

      const updatedPlan = {
        ...mockPlan,
        title: '新しいタイトル',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const planQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
      };

      const updateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedPlan, error: null }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'date_plans' && !mockSupabase.from.mock.calls.length) {
          return planQuery;
        }
        return updateQuery;
      });

      const request = new NextRequest(`http://localhost:3000/api/plans/${mockPlanId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: '新しいタイトル' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: mockPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('新しいタイトル');
    });
  });

  /**
   * TC-PLANS-DETAIL-005: プラン削除
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('DELETE - TC-PLANS-DETAIL-005: プラン削除', () => {
    it('自分が作成したプランを削除できる', async () => {
      const mockPlan = {
        id: mockPlanId,
        created_by: mockUserId,
        couple_id: null,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      let callCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        callCount++;
        if (table === 'date_plans') {
          if (callCount === 1) {
            // 最初の呼び出し: プラン取得
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
            };
          } else {
            // 2回目の呼び出し: 削除
            return {
              delete: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({ error: null }),
            };
          }
        }
        return {};
      });

      const request = new NextRequest(`http://localhost:3000/api/plans/${mockPlanId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: mockPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
