'use client';

import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { FormEvent } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function NewPlanPage(): ReactElement {
  const router = useRouter();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!session) {
        setError('認証が必要です');
        return;
      }

      const formData = new FormData(event.currentTarget);
      const locationUrl = formData.get('location-url-0') as string;
      const locationName = formData.get('location-name-0') as string;
      const date = formData.get('date') as string;
      const region = formData.get('region') as string;

      const planData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: date || null,
        locations: [
          {
            url: locationUrl,
            name: locationName || null,
          },
        ],
        region: region || null,
        budget: Number(formData.get('budget')),
        isPublic: formData.get('isPublic') === 'on',
      };

      const response = await api.plans.create(session.access_token, planData);
      if (response.error) {
        setError(response.error);
        return;
      }

      if (!response.data?.id) {
        setError('プランの作成に失敗しました');
        return;
      }

      router.push('/plans');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('プランの作成に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = (): void => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">新規プラン作成</h1>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-6"
        data-testid="plan-form"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-rose-700 mb-1">
            タイトル
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-rose-700 mb-1">
            説明
          </label>
          <textarea
            id="description"
            name="description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-rose-700 mb-1">
            日付
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-rose-700 mb-1">
            予算
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            required
            min={0}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="location-url-0" className="block text-sm font-medium text-rose-700">
              場所URL
            </label>
            <button
              type="button"
              className="rounded-lg font-medium transition-colors border-2 border-rose-200 text-rose-700 bg-transparent hover:bg-rose-50 px-4 py-2 text-sm"
            >
              URLを追加
            </button>
          </div>
          <div className="space-y-2">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="location-url-0"
                  className="block text-sm font-medium text-rose-700 mb-1"
                >
                  場所URL
                </label>
                <input
                  id="location-url-0"
                  name="location-url-0"
                  type="url"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label
                  htmlFor="location-name-0"
                  className="block text-sm font-medium text-rose-700 mb-1"
                >
                  場所の名前（任意）
                </label>
                <input
                  id="location-name-0"
                  name="location-name-0"
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <Button type="button" variant="secondary">
                削除
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-rose-700 mb-1">
            地域
          </label>
          <select
            id="region"
            name="region"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">選択してください</option>
            <option value="tokyo">東京</option>
            <option value="osaka">大阪</option>
            <option value="kyoto">京都</option>
            <option value="fukuoka">福岡</option>
            <option value="sapporo">札幌</option>
            <option value="nagoya">名古屋</option>
            <option value="yokohama">横浜</option>
            <option value="kobe">神戸</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            公開する
          </label>
        </div>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={handleBack}>
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div
                  data-testid="loading-spinner"
                  className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"
                ></div>
                作成中...
              </div>
            ) : (
              '作成'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
