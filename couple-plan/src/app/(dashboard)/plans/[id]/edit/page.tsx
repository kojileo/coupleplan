'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditPlanPage({ params }: Props): ReactElement {
  const router = useRouter();
  const { session } = useAuth();
  const [planId, setPlanId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    budget: 0,
    locations: [] as { url: string; name: string | null }[],
    region: '',
    isPublic: false,
  });

  useEffect(() => {
    void params.then(({ id }) => setPlanId(id));
  }, [params]);

  useEffect(() => {
    if (!planId) return;

    const fetchPlan = async (): Promise<void> => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.plans.get(session.access_token, planId);
        if ('error' in response) throw new Error(response.error);

        setPlan(response.data || null);
        if (response.data) {
          setFormData({
            title: response.data.title,
            description: response.data.description || '',
            date: response.data.date
              ? new Date(response.data.date).toISOString().split('T')[0]
              : '',
            budget: response.data.budget,
            locations:
              response.data.locations?.map((location) => ({
                url: location.url,
                name: location.name,
              })) || [],
            region: response.data.region || '',
            isPublic: response.data.isPublic,
          });
        }
      } catch (error) {
        console.error('プランの取得に失敗しました:', error);
        void router.push('/plans');
      } finally {
        setLoading(false);
      }
    };

    void fetchPlan();
  }, [session, planId, router]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!session) return;

    setSaving(true);
    setError(null);

    try {
      const response = await api.plans.update(session.access_token, planId, {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : null,
      });

      if ('error' in response) throw new Error(response.error);
      router.back();
    } catch (error) {
      console.error('プランの更新に失敗しました:', error);
      setError('プランの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const addLocation = (): void => {
    setFormData({
      ...formData,
      locations: [...formData.locations, { url: '', name: null }],
    });
  };

  const updateLocation = (
    index: number,
    field: keyof { url: string; name: string | null },
    value: string
  ): void => {
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

  if (!planId || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-500">マイプランが見つかりません</p>
        <Button
          className="mt-4"
          onClick={(): void => {
            void router.push('/plans');
          }}
        >
          マイプラン一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-rose-950">マイプランの編集</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {saving && (
        <div className="flex justify-center items-center mb-4">
          <div
            data-testid="loading-spinner"
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"
          />
        </div>
      )}

      <form
        onSubmit={(e): void => {
          void handleSubmit(e);
        }}
        className="space-y-6"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-rose-700 mb-1">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.date}
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-rose-700">場所URL</label>
            <Button type="button" variant="outline" onClick={addLocation} className="text-sm">
              URLを追加
            </Button>
          </div>
          <div className="space-y-2">
            {formData.locations.map((location, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  placeholder="URL"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  value={location.url}
                  onChange={(e) => updateLocation(index, 'url', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="名前（任意）"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  value={location.name ?? ''}
                  onChange={(e) => updateLocation(index, 'name', e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeLocation(index)}
                  className="text-sm"
                >
                  削除
                </Button>
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.region}
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

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={(): void => {
              void router.back();
            }}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  );
}
