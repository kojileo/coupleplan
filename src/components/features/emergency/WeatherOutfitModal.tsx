'use client';

import { X } from 'lucide-react';
import type { ReactElement } from 'react';

import { WeatherOutfitCard } from '@/components/WeatherOutfitCard';

interface WeatherOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeatherOutfitModal({
  isOpen,
  onClose,
}: WeatherOutfitModalProps): ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* バックドロップ */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* モーダルコンテンツ */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🌤️</span>
              今日の天気と服装
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="閉じる"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="p-4">
            <WeatherOutfitCard />
          </div>

          {/* フッター */}
          <div className="flex justify-end p-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
