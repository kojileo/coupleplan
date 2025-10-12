'use client';

// カップル連携状態を表示するカードコンポーネント
// ダッシュボードやプラン一覧で使用

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, UserPlus, Check } from 'lucide-react';
import { getCoupleStatus, type CoupleStatus } from '@/lib/couple-utils';

export default function CoupleStatusCard() {
  const [status, setStatus] = useState<CoupleStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupleStatus();
  }, []);

  const loadCoupleStatus = async () => {
    try {
      const coupleStatus = await getCoupleStatus();
      setStatus(coupleStatus);
    } catch (error) {
      console.error('カップル連携状態の取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Heart
              className={`h-5 w-5 ${status.isLinked ? 'text-pink-600 fill-pink-600' : 'text-gray-400'}`}
            />
            <h3 className="text-lg font-semibold text-gray-900">
              {status.isLinked ? 'カップル連携中' : '個人利用中'}
            </h3>
          </div>

          {status.isLinked ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>
                  <span className="font-medium">{status.partnerName || 'パートナー'}</span>
                  さんと連携中
                </span>
              </div>
              <p className="text-xs text-gray-500">二人で一緒にプランを作成・編集できます</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">個人でプラン作成を楽しんでいます</p>
              <p className="text-xs text-gray-500">
                カップル連携すると、パートナーと一緒にプラン編集ができます
              </p>
            </div>
          )}
        </div>

        <div>
          {!status.isLinked && (
            <Link
              href="/dashboard/partner-linkage"
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors"
            >
              <UserPlus size={16} />
              <span>連携</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
