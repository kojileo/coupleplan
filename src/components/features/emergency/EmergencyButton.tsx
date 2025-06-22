'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import { ConversationHelper } from './ConversationHelper';
import { ToiletFinder } from './ToiletFinder';
import { WeatherOutfitModal } from './WeatherOutfitModal';

export function EmergencyButton(): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'toilet' | 'conversation' | 'weather' | null>(
    null
  );

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOpenModal = (modal: 'toilet' | 'conversation' | 'weather'): void => {
    setActiveModal(modal);
    setIsMenuOpen(false);
  };

  const handleCloseModal = (): void => {
    setActiveModal(null);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* メニューオプション */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 space-y-2">
            <button
              onClick={() => handleOpenModal('weather')}
              className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-200 whitespace-nowrap"
            >
              <span className="mr-2">🌤️</span>
              天気・服装
            </button>
            <button
              onClick={() => handleOpenModal('toilet')}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 whitespace-nowrap"
            >
              <span className="mr-2">🚻</span>
              お手洗い検索
            </button>
            <button
              onClick={() => handleOpenModal('conversation')}
              className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 whitespace-nowrap"
            >
              <span className="mr-2">💬</span>
              会話ネタ
            </button>
          </div>
        )}

        {/* メインボタン */}
        <button
          onClick={toggleMenu}
          className={`w-14 h-14 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all duration-200 ${
            isMenuOpen ? 'rotate-45' : ''
          }`}
          aria-label="緊急ヘルプメニュー"
        >
          <span className="text-2xl">🆘</span>
        </button>
      </div>

      {/* モーダル */}
      <WeatherOutfitModal isOpen={activeModal === 'weather'} onClose={handleCloseModal} />
      <ToiletFinder isOpen={activeModal === 'toilet'} onClose={handleCloseModal} />
      <ConversationHelper isOpen={activeModal === 'conversation'} onClose={handleCloseModal} />
    </>
  );
}
