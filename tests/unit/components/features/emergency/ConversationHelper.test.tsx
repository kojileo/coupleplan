import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ConversationHelper } from '@/components/features/emergency/ConversationHelper';

// Mock API functions
jest.mock('@/lib/data/conversationTopics', () => ({
  getRandomTopicByCategory: jest.fn(),
}));

const mockGetRandomTopicByCategory =
  require('@/lib/data/conversationTopics').getRandomTopicByCategory;

const mockTopic = {
  id: 'test-1',
  category: '軽い話題',
  question: 'テスト用の質問です',
  description: 'これはテスト用の説明です',
};

const mockTopicWithoutDescription = {
  id: 'test-2',
  category: '深い話題',
  question: '説明なしのテスト質問',
};

describe('ConversationHelper', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRandomTopicByCategory.mockReturnValue(mockTopic);
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('isOpen=falseの時は何も表示しない', () => {
    render(<ConversationHelper isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('会話ネタ')).not.toBeInTheDocument();
  });

  it('isOpen=trueの時にモーダルが表示される', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('会話ネタ')).toBeInTheDocument();
    expect(screen.getByText('どんな話題をお探しですか？')).toBeInTheDocument();
  });

  it('×ボタンをクリックするとonCloseが呼ばれる', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('カテゴリ選択画面で全てのカテゴリが表示される', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('軽い話題')).toBeInTheDocument();
    expect(screen.getByText('深い話題')).toBeInTheDocument();
    expect(screen.getByText('楽しい話題')).toBeInTheDocument();
    expect(screen.getByText('グルメ')).toBeInTheDocument();
    expect(screen.getByText('恋愛')).toBeInTheDocument();
    expect(screen.getByText('季節')).toBeInTheDocument();
  });

  it('カテゴリを選択すると話題生成画面に遷移する', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    const lightTopicButton = screen.getByText('軽い話題');
    fireEvent.click(lightTopicButton);

    expect(screen.getByText('話題を生成する')).toBeInTheDocument();
    expect(screen.getByText('カテゴリに戻る')).toBeInTheDocument();
    expect(screen.queryByText('どんな話題をお探しですか？')).not.toBeInTheDocument();
  });

  it('カテゴリに戻るボタンが正しく動作する', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    // カテゴリを選択
    const lightTopicButton = screen.getByText('軽い話題');
    fireEvent.click(lightTopicButton);

    // カテゴリに戻る
    const backButton = screen.getByText('カテゴリに戻る');
    fireEvent.click(backButton);

    expect(screen.getByText('どんな話題をお探しですか？')).toBeInTheDocument();
    expect(screen.queryByText('話題を生成する')).not.toBeInTheDocument();
  });

  it('話題生成ボタンをクリックすると正しく話題が生成される', async () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    // カテゴリを選択
    const lightTopicButton = screen.getByText('軽い話題');
    fireEvent.click(lightTopicButton);

    // 話題生成ボタンをクリック
    const generateButton = screen.getByText('話題を生成する');
    fireEvent.click(generateButton);

    // ローディング状態が表示される
    expect(screen.getByText('考え中...')).toBeInTheDocument();

    // タイマーを進める
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockGetRandomTopicByCategory).toHaveBeenCalledWith('軽い話題');
      expect(screen.getByText('💡 テスト用の質問です')).toBeInTheDocument();
      expect(screen.getByText('これはテスト用の説明です')).toBeInTheDocument();
      expect(screen.getByText('軽い話題')).toBeInTheDocument();
    });
  });

  it('説明がない話題も正しく表示される', async () => {
    mockGetRandomTopicByCategory.mockReturnValue(mockTopicWithoutDescription);

    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    // カテゴリを選択
    const deepTopicButton = screen.getByText('深い話題');
    fireEvent.click(deepTopicButton);

    // 話題生成ボタンをクリック
    const generateButton = screen.getByText('話題を生成する');
    fireEvent.click(generateButton);

    // タイマーを進める
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('💡 説明なしのテスト質問')).toBeInTheDocument();
      expect(screen.getByText('深い話題')).toBeInTheDocument();
      // 説明がないので説明文は表示されない
      expect(screen.queryByText('これはテスト用の説明です')).not.toBeInTheDocument();
    });
  });

  it('使い方のコツが表示される', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    // カテゴリを選択
    const lightTopicButton = screen.getByText('軽い話題');
    fireEvent.click(lightTopicButton);

    expect(screen.getByText('💡 使い方のコツ')).toBeInTheDocument();
    expect(screen.getByText('• 自然な流れで話題を出してみましょう')).toBeInTheDocument();
    expect(screen.getByText('• 相手の答えに興味を示して深掘りしよう')).toBeInTheDocument();
    expect(screen.getByText('• 無理に使わず、会話のきっかけ程度に')).toBeInTheDocument();
    expect(screen.getByText('• お互いが楽しめる雰囲気を大切に')).toBeInTheDocument();
  });

  it('ローディング中は生成ボタンが無効化される', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    // カテゴリを選択
    const lightTopicButton = screen.getByText('軽い話題');
    fireEvent.click(lightTopicButton);

    // 話題生成ボタンをクリック
    const generateButton = screen.getByText('話題を生成する');
    fireEvent.click(generateButton);

    // ローディング中はボタンが無効化される
    expect(generateButton).toBeDisabled();
    expect(screen.getByText('考え中...')).toBeInTheDocument();
  });

  it('複数回話題生成が可能', async () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    // カテゴリを選択
    const lightTopicButton = screen.getByText('軽い話題');
    fireEvent.click(lightTopicButton);

    const generateButton = screen.getByText('話題を生成する');

    // 1回目の生成
    fireEvent.click(generateButton);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // 1回目の呼び出し確認
    await waitFor(() => {
      expect(mockGetRandomTopicByCategory).toHaveBeenCalledTimes(1);
    });

    // ボタンが再び有効になるまで待機
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    // 2回目の生成
    fireEvent.click(generateButton);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // 2回目の呼び出し確認
    await waitFor(() => {
      expect(mockGetRandomTopicByCategory).toHaveBeenCalledTimes(2);
    });
  });

  it('カテゴリごとの説明文が正しく表示される', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    // 各カテゴリの説明文をチェック
    expect(screen.getByText('気軽に話せるトピック')).toBeInTheDocument();
    expect(screen.getByText('お互いを知り合える質問')).toBeInTheDocument();
    expect(screen.getByText('盛り上がること間違いなし')).toBeInTheDocument();
    expect(screen.getByText('食べ物の話で盛り上がろう')).toBeInTheDocument();
    expect(screen.getByText('二人の距離を縮める質問')).toBeInTheDocument();
    expect(screen.getByText('季節に合わせた会話')).toBeInTheDocument();
  });

  it('各カテゴリの適切なアイコンが表示される', () => {
    render(<ConversationHelper isOpen={true} onClose={mockOnClose} />);

    // カテゴリボタン内のアイコンをチェック
    const lightButton = screen.getByText('軽い話題').closest('button');
    const deepButton = screen.getByText('深い話題').closest('button');
    const funButton = screen.getByText('楽しい話題').closest('button');
    const foodButton = screen.getByText('グルメ').closest('button');
    const loveButton = screen.getByText('恋愛').closest('button');
    const seasonButton = screen.getByText('季節').closest('button');

    expect(lightButton).toHaveTextContent('☀️');
    expect(deepButton).toHaveTextContent('🌙');
    expect(funButton).toHaveTextContent('🎉');
    expect(foodButton).toHaveTextContent('🍽️');
    expect(loveButton).toHaveTextContent('💕');
    expect(seasonButton).toHaveTextContent('🌸');
  });
});
