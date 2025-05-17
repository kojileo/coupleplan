'use client';

import { useState } from 'react';
import type { MouseEvent, ReactElement } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type LikeButtonProps = {
  planId: string;
  initialIsLiked: boolean;
  likeCount: number;
};

export function LikeButton({ planId, initialIsLiked, likeCount }: LikeButtonProps): ReactElement {
  const { session } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [count, setCount] = useState(likeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation(); // カードのクリックイベントを防ぐ
    if (!session?.access_token || isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        await api.likes.delete(session.access_token, planId);
        setCount((prev) => prev - 1);
      } else {
        await api.likes.create(session.access_token, planId);
        setCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('いいねの操作に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onLikeClick = (e: MouseEvent): void => {
    void handleLike(e);
  };

  return (
    <button
      onClick={onLikeClick}
      disabled={isLoading || !session}
      className={`flex items-center gap-1 text-sm transition-colors
        ${isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
    >
      <span className={isLoading ? 'opacity-50' : ''}>{isLiked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  );
}
