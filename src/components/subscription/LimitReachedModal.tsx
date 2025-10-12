'use client';

import { useEffect } from 'react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'daily' | 'monthly';
  remaining: {
    daily: number | null;
    monthly: number | null;
  };
}

/**
 * LimitReachedModal コンポーネント
 *
 * AIプラン生成の制限に達した時に表示するモーダル
 * 日次制限または月次制限到達時に、ユーザーに適切な情報を提供
 */
export function LimitReachedModal({
  isOpen,
  onClose,
  limitType,
  remaining,
}: LimitReachedModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // モーダルが開いている時はbodyのスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDailyLimit = limitType === 'daily';
  const hasMonthlyRemaining = remaining.monthly !== null && remaining.monthly > 0;

  const handlePremiumClick = () => {
    // 将来: Premium登録ページへ遷移
    alert(
      'Premium プランは近日公開予定です！\n\nPremium プランでは、AIプラン生成が無制限で利用できます。\n\n月額 ¥480（予定）'
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">
            {isDailyLimit ? '本日の作成回数に達しました' : '今月の作成回数に達しました'}
          </h2>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {isDailyLimit && hasMonthlyRemaining ? (
            <>
              <div className="mb-4">
                <p className="text-gray-700 text-lg mb-2">📅 明日また3回作成できます</p>
                <p className="text-sm text-gray-600">
                  今月はあと{' '}
                  <span className="font-semibold text-blue-600">{remaining.monthly}回</span>{' '}
                  利用可能です
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-700 text-lg mb-2">📅 来月にリセットされます</p>
                <p className="text-sm text-gray-600">次回は来月1日から再度10回利用できます</p>
              </div>
            </>
          )}

          {/* Premium案内 */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">💎</span>
                Premium プランなら無制限
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                月額 <span className="text-lg font-bold text-blue-600">¥480</span>（近日公開予定）
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✨</span>
                  <span>AIプラン生成: 無制限</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✨</span>
                  <span>プラン保存: 無制限</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✨</span>
                  <span>優先サポート</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✨</span>
                  <span>今後の新機能に優先アクセス</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              閉じる
            </button>
            <button
              onClick={handlePremiumClick}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md"
            >
              詳細を見る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
