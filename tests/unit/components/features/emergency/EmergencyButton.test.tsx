import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { EmergencyButton } from '@/components/features/emergency/EmergencyButton';

// Mock子コンポーネント
jest.mock('@/components/features/emergency/ToiletFinder', () => ({
  ToiletFinder: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="toilet-finder" style={{ display: isOpen ? 'block' : 'none' }}>
      <button onClick={onClose}>Close Toilet Finder</button>
    </div>
  ),
}));

jest.mock('@/components/features/emergency/ConversationHelper', () => ({
  ConversationHelper: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="conversation-helper" style={{ display: isOpen ? 'block' : 'none' }}>
      <button onClick={onClose}>Close Conversation Helper</button>
    </div>
  ),
}));

describe('EmergencyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('緊急ヘルプボタンが正しく表示される', () => {
    render(<EmergencyButton />);

    const emergencyButton = screen.getByLabelText('緊急ヘルプメニュー');
    expect(emergencyButton).toBeInTheDocument();
    expect(emergencyButton).toHaveTextContent('🆘');
  });

  it('メインボタンをクリックするとメニューが表示される', async () => {
    render(<EmergencyButton />);

    const emergencyButton = screen.getByLabelText('緊急ヘルプメニュー');

    // 初期状態ではメニューが非表示
    expect(screen.queryByText('お手洗い検索')).not.toBeInTheDocument();
    expect(screen.queryByText('会話ネタ')).not.toBeInTheDocument();

    // ボタンをクリック
    fireEvent.click(emergencyButton);

    // メニューが表示される
    await waitFor(() => {
      expect(screen.getByText('お手洗い検索')).toBeInTheDocument();
      expect(screen.getByText('会話ネタ')).toBeInTheDocument();
    });
  });

  it('お手洗い検索ボタンをクリックするとToiletFinderモーダルが開く', async () => {
    render(<EmergencyButton />);

    const emergencyButton = screen.getByLabelText('緊急ヘルプメニュー');
    fireEvent.click(emergencyButton);

    await waitFor(() => {
      const toiletButton = screen.getByText('お手洗い検索');
      fireEvent.click(toiletButton);
    });

    // ToiletFinderモーダルが表示される
    await waitFor(() => {
      const toiletFinder = screen.getByTestId('toilet-finder');
      expect(toiletFinder).toBeVisible();
    });

    // メニューが閉じる
    expect(screen.queryByText('お手洗い検索')).not.toBeInTheDocument();
  });

  it('会話ネタボタンをクリックするとConversationHelperモーダルが開く', async () => {
    render(<EmergencyButton />);

    const emergencyButton = screen.getByLabelText('緊急ヘルプメニュー');
    fireEvent.click(emergencyButton);

    await waitFor(() => {
      const conversationButton = screen.getByText('会話ネタ');
      fireEvent.click(conversationButton);
    });

    // ConversationHelperモーダルが表示される
    await waitFor(() => {
      const conversationHelper = screen.getByTestId('conversation-helper');
      expect(conversationHelper).toBeVisible();
    });

    // メニューが閉じる
    expect(screen.queryByText('会話ネタ')).not.toBeInTheDocument();
  });

  it('モーダルが開いている状態で閉じるボタンをクリックすると正しく閉じる', async () => {
    render(<EmergencyButton />);

    const emergencyButton = screen.getByLabelText('緊急ヘルプメニュー');
    fireEvent.click(emergencyButton);

    // お手洗い検索モーダルを開く
    await waitFor(() => {
      const toiletButton = screen.getByText('お手洗い検索');
      fireEvent.click(toiletButton);
    });

    // モーダルが表示されることを確認
    await waitFor(() => {
      const toiletFinder = screen.getByTestId('toilet-finder');
      expect(toiletFinder).toBeVisible();
    });

    // 閉じるボタンをクリック
    const closeButton = screen.getByText('Close Toilet Finder');
    fireEvent.click(closeButton);

    // モーダルが閉じることを確認
    await waitFor(() => {
      const toiletFinder = screen.getByTestId('toilet-finder');
      expect(toiletFinder).not.toBeVisible();
    });
  });

  it('メインボタンクリック時にrotate-45クラスが適用される', async () => {
    render(<EmergencyButton />);

    const emergencyButton = screen.getByLabelText('緊急ヘルプメニュー');

    // 初期状態ではrotate-45クラスがない
    expect(emergencyButton).not.toHaveClass('rotate-45');

    // ボタンをクリック
    fireEvent.click(emergencyButton);

    // rotate-45クラスが適用される
    await waitFor(() => {
      expect(emergencyButton).toHaveClass('rotate-45');
    });

    // 再度クリックして閉じる
    fireEvent.click(emergencyButton);

    // rotate-45クラスが削除される
    await waitFor(() => {
      expect(emergencyButton).not.toHaveClass('rotate-45');
    });
  });
});
