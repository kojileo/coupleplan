import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Plan, CreatePlanInput } from '@/types/plan';

type PlanFormData = {
  title: string;
  description: string;
  date: string;
  region: string;
  budget: number;
  isPublic: boolean;
  locations: { url: string; name: string | null }[];
};

interface PlanFormProps {
  onSubmit: (formData: PlanFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PlanFormData>;
  isLoading?: boolean;
}

export function PlanForm({ onSubmit, onCancel, initialData, isLoading = false }: PlanFormProps) {
  const router = useRouter();
  const [locations, setLocations] = useState([{ url: '', name: '' }]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const planData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      locations: locations.map((loc) => ({
        url: loc.url,
        name: loc.name || null,
      })),
      region: formData.get('region') as string,
      budget: Number(formData.get('budget')),
      isPublic: formData.get('isPublic') === 'on',
    };

    await onSubmit(planData);
  };

  const handleBack = () => {
    router.back();
  };

  const addLocation = () => {
    setLocations([...locations, { url: '', name: '' }]);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="plan-form">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-rose-700 mb-1">
          タイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title}
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
          defaultValue={initialData?.description}
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
          defaultValue={
            initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ''
          }
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
          defaultValue={initialData?.budget}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-rose-700">場所URL</label>
          <button
            type="button"
            onClick={addLocation}
            className="rounded-lg font-medium transition-colors border-2 border-rose-200 text-rose-700 bg-transparent hover:bg-rose-50 px-4 py-2 text-sm"
          >
            URLを追加
          </button>
        </div>
        <div className="space-y-2">
          {locations.map((location, index) => (
            <div key={index} className="space-y-4">
              <div>
                <label
                  htmlFor={`location-url-${index}`}
                  className="block text-sm font-medium text-rose-700 mb-1"
                >
                  場所URL
                </label>
                <input
                  id={`location-url-${index}`}
                  name={`location-url-${index}`}
                  type="url"
                  required
                  value={location.url}
                  onChange={(e) => {
                    const newLocations = [...locations];
                    newLocations[index].url = e.target.value;
                    setLocations(newLocations);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label
                  htmlFor={`location-name-${index}`}
                  className="block text-sm font-medium text-rose-700 mb-1"
                >
                  場所の名前（任意）
                </label>
                <input
                  id={`location-name-${index}`}
                  name={`location-name-${index}`}
                  type="text"
                  value={location.name}
                  onChange={(e) => {
                    const newLocations = [...locations];
                    newLocations[index].name = e.target.value;
                    setLocations(newLocations);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLocation(index)}
                className="rounded-lg font-medium transition-colors bg-pink-100 text-rose-800 hover:bg-pink-200 px-4 py-2"
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
          name="region"
          defaultValue={initialData?.region}
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
          defaultChecked={initialData?.isPublic}
          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
          公開する
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg font-medium transition-colors border-2 border-rose-200 text-rose-700 bg-transparent hover:bg-rose-50 px-4 py-2"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg font-medium transition-colors bg-rose-600 text-white hover:bg-rose-700 px-4 py-2"
        >
          {isLoading ? '作成中...' : '作成'}
        </button>
      </div>
    </form>
  );
}
