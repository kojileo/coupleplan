/**
 * CoupleInviteBanner コンポーネント テスト
 *
 * テスト対象: src/components/couple/CoupleInviteBanner.tsx
 * テスト計画: Docs/tests/TEST_CASES.md § カップル関連コンポーネント
 * 目標カバレッジ: 75%以上
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CoupleInviteBanner from '@/components/couple/CoupleInviteBanner';
import * as coupleUtils from '@/lib/couple-utils';

// モック
jest.mock('@/lib/couple-utils', () => ({
  useCoupleStatus: jest.fn(),
  getCoupleStatus: jest.fn(),
  getCoupleInviteMessage: jest.fn(),
}));

describe('CoupleInviteBanner Component', () => {
  /**
   * TC-COUPLE-BANNER-001: 未連携時の表示（dashboard）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-COUPLE-BANNER-001: 未連携時の表示（dashboard）', () => {
    it('カップル未連携の場合、バナーが表示される', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: false,
      });

      (coupleUtils.getCoupleInviteMessage as jest.Mock).mockReturnValue({
        title: 'パートナーと連携して、もっと便利に！',
        description: '共同編集や思い出共有など、カップル専用の機能が解放されます。',
        buttonText: 'パートナーを招待する',
        icon: 'heart',
      });

      render(<CoupleInviteBanner context="dashboard" />);

      // 非同期で表示されるのを待つ
      await screen.findByText('パートナーと連携して、もっと便利に！');

      expect(screen.getByText('パートナーと連携して、もっと便利に！')).toBeInTheDocument();
      expect(
        screen.getByText('共同編集や思い出共有など、カップル専用の機能が解放されます。')
      ).toBeInTheDocument();
      expect(screen.getByText('パートナーを招待する')).toBeInTheDocument();
    });

    it('パートナー招待リンクが正しいhrefを持つ', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: false,
      });

      (coupleUtils.getCoupleInviteMessage as jest.Mock).mockReturnValue({
        title: 'パートナーと連携して、もっと便利に！',
        description: '共同編集や思い出共有など、カップル専用の機能が解放されます。',
        buttonText: 'パートナーを招待する',
        icon: 'heart',
      });

      render(<CoupleInviteBanner context="dashboard" />);

      await screen.findByText('パートナーを招待する');

      const link = screen.getByText('パートナーを招待する').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard/partner-linkage');
    });
  });

  /**
   * TC-COUPLE-BANNER-002: 未連携時の表示（plan-created）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-COUPLE-BANNER-002: 未連携時の表示（plan-created）', () => {
    it('プラン作成後のバナーが表示される', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: false,
      });

      (coupleUtils.getCoupleInviteMessage as jest.Mock).mockReturnValue({
        title: 'プランが完成しました！パートナーと共有しませんか？',
        description: 'このプランをパートナーと共同編集したり、二人の思い出として保存できます。',
        buttonText: 'パートナーと共有する',
        icon: 'share',
      });

      render(<CoupleInviteBanner context="plan-created" />);

      await screen.findByText('プランが完成しました！パートナーと共有しませんか？');

      expect(
        screen.getByText('プランが完成しました！パートナーと共有しませんか？')
      ).toBeInTheDocument();
      expect(
        screen.getByText('このプランをパートナーと共同編集したり、二人の思い出として保存できます。')
      ).toBeInTheDocument();
      expect(screen.getByText('パートナーと共有する')).toBeInTheDocument();
    });
  });

  /**
   * TC-COUPLE-BANNER-003: 連携済み時の非表示
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-COUPLE-BANNER-003: 連携済み時の非表示', () => {
    it('カップル連携済みの場合、バナーが表示されない', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: true,
      });

      (coupleUtils.getCoupleInviteMessage as jest.Mock).mockReturnValue({
        title: 'Test',
        description: 'Test',
        buttonText: 'Test',
        icon: 'heart',
      });

      const { container } = render(<CoupleInviteBanner context="dashboard" />);

      // 非同期処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(container.querySelector('a')).toBeNull();
    });
  });

  /**
   * TC-COUPLE-BANNER-004: コンテキスト別表示
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-COUPLE-BANNER-004: コンテキスト別表示', () => {
    it('getCoupleInviteMessageが正しいコンテキストで呼ばれる', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: false,
      });

      (coupleUtils.getCoupleInviteMessage as jest.Mock).mockReturnValue({
        title: 'Test Title',
        description: 'Test Description',
        buttonText: 'Test Button',
        icon: 'heart',
      });

      render(<CoupleInviteBanner context="dashboard" />);

      expect(coupleUtils.getCoupleInviteMessage).toHaveBeenCalledWith('dashboard');
    });
  });

  /**
   * TC-COUPLE-BANNER-005: エラー時の動作
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-COUPLE-BANNER-005: エラー時の動作', () => {
    it('エラーがある場合でもバナーを表示する', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockRejectedValue(new Error('Network error'));

      (coupleUtils.getCoupleInviteMessage as jest.Mock).mockReturnValue({
        title: 'パートナーと連携して、もっと便利に！',
        description: 'Test',
        buttonText: 'パートナーを招待する',
        icon: 'heart',
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<CoupleInviteBanner context="dashboard" />);

      // エラーがあってもバナーは表示される（未連携として扱う）
      await screen.findByText('パートナーと連携して、もっと便利に！');

      expect(screen.getByText('パートナーと連携して、もっと便利に！')).toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'カップル連携状態の確認エラー:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
