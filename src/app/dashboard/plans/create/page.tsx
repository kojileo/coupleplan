'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatePlanCreateRequest, PlanValidationError } from '@/types/date-plan';
import { validateDatePlanRequest } from '@/lib/plan-validation';
import { getPrefectures, getCities } from '@/lib/location-data';
import { getAllTags, getAllCategories, getTagsByCategory } from '@/lib/preference-tags';
import { UsageLimitDisplay } from '@/components/subscription/UsageLimitDisplay';
import { LimitReachedModal } from '@/components/subscription/LimitReachedModal';

export default function CreateDatePlanPage() {
  const router = useRouter();
  const supabase = createClient();

  // フォームステート
  const [formData, setFormData] = useState<DatePlanCreateRequest>({
    budget: 10000,
    duration: 4,
    location: {
      prefecture: '',
      city: '',
      station: '',
    },
    preferences: [],
    special_requests: '',
  });

  // UI状態
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PlanValidationError[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // サブスクリプション制限関連
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitType, setLimitType] = useState<'daily' | 'monthly'>('daily');
  const [remaining, setRemaining] = useState<{ daily: number | null; monthly: number | null }>({
    daily: null,
    monthly: null,
  });

  // 都道府県と市区町村のデータ
  const prefectures = getPrefectures();
  const allTags = getAllTags();
  const categories = getAllCategories();

  // 都道府県変更時に市区町村を更新
  useEffect(() => {
    if (formData.location.prefecture) {
      const citiesForPrefecture = getCities(formData.location.prefecture);
      setCities(citiesForPrefecture);
      // 都道府県変更時に市区町村をリセット
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, city: '', station: '' },
      }));
    } else {
      setCities([]);
    }
  }, [formData.location.prefecture]);

  /**
   * 入力値の変更ハンドラ
   */
  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('location.')) {
      const locationField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [locationField]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // エラーをクリア
    setValidationErrors((prev) => prev.filter((e) => e.field !== field));
  };

  /**
   * 好みタグの選択/解除
   */
  const togglePreference = (tagName: string) => {
    setFormData((prev) => {
      const preferences = prev.preferences.includes(tagName)
        ? prev.preferences.filter((p) => p !== tagName)
        : [...prev.preferences, tagName];
      return { ...prev, preferences };
    });

    // エラーをクリア
    setValidationErrors((prev) => prev.filter((e) => e.field !== 'preferences'));
  };

  /**
   * フォーム送信
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const validationResult = validateDatePlanRequest(formData);
    if (!validationResult.is_valid) {
      setValidationErrors(validationResult.errors);
      return;
    }

    setLoading(true);
    setValidationErrors([]);

    try {
      // 1. サブスクリプション制限チェック
      const limitResponse = await fetch('/api/subscription/check-limit');
      const limitData = await limitResponse.json();

      if (!limitResponse.ok) {
        console.error('制限チェックエラー:', limitData);
        // エラー時はそのまま生成を試みる（Graceful degradation）
      } else if (!limitData.canGenerate) {
        // 制限到達時はモーダルを表示して処理を中断
        const type = limitData.remaining.daily === 0 ? 'daily' : 'monthly';
        setLimitType(type);
        setRemaining(limitData.remaining);
        setShowLimitModal(true);
        setLoading(false);
        return;
      }

      // 2. 認証トークンを取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('ログインが必要です');
        router.push('/login');
        return;
      }

      // 3. AI生成APIを呼び出し
      const response = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validation_errors) {
          setValidationErrors(data.validation_errors);
        } else {
          alert(data.error || 'プランの生成に失敗しました');
        }
        return;
      }

      // 4. 使用履歴を記録
      try {
        await fetch('/api/subscription/usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId: data.plan?.id || null }),
        });
      } catch (usageError) {
        // 使用履歴記録のエラーは処理を継続（ログのみ）
        console.error('使用履歴記録エラー:', usageError);
      }

      // 5. 生成されたプランの一覧画面に遷移
      router.push(`/dashboard/plans/results?generation_id=${data.generation_id}`);
    } catch (error) {
      console.error('プラン生成エラー:', error);
      alert('プランの生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * バリデーションエラーメッセージを取得
   */
  const getErrorMessage = (field: string): string | undefined => {
    const error = validationErrors.find((e) => e.field === field);
    return error?.message;
  };

  /**
   * フィールドにエラーがあるかチェック
   */
  const hasError = (field: string): boolean => {
    return validationErrors.some((e) => e.field === field);
  };

  // カテゴリ別のタグを取得
  const displayTags = selectedCategory ? getTagsByCategory(selectedCategory) : allTags;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">デートプランを作成</h1>
            <p className="text-gray-600">
              AIがあなたの好みに合わせた最適なデートプランを提案します
            </p>
          </div>

          {/* 使用制限表示 */}
          <UsageLimitDisplay />

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 予算 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                予算 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                  className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 ${
                    hasError('budget') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1000"
                  max="100000"
                  step="1000"
                />
                <span className="text-gray-600">円</span>
              </div>
              <input
                type="range"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                min="1000"
                max="100000"
                step="1000"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1,000円</span>
                <span>{formData.budget.toLocaleString()}円</span>
                <span>100,000円</span>
              </div>
              {getErrorMessage('budget') && (
                <p className="text-sm text-red-500">{getErrorMessage('budget')}</p>
              )}
            </div>

            {/* 所要時間 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                所要時間 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 ${
                    hasError('duration') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                  max="12"
                />
                <span className="text-gray-600">時間</span>
              </div>
              <input
                type="range"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                min="1"
                max="12"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1時間</span>
                <span>{formData.duration}時間</span>
                <span>12時間</span>
              </div>
              {getErrorMessage('duration') && (
                <p className="text-sm text-red-500">{getErrorMessage('duration')}</p>
              )}
            </div>

            {/* 地域 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                地域 <span className="text-red-500">*</span>
              </h3>

              {/* 都道府県 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">都道府県</label>
                <select
                  value={formData.location.prefecture}
                  onChange={(e) => handleInputChange('location.prefecture', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 ${
                    hasError('location.prefecture') ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">選択してください</option>
                  {prefectures.map((prefecture) => (
                    <option key={prefecture} value={prefecture}>
                      {prefecture}
                    </option>
                  ))}
                </select>
                {getErrorMessage('location.prefecture') && (
                  <p className="text-sm text-red-500">{getErrorMessage('location.prefecture')}</p>
                )}
              </div>

              {/* 市区町村 */}
              {formData.location.prefecture && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">市区町村</label>
                  <select
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 ${
                      hasError('location.city') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">選択してください</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {getErrorMessage('location.city') && (
                    <p className="text-sm text-red-500">{getErrorMessage('location.city')}</p>
                  )}
                </div>
              )}

              {/* 最寄り駅（任意） */}
              {formData.location.city && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    最寄り駅（任意）
                  </label>
                  <input
                    type="text"
                    value={formData.location.station || ''}
                    onChange={(e) => handleInputChange('location.station', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-500"
                    placeholder="例: 渋谷駅"
                  />
                </div>
              )}
            </div>

            {/* 好み */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                好み <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-600">
                最大10個まで選択できます（選択中: {formData.preferences.length}/10）
              </p>

              {/* カテゴリフィルター */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === ''
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                {Object.entries(categories).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* タグ選択 */}
              <div className="flex flex-wrap gap-2">
                {displayTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => togglePreference(tag.name)}
                    disabled={
                      !formData.preferences.includes(tag.name) && formData.preferences.length >= 10
                    }
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.preferences.includes(tag.name)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>

              {getErrorMessage('preferences') && (
                <p className="text-sm text-red-500">{getErrorMessage('preferences')}</p>
              )}
            </div>

            {/* 特別な要望 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">特別な要望（任意）</label>
              <textarea
                value={formData.special_requests || ''}
                onChange={(e) => handleInputChange('special_requests', e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-500 ${
                  hasError('special_requests') ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                maxLength={500}
                placeholder="例: 記念日なので特別な場所でお祝いしたい"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>特別なリクエストがあれば記入してください</span>
                <span>{formData.special_requests?.length || 0}/500</span>
              </div>
              {getErrorMessage('special_requests') && (
                <p className="text-sm text-red-500">{getErrorMessage('special_requests')}</p>
              )}
            </div>

            {/* ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'AI生成中...' : 'AIでプランを生成'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 制限到達モーダル */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType={limitType}
        remaining={remaining}
      />
    </div>
  );
}
