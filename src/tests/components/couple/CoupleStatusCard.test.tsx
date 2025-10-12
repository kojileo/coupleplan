/**
 * CoupleStatusCard コンポーネント テスト
 *
 * テスト対象: src/components/couple/CoupleStatusCard.tsx
 * テスト計画: Docs/tests/TEST_CASES.md § カップル関連コンポーネント
 * 目標カバレッジ: 75%以上
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CoupleStatusCard from '@/components/couple/CoupleStatusCard';
import * as coupleUtils from '@/lib/couple-utils';

// モック
jest.mock('@/lib/couple-utils');

describe('CoupleStatusCard Component', () => {
  /**
   * TC-COUPLE-CARD-001: ローディング状態
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-COUPLE-CARD-001: ローディング状態', () => {
    it('ローディング中はスケルトンを表示する', () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // 完了しないPromise
      );

      render(<CoupleStatusCard />);

      const loadingElement = screen.getByRole('generic', { hidden: true });
      expect(loadingElement.className).toContain('animate-pulse');
    });
  });

  /**
   * TC-COUPLE-CARD-002: 未連携状態の表示
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-COUPLE-CARD-002: 未連携状態の表示', () => {
    it('カップル未連携の場合、適切なメッセージを表示する', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: false,
        partnerName: null,
      });

      render(<CoupleStatusCard />);

      await waitFor(() => {
        expect(screen.getByText('個人利用中')).toBeInTheDocument();
      });

      expect(screen.getByText('個人でプラン作成を楽しんでいます')).toBeInTheDocument();
      expect(screen.getByText('連携')).toBeInTheDocument();
    });

    it('連携ボタンが表示される', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: false,
        partnerName: null,
      });

      render(<CoupleStatusCard />);

      await waitFor(() => {
        const linkButton = screen.getByText('連携').closest('a');
        expect(linkButton).toHaveAttribute('href', '/dashboard/partner-linkage');
      });
    });
  });

  /**
   * TC-COUPLE-CARD-003: 連携済み状態の表示
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-COUPLE-CARD-003: 連携済み状態の表示', () => {
    it('カップル連携済みの場合、適切なメッセージを表示する', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: true,
        partnerName: '山田太郎',
      });

      render(<CoupleStatusCard />);

      await waitFor(() => {
        expect(screen.getByText('カップル連携中')).toBeInTheDocument();
      });

      expect(screen.getByText(/山田太郎さんと連携中/)).toBeInTheDocument();
      expect(screen.getByText('二人で一緒にプランを作成・編集できます')).toBeInTheDocument();
    });

    it('パートナー名がない場合、デフォルト表示する', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: true,
        partnerName: null,
      });

      render(<CoupleStatusCard />);

      await waitFor(() => {
        expect(screen.getByText(/パートナーさんと連携中/)).toBeInTheDocument();
      });
    });

    it('連携済みの場合、連携ボタンが表示されない', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue({
        isLinked: true,
        partnerName: '山田太郎',
      });

      render(<CoupleStatusCard />);

      await waitFor(() => {
        expect(screen.queryByText('連携')).not.toBeInTheDocument();
      });
    });
  });

  /**
   * TC-COUPLE-CARD-004: エラー処理
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-COUPLE-CARD-004: エラー処理', () => {
    it('ステータス取得エラー時は何も表示しない', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { container } = render(<CoupleStatusCard />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'カップル連携状態の取得エラー:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('nullステータスの場合は何も表示しない', async () => {
      (coupleUtils.getCoupleStatus as jest.Mock).mockResolvedValue(null);

      const { container } = render(<CoupleStatusCard />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });
});
