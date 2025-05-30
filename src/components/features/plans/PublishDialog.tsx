'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

type PublishDialogProps = {
  planId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function PublishDialog({
  planId,
  isOpen,
  onClose,
}: PublishDialogProps): ReactElement | null {
  const { session } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async (): Promise<void> => {
      if (!session || !isOpen) return;

      try {
        const response = await api.plans.get(session.access_token, planId);
        if ('error' in response) throw new Error(response.error);
        if (response.data) setPlan(response.data);
      } catch (error) {
        console.error('プランの取得に失敗しました:', error);
        setError('プランの取得に失敗しました');
      }
    };

    void fetchPlan();
  }, [session, planId, isOpen]);

  const handlePublish = async (): Promise<void> => {
    if (!session || !plan) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.plans.publish(session.access_token, planId, !plan.isPublic);

      if ('error' in response) {
        setError('公開設定の更新に失敗しました');
        console.error('公開設定の更新に失敗しました:', new Error(response.error));
        return;
      }

      setPlan((prev) => (prev ? { ...prev, isPublic: !prev.isPublic } : null));
      if (response.data) {
        onClose();
      }
    } catch (error) {
      console.error('公開設定の更新に失敗しました:', error);
      setError('公開設定の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-rose-950">プランの公開設定</h2>

        <p className="mb-4 text-rose-600">
          {plan?.isPublic
            ? 'このプランは現在公開されています。非公開にしますか？'
            : 'このプランを公開しますか？公開すると、他のユーザーが閲覧できるようになります。'}
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4" data-testid="error-message">
            {error}
          </p>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={() => void handlePublish()}
            disabled={loading}
            data-testid={loading ? 'loading-button' : 'action-button'}
          >
            {loading ? '更新中...' : plan?.isPublic ? '非公開にする' : '公開する'}
          </Button>
        </div>
      </div>
    </div>
  );
}
