import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { EmergencyButton } from '@/components/features/emergency/EmergencyButton';

// 子コンポーネントを実際に動作させるためのモック（軽量版）
jest.mock('@/components/features/emergency/ToiletFinder', () => ({
  ToiletFinder: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="toilet-finder-modal">
        <h2>お手洗い検索</h2>
        <button onClick={onClose}>閉じる</button>
      </div>
    ) : null,
}));

jest.mock('@/components/features/emergency/ConversationHelper', () => ({
  ConversationHelper: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="conversation-helper-modal">
        <h2>会話ネタ</h2>
        <button onClick={onClose}>閉じる</button>
      </div>
    ) : null,
}));

jest.mock('@/components/WeatherOutfitCard', () => ({
  WeatherOutfitCard: () => (
    <div data-testid="weather-outfit-content">
      <h3>今日の天気</h3>
      <p>東京: 晴れ、25°C</p>
      <h4>おすすめの服装</h4>
      <ul>
        <li>薄手のTシャツ</li>
        <li>ショートパンツ</li>
        <li>サンダル</li>
      </ul>
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  X: () => <span>×</span>,
}));

describe('EmergencyButton - 天気・服装機能統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SOS機能から天気・服装モーダルを開閉できる（フルフロー）', async () => {
    render(<EmergencyButton />);

    // 1. 初期状態：メニューが非表示
    expect(screen.queryByText('天気・服装')).not.toBeInTheDocument();
    expect(screen.queryByText('今日の天気')).not.toBeInTheDocument();

    // 2. SOSボタンをクリックしてメニューを開く
    const sosButton = screen.getByLabelText('緊急ヘルプメニュー');
    fireEvent.click(sosButton);

    // 3. メニューに3つのオプションが表示される
    await waitFor(() => {
      expect(screen.getByText('天気・服装')).toBeInTheDocument();
      expect(screen.getByText('お手洗い検索')).toBeInTheDocument();
      expect(screen.getByText('会話ネタ')).toBeInTheDocument();
    });

    // 4. 天気・服装ボタンをクリック
    const weatherButton = screen.getByText('天気・服装');
    fireEvent.click(weatherButton);

    // 5. 天気・服装モーダルが開く
    await waitFor(() => {
      expect(screen.getByText('今日の天気と服装')).toBeInTheDocument();
      expect(screen.getByTestId('weather-outfit-content')).toBeInTheDocument();
    });

    // 6. メニューが自動的に閉じる
    expect(screen.queryByText('天気・服装')).not.toBeInTheDocument();

    // 7. 天気情報と服装提案が表示される
    expect(screen.getByText('今日の天気')).toBeInTheDocument();
    expect(screen.getByText('東京: 晴れ、25°C')).toBeInTheDocument();
    expect(screen.getByText('おすすめの服装')).toBeInTheDocument();
    expect(screen.getByText('薄手のTシャツ')).toBeInTheDocument();

    // 8. ×ボタンでモーダルを閉じる
    const closeButton = screen.getByLabelText('閉じる');
    fireEvent.click(closeButton);

    // 9. モーダルが閉じる
    await waitFor(() => {
      expect(screen.queryByText('今日の天気と服装')).not.toBeInTheDocument();
      expect(screen.queryByTestId('weather-outfit-content')).not.toBeInTheDocument();
    });
  });

  it('天気・服装モーダルからフッターボタンで閉じることができる', async () => {
    render(<EmergencyButton />);

    // SOSボタン → メニュー → 天気・服装ボタン
    const sosButton = screen.getByLabelText('緊急ヘルプメニュー');
    fireEvent.click(sosButton);

    await waitFor(() => {
      const weatherButton = screen.getByText('天気・服装');
      fireEvent.click(weatherButton);
    });

    // モーダルが開いていることを確認
    await waitFor(() => {
      expect(screen.getByText('今日の天気と服装')).toBeInTheDocument();
    });

    // フッターの閉じるボタンをクリック（テキストが「閉じる」のボタン）
    const footerCloseButton = screen.getByText('閉じる');
    fireEvent.click(footerCloseButton);

    // モーダルが閉じることを確認
    await waitFor(() => {
      expect(screen.queryByText('今日の天気と服装')).not.toBeInTheDocument();
    });
  });

  it('複数のSOS機能を順番に使用できる', async () => {
    render(<EmergencyButton />);

    const sosButton = screen.getByLabelText('緊急ヘルプメニュー');

    // 1. 天気・服装モーダルを開く
    fireEvent.click(sosButton);
    await waitFor(() => {
      const weatherButton = screen.getByText('天気・服装');
      fireEvent.click(weatherButton);
    });

    await waitFor(() => {
      expect(screen.getByText('今日の天気と服装')).toBeInTheDocument();
    });

    // 天気・服装モーダルを閉じる
    const closeButton = screen.getByLabelText('閉じる');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('今日の天気と服装')).not.toBeInTheDocument();
    });

    // 2. お手洗い検索モーダルを開く
    fireEvent.click(sosButton);
    await waitFor(() => {
      const toiletButton = screen.getByText('お手洗い検索');
      fireEvent.click(toiletButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('toilet-finder-modal')).toBeInTheDocument();
    });

    // お手洗い検索モーダルを閉じる
    const toiletCloseButton = screen.getByText('閉じる');
    fireEvent.click(toiletCloseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('toilet-finder-modal')).not.toBeInTheDocument();
    });

    // 3. 再び天気・服装モーダルを開く
    fireEvent.click(sosButton);
    await waitFor(() => {
      const weatherButton = screen.getByText('天気・服装');
      fireEvent.click(weatherButton);
    });

    await waitFor(() => {
      expect(screen.getByText('今日の天気と服装')).toBeInTheDocument();
    });
  });

  it('天気・服装モーダルのレスポンシブ対応が適用されている', async () => {
    render(<EmergencyButton />);

    // モーダルを開く
    const sosButton = screen.getByLabelText('緊急ヘルプメニュー');
    fireEvent.click(sosButton);

    await waitFor(() => {
      const weatherButton = screen.getByText('天気・服装');
      fireEvent.click(weatherButton);
    });

    // モーダルコンテンツのレスポンシブクラスを確認
    await waitFor(() => {
      const modalContent = screen.getByText('今日の天気と服装').closest('div[class*="max-w-"]');
      expect(modalContent).toHaveClass('max-w-2xl', 'w-full');
    });
  });

  it('天気・服装ボタンに正しいスタイルが適用されている', async () => {
    render(<EmergencyButton />);

    const sosButton = screen.getByLabelText('緊急ヘルプメニュー');
    fireEvent.click(sosButton);

    await waitFor(() => {
      const weatherButton = screen.getByText('天気・服装');

      // オレンジ色のスタイルが適用されていることを確認
      expect(weatherButton).toHaveClass(
        'bg-orange-500',
        'hover:bg-orange-600',
        'text-white',
        'rounded-full',
        'shadow-lg'
      );

      // アイコンが含まれていることを確認
      expect(weatherButton).toHaveTextContent('🌤️');
    });
  });
});
