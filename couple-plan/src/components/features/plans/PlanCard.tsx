'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import React from 'react';
import type { MouseEvent, ReactElement } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import type { ExtendedPlan } from '@/types/plan';

import { LikeButton } from './LikeButton';

type PlanCardProps = {
  plan: ExtendedPlan;
  isPublic?: boolean;
  onPublishToggle?: (planId: string, isPublic: boolean) => Promise<void>;
};

export function PlanCard({ plan, isPublic = false, onPublishToggle }: PlanCardProps): ReactElement {
  const router = useRouter();
  const { session } = useAuth();

  const handleClick = (): void => {
    void router.push(`/plans/${plan.id}`);
  };

  const handlePublishToggle = (e: MouseEvent): void => {
    e.stopPropagation();
    if (onPublishToggle) {
      void onPublishToggle(plan.id, !plan.isPublic);
    }
  };

  const getLocationDisplay = (): string => {
    if (!plan.location) return '場所URL未設定';
    try {
      const url = new URL(plan.location);
      return url.hostname;
    } catch {
      return '場所URL未設定';
    }
  };

  return (
    <div
      role="article"
      className="bg-white rounded-lg shadow p-6 hover:shadow-md cursor-pointer transition-shadow duration-200 relative"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-rose-950">{plan.title}</h3>
        {!isPublic && onPublishToggle && (
          <button
            onClick={handlePublishToggle}
            className={`px-3 py-1 rounded-full text-sm ${
              plan.isPublic
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {plan.isPublic ? '公開中' : '非公開'}
          </button>
        )}
      </div>

      <div className="space-y-2 text-gray-600">
        <p className="line-clamp-2">{plan.description}</p>
        {plan.date && (
          <p className="text-sm">
            <span className="font-medium">日時：</span>
            {format(new Date(plan.date), 'yyyy年MM月dd日', { locale: ja })}
          </p>
        )}
        <div className="text-sm text-rose-600">
          <span>
            📍{' '}
            {plan.location ? (
              <a
                href={plan.location}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {getLocationDisplay()}
              </a>
            ) : (
              '場所URL未設定'
            )}
          </span>
        </div>
        <p className="text-sm">
          <span className="font-medium">予算：</span>
          {plan.budget.toLocaleString()}円
        </p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">作成者: {plan.profile?.name ?? '不明'}</span>
        <LikeButton
          planId={plan.id}
          initialIsLiked={plan.likes?.some((like) => like.userId === session?.user?.id) ?? false}
          likeCount={plan._count?.likes ?? 0}
        />
      </div>
    </div>
  );
}
