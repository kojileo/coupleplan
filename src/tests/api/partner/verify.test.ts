/**
 * パートナー連携検証API テスト
 *
 * テスト対象: src/app/api/partner/verify/route.ts
 * テスト計画: Docs/tests/TEST_CASES.md § パートナー連携機能
 * 目標カバレッジ: 80%以上
 */

import { POST } from '@/app/api/partner/verify/route';
import { NextRequest } from 'next/server';
import * as supabaseAuth from '@/lib/supabase-auth';
import * as partnerLinkage from '@/lib/partner-linkage';

// モック
jest.mock('@/lib/partner-linkage');

describe('/api/partner/verify', () => {
  const mockToken = 'test-auth-token';
  const mockUserId = 'test-user-id';
  const mockInvitationCode = 'ABC123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-PARTNER-VERIFY-001: 正常な招待コード検証
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PARTNER-VERIFY-001: 正常な招待コード検証', () => {
    it('有効な招待コードを検証できる', async () => {
      const mockResult = {
        success: true,
        invitationId: 'invitation-id',
        fromUserId: 'from-user-id',
        fromUserName: 'Partner Name',
        fromUserEmail: 'partner@example.com',
        fromUserAvatar: null,
      };

      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.verifyPartnerInvitation as jest.Mock).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationCode: mockInvitationCode,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.invitationId).toBe('invitation-id');
      expect(data.fromUserId).toBe('from-user-id');
      expect(data.fromUserName).toBe('Partner Name');
      expect(data.fromUserEmail).toBe('partner@example.com');
      expect(data.message).toContain('検証');
      expect(partnerLinkage.verifyPartnerInvitation).toHaveBeenCalledWith(
        mockInvitationCode,
        mockUserId,
        mockToken
      );
    });
  });

  /**
   * TC-PARTNER-VERIFY-002: 認証エラー
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PARTNER-VERIFY-002: 認証エラー', () => {
    it('認証ヘッダーがない場合、401エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        body: JSON.stringify({
          invitationCode: mockInvitationCode,
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

      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        body: JSON.stringify({
          invitationCode: mockInvitationCode,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });
  });

  /**
   * TC-PARTNER-VERIFY-003: 無効なリクエストデータ
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PARTNER-VERIFY-003: 無効なリクエストデータ', () => {
    it('招待コードが欠けている場合、400エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('連携コードが必要です');
    });

    it('空の招待コードの場合、400エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationCode: '',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('連携コードが必要です');
    });
  });

  /**
   * TC-PARTNER-VERIFY-004: 検証エラー
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-PARTNER-VERIFY-004: 検証エラー', () => {
    it('無効な招待コードの場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.verifyPartnerInvitation as jest.Mock).mockResolvedValue({
        success: false,
        error: '無効な連携コードです',
      });

      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationCode: 'INVALID',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('無効な連携コードです');
    });

    it('期限切れの招待コードの場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.verifyPartnerInvitation as jest.Mock).mockResolvedValue({
        success: false,
        error: '連携コードの有効期限が切れています',
      });

      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationCode: mockInvitationCode,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('有効期限');
    });

    it('自分自身の招待コードの場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.verifyPartnerInvitation as jest.Mock).mockResolvedValue({
        success: false,
        error: '自分自身の連携コードは使用できません',
      });

      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationCode: mockInvitationCode,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('自分自身');
    });
  });

  /**
   * TC-PARTNER-VERIFY-005: サーバーエラー処理
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-PARTNER-VERIFY-005: サーバーエラー処理', () => {
    it('予期しないエラーの場合、500エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.verifyPartnerInvitation as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/partner/verify', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          invitationCode: mockInvitationCode,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('エラーが発生しました');
      expect(consoleErrorSpy).toHaveBeenCalledWith('連携検証エラー:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});
