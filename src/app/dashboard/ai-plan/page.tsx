'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface DatePlanForm {
  budget: string;
  duration: string;
  location: string;
  preferences: string[];
  specialRequests: string;
}

export default function AIPlanPage(): ReactElement {
  const [formData, setFormData] = useState<DatePlanForm>({
    budget: '',
    duration: '',
    location: '',
    preferences: [],
    specialRequests: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const budgetOptions = [
    { value: '5000', label: '5,000円以下' },
    { value: '10000', label: '5,000円〜10,000円' },
    { value: '20000', label: '10,000円〜20,000円' },
    { value: '30000', label: '20,000円〜30,000円' },
    { value: '50000', label: '30,000円以上' },
  ];

  const durationOptions = [
    { value: '2', label: '2時間' },
    { value: '4', label: '4時間' },
    { value: '6', label: '6時間' },
    { value: '8', label: '8時間' },
    { value: '12', label: '12時間（1日）' },
  ];

  const preferenceOptions = [
    { value: 'outdoor', label: 'アウトドア' },
    { value: 'indoor', label: 'インドア' },
    { value: 'cultural', label: '文化・芸術' },
    { value: 'food', label: 'グルメ' },
    { value: 'shopping', label: 'ショッピング' },
    { value: 'entertainment', label: 'エンターテイメント' },
    { value: 'nature', label: '自然・公園' },
    { value: 'romantic', label: 'ロマンチック' },
  ];

  const handleInputChange = (field: keyof DatePlanForm, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceToggle = (preference: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter((p) => p !== preference)
        : [...prev.preferences, preference],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // AI生成処理のシミュレーション
    setTimeout(() => {
      setIsGenerating(false);
      // 次の画面への遷移
      window.location.href = '/dashboard/ai-plan/generating';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">AIデートプラン作成</h1>
          <p className="text-xl text-gray-600">
            あなたの好みに合わせて、AIが最適なデートプランを提案します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側: 基本情報 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">基本情報</h2>

              {/* 予算 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  予算
                  {formData.budget && (
                    <span className="ml-2 text-rose-600 font-semibold">
                      {budgetOptions.find((opt) => opt.value === formData.budget)?.label}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {budgetOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
                        formData.budget === option.value
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        value={option.value}
                        checked={formData.budget === option.value}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  デート時間
                  {formData.duration && (
                    <span className="ml-2 text-rose-600 font-semibold">
                      {durationOptions.find((opt) => opt.value === formData.duration)?.label}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {durationOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
                        formData.duration === option.value
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duration"
                        value={option.value}
                        checked={formData.duration === option.value}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 地域 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">希望地域</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="例: 渋谷、新宿、横浜など"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* 右側: 詳細設定 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">詳細設定</h2>

              {/* 好み */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  好み（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {preferenceOptions.map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.includes(option.value)}
                        onChange={() => handlePreferenceToggle(option.value)}
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 特別な要望 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">特別な要望</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="例: アニバーサリー記念日、初デート、雨の日でも楽しめる場所など"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={!formData.budget || !formData.duration || isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    AI生成中...
                  </>
                ) : (
                  'AIでプラン生成'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
