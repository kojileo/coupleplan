/**
 * パートナー連携招待API テスト
 *
 * テスト対象: src/app/api/partner/invite/route.ts
 * テスト計画: Docs/tests/TEST_CASES.md § パートナー連携機能
 * 目標カバレッジ: 80%以上
 */

import { NextRequest } from 'next/server';

import { POST } from '@/app/api/partner/invite/route';
import * as partnerLinkage from '@/lib/partner-linkage';
import * as supabaseAuth from '@/lib/supabase-auth';

// モック
jest.mock('@/lib/partner-linkage');

describe('/api/partner/invite', () => {
  const mockToken = 'test-auth-token';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-PARTNER-INVITE-001: 正常な招待コード生成
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PARTNER-INVITE-001: 正常な招待コード生成', () => {
    it('認証済みユーザーが招待コードを生成できる', async () => {
      const mockResult = {
        success: true,
        invitationCode: 'ABC123',
        invitationId: 'invitation-id',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.createPartnerInvitation as jest.Mock).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/partner/invite', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.invitationCode).toBe('ABC123');
      expect(data.invitationId).toBe('invitation-id');
      expect(data.expiresAt).toBeDefined();
      expect(data.message).toContain('連携コード');
      expect(partnerLinkage.createPartnerInvitation).toHaveBeenCalledWith(mockUserId, mockToken);
    });
  });

  /**
   * TC-PARTNER-INVITE-002: 認証エラー
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-PARTNER-INVITE-002: 認証エラー', () => {
    it('認証ヘッダーがない場合、401エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/partner/invite', {
        method: 'POST',
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

      const request = new NextRequest('http://localhost:3000/api/partner/invite', {
        method: 'POST',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });

    it('ユーザーが存在しない場合、401エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/partner/invite', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });
  });

  /**
   * TC-PARTNER-INVITE-003: 招待作成エラー
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-PARTNER-INVITE-003: 招待作成エラー', () => {
    it('既に連携済みの場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.createPartnerInvitation as jest.Mock).mockResolvedValue({
        success: false,
        error: '既にパートナーと連携しています',
      });

      const request = new NextRequest('http://localhost:3000/api/partner/invite', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('既にパートナーと連携しています');
    });

    it('既存の招待が存在する場合、エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.createPartnerInvitation as jest.Mock).mockResolvedValue({
        success: false,
        error: '既に有効な招待コードが存在します',
      });

      const request = new NextRequest('http://localhost:3000/api/partner/invite', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('招待コード');
    });
  });

  /**
   * TC-PARTNER-INVITE-004: サーバーエラー処理
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-PARTNER-INVITE-004: サーバーエラー処理', () => {
    it('予期しないエラーの場合、500エラーを返す', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.createPartnerInvitation as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/partner/invite', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('エラーが発生しました');
      expect(consoleErrorSpy).toHaveBeenCalledWith('連携招待作成エラー:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * TC-PARTNER-INVITE-005: トークン形式
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-PARTNER-INVITE-005: トークン形式', () => {
    it('Bearer形式のトークンを正しく処理する', async () => {
      (supabaseAuth.supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      (partnerLinkage.createPartnerInvitation as jest.Mock).mockResolvedValue({
        success: true,
        invitationCode: 'ABC123',
        invitationId: 'invitation-id',
        expiresAt: new Date().toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/partner/invite', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      });

      await POST(request);

      expect(supabaseAuth.supabase.auth.getUser).toHaveBeenCalledWith(mockToken);
    });
  });
});
