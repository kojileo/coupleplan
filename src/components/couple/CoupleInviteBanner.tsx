'use client';

// カップル招待バナーコンポーネント
// プラン作成後やダッシュボードで表示され、カップル連携を促す

import { X, Heart, Users, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { getCoupleStatus, getCoupleInviteMessage } from '@/lib/couple-utils';

interface CoupleInviteBannerProps {
  context: 'plan-created' | 'feature-locked' | 'dashboard';
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export default function CoupleInviteBanner({
  context,
  onDismiss,
  showDismiss = true,
}: CoupleInviteBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(true);

  const message = getCoupleInviteMessage(context);

  useEffect(() => {
    checkCoupleStatus();
  }, []);

  const checkCoupleStatus = async () => {
    try {
      const status = await getCoupleStatus();
      setIsLinked(status.isLinked);
      setIsVisible(!status.isLinked);
    } catch (error) {
      console.error('カップル連携状態の確認エラー:', error);
      setIsVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();

    // ローカルストレージに保存して一定期間非表示
    if (context === 'dashboard') {
      localStorage.setItem('couple-invite-dismissed', Date.now().toString());
    }
  };

  // カップル連携済みまたは非表示の場合は何も表示しない
  if (loading || !isVisible || isLinked) {
    return null;
  }

  // コンテキストに応じたアイコン
  const Icon = context === 'plan-created' ? Share2 : context === 'feature-locked' ? Users : Heart;

  return (
    <div className="relative overflow-hidden rounded-lg border border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 p-6 shadow-sm">
      {showDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
            <Icon className="h-6 w-6 text-pink-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{message.description}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/partner-linkage"
              className="inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
            >
              {message.actionText}
            </Link>

            {context === 'dashboard' && (
              <button
                onClick={handleDismiss}
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                後で
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 装飾的な背景パターン */}
      <div className="absolute -right-10 -bottom-10 opacity-10">
        <Heart size={120} />
      </div>
    </div>
  );
}
