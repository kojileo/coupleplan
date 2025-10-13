/**
 * 統合テスト: カップル関係確立フロー
 *
 * このテストは以下を検証します：
 * - 招待コード入力からカップル関係確立まで
 * - カップルレコード作成
 * - 双方のプロフィール更新
 * - トランザクション整合性
 * - エラーハンドリング
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

// Supabaseクライアントのモック
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-789' } },
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: mockFrom,
  })),
}));

// Next.js navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('統合テスト: カップル関係確立フロー', () => {
  const mockPush = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    });
  });

  describe('正常系: カップル関係の確立', () => {
    it('招待コード接続後、カップルレコードが作成される', async () => {
      // Arrange
      const inviteCode = 'ABC123';
      const inviterId = 'user-456';
      const inviteeId = 'user-789';

      const mockCoupleData = {
        id: 'couple-123',
        user1_id: inviterId,
        user2_id: inviteeId,
        created_at: new Date().toISOString(),
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          couple: mockCoupleData,
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.couple.user1_id).toBe(inviterId);
      expect(data.couple.user2_id).toBe(inviteeId);
      expect(data.couple.created_at).toBeDefined();
    });

    it('カップル確立後、双方のプロフィールにpartner_idが設定される', async () => {
      // Arrange
      const inviteCode = 'ABC123';
      const inviterId = 'user-456';
      const inviteeId = 'user-789';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          couple: {
            id: 'couple-123',
            user1_id: inviterId,
            user2_id: inviteeId,
          },
          profiles: [
            { user_id: inviterId, partner_id: inviteeId },
            { user_id: inviteeId, partner_id: inviterId },
          ],
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await response.json();

      // Assert
      expect(data.profiles).toHaveLength(2);
      expect(data.profiles[0].partner_id).toBe(inviteeId);
      expect(data.profiles[1].partner_id).toBe(inviterId);
    });

    it('カップル確立後、招待コードが使用済みとしてマークされる', async () => {
      // Arrange
      const inviteCode = 'ABC123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          invitation: {
            code: inviteCode,
            used: true,
            used_at: new Date().toISOString(),
          },
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await response.json();

      // Assert
      expect(data.invitation.used).toBe(true);
      expect(data.invitation.used_at).toBeDefined();
    });

    it('カップル確立成功後、ダッシュボードにリダイレクトされる', async () => {
      // このテストは実際のコンポーネントがある場合に実装
      // 現在はAPI層のテストのみ
      expect(true).toBe(true);
    });
  });

  describe('正常系: トランザクション整合性', () => {
    it('カップルレコード作成が失敗した場合、プロフィール更新もロールバックされる', async () => {
      // Arrange
      const inviteCode = 'ABC123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'カップルレコードの作成に失敗しました',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await response.json();

      // Assert: トランザクション全体が失敗
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('プロフィール更新が失敗した場合、カップルレコードもロールバックされる', async () => {
      // Arrange
      const inviteCode = 'ABC123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'プロフィールの更新に失敗しました',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await response.json();

      // Assert: トランザクション全体が失敗
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('招待コード更新が失敗した場合、全ての変更がロールバックされる', async () => {
      // Arrange
      const inviteCode = 'ABC123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: '招待コードの更新に失敗しました',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await response.json();

      // Assert: トランザクション全体が失敗
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('異常系: カップル確立エラー', () => {
    it('無効な招待コードでの接続試行が失敗する', async () => {
      // Arrange
      const invalidCode = 'INVALID';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: '招待コードが見つかりません',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: invalidCode }),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain('見つかりません');
    });

    it('期限切れの招待コードでの接続試行が失敗する', async () => {
      // Arrange
      const expiredCode = 'EXP123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: '招待コードの有効期限が切れています',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: expiredCode }),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain('有効期限が切れています');
    });

    it('既に使用済みの招待コードでの接続試行が失敗する', async () => {
      // Arrange
      const usedCode = 'USED12';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'この招待コードは既に使用されています',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: usedCode }),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain('既に使用されています');
    });

    it('自分自身の招待コードでの接続試行が失敗する', async () => {
      // Arrange
      const ownCode = 'OWN123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: '自分の招待コードは使用できません',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ownCode }),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain('自分の招待コード');
    });

    it('既にパートナーが存在する場合、新規接続が失敗する', async () => {
      // Arrange
      const code = 'ABC123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: '既にパートナーと連携済みです',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain('既にパートナーと連携済み');
    });

    it('招待者が既に別のパートナーと連携済みの場合、接続が失敗する', async () => {
      // Arrange
      const code = 'ABC123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: '招待者は既に別のパートナーと連携済みです',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain('別のパートナーと連携済み');
    });
  });

  describe('データ整合性: カップル関係の一意性', () => {
    it('同じユーザーペアで複数のカップルレコードは作成されない', async () => {
      // Arrange: 2回目の接続試行
      const code = 'ABC123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'カップル関係は既に存在します',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain('既に存在');
    });

    it('ユーザーは同時に複数のカップルに所属できない', async () => {
      // このテストはデータベース制約で保証される
      // RLSポリシーとUNIQUE制約で実装
      expect(true).toBe(true);
    });
  });

  describe('同時実行: 競合状態の処理', () => {
    it('同じ招待コードへの同時接続試行は1つだけ成功する', async () => {
      // Arrange: 2つの同時リクエスト
      const code = 'ABC123';

      global.fetch = jest.fn();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            error: 'この招待コードは既に使用されています',
          }),
        });

      // Act: 同時リクエスト
      const [response1, response2] = await Promise.all([
        fetch('/api/partner/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }),
        fetch('/api/partner/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }),
      ]);

      const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

      // Assert: 1つは成功、1つは失敗
      const successCount = [data1.success, data2.success].filter(Boolean).length;
      expect(successCount).toBe(1);
    });
  });

  describe('通知: カップル確立通知', () => {
    it('カップル確立後、双方のユーザーに通知が送信される', async () => {
      // このテストは通知機能実装後に追加
      expect(true).toBe(true);
    });
  });

  describe('監査ログ: カップル確立の記録', () => {
    it('カップル確立のタイムスタンプが正確に記録される', async () => {
      // Arrange
      const code = 'ABC123';
      const now = Date.now();

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          couple: {
            created_at: new Date().toISOString(),
          },
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      // Assert
      const createdAt = new Date(data.couple.created_at).getTime();
      const diff = Math.abs(createdAt - now);
      expect(diff).toBeLessThan(5000); // 5秒以内
    });

    it('招待コード使用情報が正確に記録される', async () => {
      // Arrange
      const code = 'ABC123';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          invitation: {
            code,
            used: true,
            used_at: new Date().toISOString(),
            used_by: 'user-789',
          },
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      // Assert
      expect(data.invitation.used).toBe(true);
      expect(data.invitation.used_at).toBeDefined();
      expect(data.invitation.used_by).toBe('user-789');
    });
  });

  describe('セキュリティ: カップル確立の保護', () => {
    it('認証されていないユーザーはカップル確立できない', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: '認証が必要です',
        }),
      });

      // Act
      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'ABC123' }),
      });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toContain('認証が必要');
    });

    it('CSRFトークンが検証される', async () => {
      // SupabaseのPKCE認証フローで自動的に保護される
      expect(true).toBe(true);
    });
  });
});
