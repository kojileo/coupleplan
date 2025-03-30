'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { PlanRequest } from '@/types/api';

type FormData = Omit<PlanRequest, 'date'> & {
  date: string | null;
  region: string;
};

export default function NewPlanPage(): ReactElement {
  const router = useRouter();
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: null,
    budget: 0,
    location: '',
    region: '',
    isPublic: false,
  });

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!session) return;

    setSaving(true);
    try {
      const response = await api.plans.create(session.access_token, {
        ...formData,
        date: formData.date ? new Date(formData.date) : null,
      });

      if ('error' in response) throw new Error(response.error);
      void router.push('/plans');
    } catch (error) {
      console.error('プランの作成に失敗しました:', error);
      alert('プランの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (e: FormEvent): void => {
    void handleSubmit(e);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-rose-950">新規プラン作成</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-rose-950 mb-1">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-rose-950"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-rose-950 mb-1">
            説明
          </label>
          <textarea
            id="description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-rose-950"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-rose-950 mb-1">
            日付
          </label>
          <input
            id="date"
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-rose-950"
            value={formData.date ?? ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-rose-950 mb-1">
            予算
          </label>
          <input
            id="budget"
            type="number"
            required
            min={0}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-rose-950"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-rose-950 mb-1">
            場所URL
          </label>
          <input
            id="location"
            type="url"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-rose-950"
            value={formData.location ?? ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-rose-950 mb-1">
            地域
          </label>
          <select
            id="region"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-rose-950"
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
            {saving ? '作成中...' : '作成'}
          </Button>
        </div>
      </form>
    </div>
  );
}
