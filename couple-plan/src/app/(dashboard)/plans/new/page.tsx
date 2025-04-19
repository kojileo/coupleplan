'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent, ReactElement, MouseEvent } from 'react';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

type Location = {
  url: string;
  name: string | null;
};

type FormData = {
  title: string;
  description: string;
  date: string | null;
  budget: number;
  locations: Location[];
  region: string | null;
  isPublic: boolean;
};

export default function NewPlanPage(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [templatePlan, setTemplatePlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: null,
    budget: 0,
    locations: [],
    region: null,
    isPublic: false,
  });
  const [error, setError] = useState('');

  const handleBack = (): void => {
    router.back();
  };

  useEffect(() => {
    const fetchTemplatePlan = async (): Promise<void> => {
      if (!templateId || !session) return;

      try {
        const response = await api.plans.get(session.access_token, templateId);
        if ('error' in response) throw new Error(response.error);
        if (response.data) {
          setTemplatePlan(response.data);
          setFormData({
            title: response.data.title,
            description: response.data.description,
            date: response.data.date
              ? new Date(response.data.date).toISOString().split('T')[0]
              : null,
            budget: response.data.budget,
            locations:
              response.data.locations?.map((location) => ({
                url: location.url,
                name: location.name,
              })) || [],
            region: response.data.region ?? null,
            isPublic: false,
          });
        }
      } catch (error) {
        console.error('テンプレートプランの取得に失敗しました:', error);
      }
    };

    void fetchTemplatePlan();
  }, [templateId, session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!session) return;

    setSaving(true);
    setError('');

    try {
      const response = await api.plans.create(session.user.id, {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString().split('T')[0] : null,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('プランの作成に失敗しました');
      }

      router.push(`/plans/${response.data.id}`);
    } catch (error) {
      console.error('プランの作成に失敗しました:', error);
      setError('プランの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitClick = (e: MouseEvent): void => {
    e.preventDefault();
    void handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
  };

  const addLocation = (): void => {
    setFormData({
      ...formData,
      locations: [...formData.locations, { url: '', name: null }],
    });
  };

  const updateLocation = (index: number, field: keyof Location, value: string): void => {
    const newLocations = [...formData.locations];
    newLocations[index] = {
      ...newLocations[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      locations: newLocations,
    });
  };

  const removeLocation = (index: number): void => {
    setFormData({
      ...formData,
      locations: formData.locations.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-rose-950 mb-8">
        {templatePlan ? 'おすすめプランから作成' : '新規プラン作成'}
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="plan-form">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-rose-700 mb-1">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-rose-700 mb-1">
            説明
          </label>
          <textarea
            id="description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-rose-700 mb-1">
            日付
          </label>
          <input
            id="date"
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={formData.date ?? ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-rose-700 mb-1">
            予算
          </label>
          <input
            id="budget"
            type="number"
            required
            min={0}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="locationUrl" className="block text-sm font-medium text-rose-700">
              場所URL
            </label>
            <button
              type="button"
              className="rounded-lg font-medium transition-colors border-2 border-rose-200 text-rose-700 bg-transparent hover:bg-rose-50 px-4 py-2 text-sm"
              onClick={() => {
                setFormData({
                  ...formData,
                  locations: [...formData.locations, { url: '', name: null }],
                });
              }}
            >
              URLを追加
            </button>
          </div>
          <div className="space-y-2">
            {formData.locations.map((location, index) => (
              <div key={index} className="flex gap-2">
                <input
                  id={`locationUrl-${index}`}
                  type="text"
                  value={location.url}
                  onChange={(e) => updateLocation(index, 'url', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="https://example.com"
                />
                <button
                  type="button"
                  className="rounded-lg font-medium transition-colors border-2 border-rose-200 text-rose-700 bg-transparent hover:bg-rose-50 px-4 py-2 text-sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      locations: formData.locations.filter((_, i) => i !== index),
                    });
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-rose-700 mb-1">
            地域
          </label>
          <select
            id="region"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={formData.region ?? ''}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
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
            type="checkbox"
            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            公開する
          </label>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-lg font-medium transition-colors bg-rose-600 text-white hover:bg-rose-700 px-4 py-2 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '作成中...' : '作成'}
          </Button>
        </div>
      </form>
    </div>
  );
}
