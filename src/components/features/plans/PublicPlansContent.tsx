'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';

interface ExtendedPlan extends Plan {
  profile?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isAdmin?: boolean;
  };
  _count?: {
    likes: number;
  };
}

const REGIONS = [
  { value: '', label: 'すべて' },
  { value: 'tokyo', label: '東京' },
  { value: 'osaka', label: '大阪' },
  { value: 'kyoto', label: '京都' },
  { value: 'fukuoka', label: '福岡' },
  { value: 'sapporo', label: '札幌' },
  { value: 'nagoya', label: '名古屋' },
  { value: 'yokohama', label: '横浜' },
  { value: 'kobe', label: '神戸' },
  { value: 'other', label: 'その他' },
];

const CATEGORIES = [
  { value: '', label: 'すべて' },
  { value: '定番デート', label: '定番デート' },
  { value: '観光', label: '観光' },
  { value: 'グルメ', label: 'グルメ' },
  { value: 'アクティビティ', label: 'アクティビティ' },
  { value: '季節限定', label: '季節限定' },
  { value: '記念日', label: '記念日' },
];

export default function PublicPlansContent(): ReactElement {
  const [plans, setPlans] = useState<ExtendedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchPublicPlans = async (): Promise<void> => {
      try {
        const response = await api.plans.listPublic();
        if ('error' in response) throw new Error(response.error);
        setPlans(response.data || []);
      } catch (error) {
        console.error('公開プランの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchPublicPlans();
  }, []);

  const filteredPlans = plans.filter((plan: ExtendedPlan) => {
    const regionMatch = !selectedRegion || plan.region === selectedRegion;
    const categoryMatch = !selectedCategory || plan.category === selectedCategory;
    return regionMatch && categoryMatch;
  });

  // 管理者プランとユーザープランを分離
  const adminPlans = filteredPlans.filter((plan: ExtendedPlan) => plan.profile?.isAdmin === true);
  const userPlans = filteredPlans.filter((plan: ExtendedPlan) => plan.profile?.isAdmin !== true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-25 to-purple-50" />

        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full px-6 py-3 shadow-lg mb-8">
                <span className="text-rose-500 mr-2 text-sm">✨</span>
                <span className="text-gray-700 font-medium text-sm">
                  厳選された公開デートプラン
                </span>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                プロが監修した
              </span>
              <span className="block text-gray-900 mt-2">デートプラン集</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              恋愛・デートの専門家が監修したプランから、実際のカップルが成功させたプランまで。
              <br />
              <span className="font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                あなたの理想のデートがここにあります。
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* フィルターセクション */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">公開プラン一覧</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="region" className="text-sm font-medium text-gray-700">
                  地域:
                </label>
                <select
                  id="region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  {REGIONS.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                  カテゴリ:
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-200 border-t-rose-600" />
            </div>
          ) : (
            <div className="space-y-16">
              {/* 専門家監修プラン */}
              {adminPlans.length > 0 && (
                <div>
                  <div className="mb-8">
                    <div className="inline-flex items-center bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-6 py-3 mb-4">
                      <span className="text-amber-600 mr-2 text-lg">👨‍💼</span>
                      <span className="text-amber-800 font-semibold">
                        恋愛・デート専門家監修プラン
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      プロが厳選した確実に成功するデートプラン
                    </h3>
                    <p className="text-gray-600 text-lg">
                      恋愛心理学に基づいて設計された、成功率の高いデートプランを専門家が監修しています。
                    </p>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {adminPlans.map((plan: ExtendedPlan) => (
                      <div
                        key={plan.id}
                        className="group hover:scale-105 transition-all duration-300"
                      >
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-amber-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-2 rounded-bl-lg rounded-tr-2xl">
                            <span className="text-sm font-bold">専門家監修</span>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                              {plan.title}
                            </h4>
                            <p className="text-gray-600 mb-4 line-clamp-3">{plan.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {plan.region && (
                                <span className="bg-rose-100 text-rose-700 text-xs px-3 py-1 rounded-full font-medium">
                                  📍 {plan.region}
                                </span>
                              )}
                              {plan.category && (
                                <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                                  🎯 {plan.category}
                                </span>
                              )}
                              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                                💰 ¥{plan.budget.toLocaleString()}
                              </span>
                              {plan._count && plan._count.likes > 0 && (
                                <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                                  ❤️ {plan._count.likes}
                                </span>
                              )}
                            </div>
                            <div className="text-center">
                              <Link
                                href="/signup"
                                className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                              >
                                詳細を見る
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ユーザー投稿プラン */}
              {userPlans.length > 0 && (
                <div>
                  <div className="mb-8">
                    <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-6 py-3 mb-4">
                      <span className="text-blue-600 mr-2 text-lg">💑</span>
                      <span className="text-blue-800 font-semibold">
                        実際のカップルが成功したプラン
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      リアルな体験から生まれたデートプラン
                    </h3>
                    <p className="text-gray-600 text-lg">
                      実際のカップルが体験して成功したデートプランです。生の体験談が詰まっています。
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {userPlans.map((plan: ExtendedPlan) => (
                      <div
                        key={plan.id}
                        className="group hover:scale-105 transition-all duration-300"
                      >
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-blue-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-400 to-indigo-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-xl">
                            <span className="text-xs font-medium">実体験</span>
                          </div>
                          <div className="mt-2">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {plan.title}
                            </h4>
                            <p className="text-gray-600 mb-4 line-clamp-3">{plan.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {plan.region && (
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                  📍 {plan.region}
                                </span>
                              )}
                              {plan.category && (
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                  🎯 {plan.category}
                                </span>
                              )}
                              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                💰 ¥{plan.budget.toLocaleString()}
                              </span>
                              {plan._count && plan._count.likes > 0 && (
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                  ❤️ {plan._count.likes}
                                </span>
                              )}
                            </div>
                            <div className="text-center">
                              <Link
                                href="/signup"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200"
                              >
                                詳細を見る
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* プランが見つからない場合 */}
              {filteredPlans.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="bg-gray-100 rounded-full p-8 mx-auto w-24 h-24 flex items-center justify-center mb-8">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      プランが見つかりません
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {selectedRegion || selectedCategory
                        ? '選択された条件に一致するプランがありません。フィルターを変更してお試しください。'
                        : '公開されているプランがまだありません。'}
                    </p>
                    <div className="space-y-4">
                      <Link
                        href="/signup"
                        className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                      >
                        アカウントを作成してプランを投稿する
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* デートプラン作成のメリット紹介 */}
      <section className="py-16 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              あなたもデートプランを作成しませんか？
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              成功したデートプランを共有して、他のカップルの参考にしてもらいましょう。
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-3xl mb-4">💕</div>
                <h3 className="font-semibold text-gray-900 mb-2">思い出を共有</h3>
                <p className="text-gray-600 text-sm">
                  素敵なデートの記録を残して、他のカップルと共有できます。
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-3xl mb-4">🌟</div>
                <h3 className="font-semibold text-gray-900 mb-2">評価を獲得</h3>
                <p className="text-gray-600 text-sm">
                  あなたのプランが他のカップルから「いいね」をもらえます。
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">新しい発見</h3>
                <p className="text-gray-600 text-sm">
                  他のプランを見て、新しいデートアイデアを発見できます。
                </p>
              </div>
            </div>
            <Link
              href="/signup"
              className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              無料でアカウントを作成する
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
