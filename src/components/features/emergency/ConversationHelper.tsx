'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import { getRandomTopicByCategory, type ConversationTopic } from '@/lib/data/conversationTopics';

interface ConversationHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationHelper({
  isOpen,
  onClose,
}: ConversationHelperProps): ReactElement | null {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<ConversationTopic | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomTopic = (): void => {
    setIsGenerating(true);

    // ちょっとした演出のため少し待機
    setTimeout(() => {
      const topic = selectedCategory
        ? getRandomTopicByCategory(selectedCategory)
        : getRandomTopicByCategory();
      setCurrentTopic(topic);
      setIsGenerating(false);
    }, 500);
  };

  const handleCategorySelect = (category: string): void => {
    setSelectedCategory(category);
    setCurrentTopic(null);
  };

  const handleBackToCategories = (): void => {
    setSelectedCategory('');
    setCurrentTopic(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <span className="mr-2">💬</span>
              会話ネタ
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4">
          {!selectedCategory ? (
            // カテゴリ選択画面
            <div>
              <p className="text-gray-600 mb-4">どんな話題をお探しですか？</p>
              <div className="space-y-3">
                <button
                  onClick={() => handleCategorySelect('軽い話題')}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg transition-colors text-left"
                >
                  <span className="mr-2">☀️</span>
                  <strong>軽い話題</strong>
                  <div className="text-sm text-blue-600 mt-1">気軽に話せるトピック</div>
                </button>
                <button
                  onClick={() => handleCategorySelect('深い話題')}
                  className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg transition-colors text-left"
                >
                  <span className="mr-2">🌙</span>
                  <strong>深い話題</strong>
                  <div className="text-sm text-purple-600 mt-1">お互いを知り合える質問</div>
                </button>
                <button
                  onClick={() => handleCategorySelect('楽しい話題')}
                  className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-3 px-4 rounded-lg transition-colors text-left"
                >
                  <span className="mr-2">🎉</span>
                  <strong>楽しい話題</strong>
                  <div className="text-sm text-yellow-600 mt-1">盛り上がること間違いなし</div>
                </button>
                <button
                  onClick={() => handleCategorySelect('グルメ')}
                  className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 py-3 px-4 rounded-lg transition-colors text-left"
                >
                  <span className="mr-2">🍽️</span>
                  <strong>グルメ</strong>
                  <div className="text-sm text-orange-600 mt-1">食べ物の話で盛り上がろう</div>
                </button>
                <button
                  onClick={() => handleCategorySelect('恋愛')}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 px-4 rounded-lg transition-colors text-left"
                >
                  <span className="mr-2">💕</span>
                  <strong>恋愛</strong>
                  <div className="text-sm text-rose-600 mt-1">二人の距離を縮める質問</div>
                </button>
                <button
                  onClick={() => handleCategorySelect('季節')}
                  className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg transition-colors text-left"
                >
                  <span className="mr-2">🌸</span>
                  <strong>季節</strong>
                  <div className="text-sm text-green-600 mt-1">季節に合わせた会話</div>
                </button>
              </div>
            </div>
          ) : (
            // 話題生成画面
            <div>
              <button
                onClick={handleBackToCategories}
                className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
              >
                <span className="mr-1">←</span> カテゴリに戻る
              </button>

              <div className="text-center">
                <button
                  onClick={generateRandomTopic}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      考え中...
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">🎲</span>
                      話題を生成する
                    </>
                  )}
                </button>

                {currentTopic && !isGenerating && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {currentTopic.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">💡 {currentTopic.question}</h3>
                    {currentTopic.description && (
                      <p className="text-gray-600 text-sm">{currentTopic.description}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 使い方のコツ */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">💡 使い方のコツ</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 自然な流れで話題を出してみましょう</li>
                  <li>• 相手の答えに興味を示して深掘りしよう</li>
                  <li>• 無理に使わず、会話のきっかけ程度に</li>
                  <li>• お互いが楽しめる雰囲気を大切に</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
