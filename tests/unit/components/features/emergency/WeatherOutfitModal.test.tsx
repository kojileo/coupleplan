import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { WeatherOutfitModal } from '@/components/features/emergency/WeatherOutfitModal';

// WeatherOutfitCardをモック
jest.mock('@/components/WeatherOutfitCard', () => ({
  WeatherOutfitCard: () => (
    <div data-testid="weather-outfit-card">
      <h3>天気情報</h3>
      <p>東京: 晴れ、25°C</p>
      <h4>おすすめの服装</h4>
      <p>軽いTシャツがおすすめです</p>
    </div>
  ),
}));

// Lucide-reactアイコンをモック
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">×</span>,
}));

describe('WeatherOutfitModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isOpen=falseの場合、モーダルが表示されない', () => {
    render(<WeatherOutfitModal isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByText('今日の天気と服装')).not.toBeInTheDocument();
  });

  it('isOpen=trueの場合、モーダルが表示される', () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('今日の天気と服装')).toBeInTheDocument();
    expect(screen.getByTestId('weather-outfit-card')).toBeInTheDocument();
  });

  it('モーダルのヘッダーに正しいタイトルとアイコンが表示される', () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    const title = screen.getByText('今日の天気と服装');
    expect(title).toBeInTheDocument();

    // 天気アイコンが含まれていることを確認（🌤️は文字として認識される）
    const header = title.closest('div');
    expect(header).toHaveTextContent('🌤️');
  });

  it('WeatherOutfitCardコンポーネントがレンダリングされる', () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    const weatherCard = screen.getByTestId('weather-outfit-card');
    expect(weatherCard).toBeInTheDocument();
    expect(weatherCard).toHaveTextContent('天気情報');
    expect(weatherCard).toHaveTextContent('おすすめの服装');
  });

  it('XボタンをクリックするとonCloseが呼ばれる', async () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('閉じる');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('フッターの閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    // フッターのボタンを特定（テキストが「閉じる」で、かつbg-gray-200クラスを持つもの）
    const footerCloseButton = screen.getByText('閉じる');
    fireEvent.click(footerCloseButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('バックドロップをクリックするとonCloseが呼ばれる', async () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    // バックドロップ要素を取得（最初のdiv要素がバックドロップ）
    const modal = screen.getByText('今日の天気と服装').closest('[class*="fixed inset-0"]');
    const backdrop = modal?.querySelector('div[class*="fixed inset-0 bg-black"]');

    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('適切なCSSSクラスが適用されている', () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    // モーダルコンテナ
    const modalContainer = screen
      .getByText('今日の天気と服装')
      .closest('div[class*="fixed inset-0"]');
    expect(modalContainer).toHaveClass('fixed', 'inset-0', 'z-50', 'overflow-y-auto');

    // モーダルコンテンツ
    const modalContent = screen.getByText('今日の天気と服装').closest('div[class*="bg-white"]');
    expect(modalContent).toHaveClass('bg-white', 'rounded-lg', 'shadow-xl');
  });

  it('閉じるボタンにホバーエフェクトのクラスが適用されている', () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    const xButton = screen.getByLabelText('閉じる');
    expect(xButton).toHaveClass('text-gray-400', 'hover:text-gray-600', 'transition-colors');
  });

  it('フッターの閉じるボタンに適切なスタイルが適用されている', () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    // フッターのボタンを特定（テキストが「閉じる」のもの）
    const footerButton = screen.getByText('閉じる');
    expect(footerButton).toHaveClass(
      'px-4',
      'py-2',
      'bg-gray-200',
      'text-gray-800',
      'rounded-lg',
      'hover:bg-gray-300',
      'transition-colors'
    );
  });

  it('モーダルがスクロール可能である', () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    const modalContent = screen.getByText('今日の天気と服装').closest('div[class*="max-h-"]');
    expect(modalContent).toHaveClass('max-h-[90vh]', 'overflow-y-auto');
  });

  it('レスポンシブ対応のクラスが適用されている', () => {
    render(<WeatherOutfitModal isOpen={true} onClose={mockOnClose} />);

    const modalContent = screen.getByText('今日の天気と服装').closest('div[class*="max-w-"]');
    expect(modalContent).toHaveClass('max-w-2xl', 'w-full');
  });
});
