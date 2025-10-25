/**
 * パートナー連携確立API テスト
 *
 * テスト対象: src/app/api/partner/connect/route.ts
 * テスト計画: Docs/tests/TEST_CASES.md § パートナー連携機能
 * 目標カバレッジ: 80%以上
 */

import { NextRequest } from 'next/server';

import { POST } from '@/app/api/partner/connect/route';
import * as partnerLinkage from '@/lib/partner-linkage';
import * as supabaseAuth from '@/lib/supabase-auth';

// モック
jest.mock('@/lib/partner-linkage');

describe('/api/partner/connect', () => {
  const mockToken = 'test-auth-token';
  const mockToUserId = 'to-user-id';
  const mockFromUserId = 'from-user-id';
  const mockInvitationId = 'invitation-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-PARTNER-CONNECT-001: 正常なカップル連携
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PARTNER-CONNECT-001: 正常なカップル連携', () => {
    it('有効な招待でカップル連携が確立される', async () => {
      const mockResult = {
        success: true,
        coupleId: 'couple-id',
      };

      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockToUserId } },
        error: null,
      });

      (partnerLinkage.createCouple as jest.Mock).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationId: mockInvitationId,
          fromUserId: mockFromUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.coupleId).toBe('couple-id');
      expect(data.message).toContain('連携が完了');
      expect(partnerLinkage.createCouple).toHaveBeenCalledWith(
        mockInvitationId,
        mockFromUserId,
        mockToUserId,
        mockToken
      );
    });
  });

  /**
   * TC-PARTNER-CONNECT-002: 認証エラー
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PARTNER-CONNECT-002: 認証エラー', () => {
    it('認証ヘッダーがない場合、401エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        body: JSON.stringify({
          invitationId: mockInvitationId,
          fromUserId: mockFromUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });

    it('無効なトークンの場合、401エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        body: JSON.stringify({
          invitationId: mockInvitationId,
          fromUserId: mockFromUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });
  });

  /**
   * TC-PARTNER-CONNECT-003: 無効なリクエストデータ
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PARTNER-CONNECT-003: 無効なリクエストデータ', () => {
    it('invitationIdが欠けている場合、400エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockToUserId } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          fromUserId: mockFromUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('招待IDとユーザーIDが必要です');
    });

    it('fromUserIdが欠けている場合、400エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockToUserId } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationId: mockInvitationId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('招待IDとユーザーIDが必要です');
    });

    it('両方のIDが欠けている場合、400エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockToUserId } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('招待IDとユーザーIDが必要です');
    });
  });

  /**
   * TC-PARTNER-CONNECT-004: 連携確立エラー
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-PARTNER-CONNECT-004: 連携確立エラー', () => {
    it('既に連携済みの場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockToUserId } },
        error: null,
      });

      (partnerLinkage.createCouple as jest.Mock).mockResolvedValue({
        success: false,
        error: '既にパートナーと連携しています',
      });

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationId: mockInvitationId,
          fromUserId: mockFromUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('既にパートナーと連携しています');
    });

    it('招待が存在しない場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockToUserId } },
        error: null,
      });

      (partnerLinkage.createCouple as jest.Mock).mockResolvedValue({
        success: false,
        error: '招待が見つかりません',
      });

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationId: 'invalid-id',
          fromUserId: mockFromUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('招待が見つかりません');
    });

    it('招待が既に使用されている場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockToUserId } },
        error: null,
      });

      (partnerLinkage.createCouple as jest.Mock).mockResolvedValue({
        success: false,
        error: 'この招待は既に使用されています',
      });

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationId: mockInvitationId,
          fromUserId: mockFromUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('使用されています');
    });
  });

  /**
   * TC-PARTNER-CONNECT-005: サーバーエラー処理
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-PARTNER-CONNECT-005: サーバーエラー処理', () => {
    it('予期しないエラーの場合、500エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockToUserId } },
        error: null,
      });

      (partnerLinkage.createCouple as jest.Mock).mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/partner/connect', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationId: mockInvitationId,
          fromUserId: mockFromUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('エラーが発生しました');
      expect(consoleErrorSpy).toHaveBeenCalledWith('カップル連携エラー:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});
