'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface SavedPlan {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  lastModified: number;
  status: 'draft' | 'completed' | 'favorite' | 'archived';
  category: string;
  duration: string;
  budget: string;
  rating?: number;
  tags: string[];
  isShared: boolean;
  partnerName?: string;
  spots: {
    name: string;
    type: string;
    time: string;
  }[];
}

export default function PlansPage(): ReactElement {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'rating'>('newest');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);

    // 保存されたプランのシミュレーション
    const mockPlans: SavedPlan[] = [
      {
        id: 'plan1',
        title: 'ロマンチックな渋谷デート',
        description: 'カフェ巡りから夜景まで、二人だけの特別な時間を過ごせるプラン',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2日前
        lastModified: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1日前
        status: 'completed',
        category: 'デート',
        duration: '6時間',
        budget: '15,000円',
        rating: 4.8,
        tags: ['カフェ', '夜景', 'レストラン'],
        isShared: true,
        partnerName: 'パートナー',
        spots: [
          { name: 'Blue Bottle Coffee 渋谷店', type: 'カフェ', time: '14:00-15:30' },
          { name: '渋谷スカイ', type: '展望台', time: '16:00-17:30' },
          { name: '隠れ家イタリアン', type: 'レストラン', time: '18:30-20:30' },
        ],
      },
      {
        id: 'plan2',
        title: 'アートとグルメの新宿散策',
        description: '美術館巡りから隠れ家レストランまで、文化的な一日を楽しむプラン',
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5日前
        lastModified: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3日前
        status: 'favorite',
        category: '文化',
        duration: '8時間',
        budget: '12,000円',
        rating: 4.6,
        tags: ['美術館', 'グルメ', '散策'],
        isShared: false,
        spots: [
          { name: '新宿御苑', type: '公園', time: '10:00-11:30' },
          { name: '東京都美術館', type: '美術館', time: '12:00-15:00' },
          { name: '隠れ家フレンチ', type: 'レストラン', time: '18:00-20:00' },
        ],
      },
      {
        id: 'plan3',
        title: 'リラックス温泉デート',
        description: '疲れを癒す温泉と美味しい料理で、ゆっくりとした時間を過ごすプラン',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7日前
        lastModified: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6日前
        status: 'draft',
        category: 'リラックス',
        duration: '12時間',
        budget: '25,000円',
        tags: ['温泉', 'リラックス', 'グルメ'],
        isShared: false,
        spots: [{ name: '箱根温泉旅館', type: '温泉', time: '14:00-翌日10:00' }],
      },
      {
        id: 'plan4',
        title: 'アクティブなアウトドアデート',
        description: 'ハイキングからBBQまで、自然の中でアクティブに楽しむプラン',
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10日前
        lastModified: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8日前
        status: 'completed',
        category: 'アウトドア',
        duration: '10時間',
        budget: '8,000円',
        rating: 4.9,
        tags: ['ハイキング', 'BBQ', '自然'],
        isShared: true,
        partnerName: 'パートナー',
        spots: [
          { name: '高尾山', type: '山', time: '08:00-12:00' },
          { name: 'BBQ場', type: 'BBQ', time: '13:00-17:00' },
        ],
      },
      {
        id: 'plan5',
        title: '映画とディナーの定番デート',
        description: '人気映画を観て、お気に入りのレストランでディナーを楽しむ定番プラン',
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14日前
        lastModified: Date.now() - 12 * 24 * 60 * 60 * 1000, // 12日前
        status: 'archived',
        category: '定番',
        duration: '5時間',
        budget: '10,000円',
        rating: 4.2,
        tags: ['映画', 'ディナー', '定番'],
        isShared: false,
        spots: [
          { name: 'シネマコンプレックス', type: '映画館', time: '15:00-17:30' },
          { name: 'お気に入りレストラン', type: 'レストラン', time: '18:30-20:30' },
        ],
      },
    ];

    // データ読み込みのシミュレーション
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPlans(mockPlans);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'favorite':
        return 'bg-pink-100 text-pink-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'favorite':
        return 'お気に入り';
      case 'draft':
        return '下書き';
      case 'archived':
        return 'アーカイブ';
      default:
        return status;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateNewPlan = () => {
    window.location.href = '/dashboard/ai-plan';
  };

  const handleViewPlan = (planId: string) => {
    window.location.href = `/dashboard/ai-plan/details/${planId}`;
  };

  const handleEditPlan = (planId: string) => {
    window.location.href = `/dashboard/ai-plan/customize/${planId}`;
  };

  const handleSharePlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      if (navigator.share) {
        navigator.share({
          title: plan.title,
          text: plan.description,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('プランのリンクをコピーしました');
      }
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('このプランを削除しますか？')) {
      setPlans((prev) => prev.filter((plan) => plan.id !== planId));
      alert('プランを削除しました');
    }
  };

  const handleToggleFavorite = (planId: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              status: plan.status === 'favorite' ? 'completed' : 'favorite',
            }
          : plan
      )
    );
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesCategory = selectedCategory === 'all' || plan.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt - a.createdAt;
      case 'oldest':
        return a.createdAt - b.createdAt;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="relative">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-rose-500 border-r-pink-500"
            role="status"
            aria-label="読み込み中"
          />
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-30" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={() => window.history.back()} variant="outline" size="sm">
                ← 戻る
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">保存されたプラン</h1>
            </div>
            <Button
              onClick={handleCreateNewPlan}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              🤖 新しいプランを作成
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルター・検索 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="プラン名、説明、タグで検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="デート">デート</option>
                <option value="文化">文化</option>
                <option value="リラックス">リラックス</option>
                <option value="アウトドア">アウトドア</option>
                <option value="定番">定番</option>
              </select>
            </div>

            {/* ステータスフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="completed">完了</option>
                <option value="favorite">お気に入り</option>
                <option value="draft">下書き</option>
                <option value="archived">アーカイブ</option>
              </select>
            </div>

            {/* 並び順 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="title">タイトル順</option>
                <option value="rating">評価順</option>
              </select>
            </div>
          </div>
        </div>

        {/* プラン一覧 */}
        {sortedPlans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">プランがありません</h3>
            <p className="text-gray-600 mb-8">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? '検索条件に一致するプランがありません'
                : 'まだプランが保存されていません'}
            </p>
            <Button
              onClick={handleCreateNewPlan}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 text-lg font-bold rounded-xl"
            >
              🤖 最初のプランを作成
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{plan.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(plan.status)}`}
                      >
                        {getStatusLabel(plan.status)}
                      </span>
                      {plan.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm font-medium text-gray-700">{plan.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>⏱️ {plan.duration}</span>
                    <span>💰 {plan.budget}</span>
                    <span>📅 {formatDate(plan.createdAt)}</span>
                  </div>

                  {/* タグ */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-rose-100 text-rose-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* スポット数 */}
                  <div className="text-sm text-gray-500 mb-4">
                    📍 {plan.spots.length}箇所のスポット
                    {plan.isShared && plan.partnerName && (
                      <span className="ml-2">👥 {plan.partnerName}と共有中</span>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleViewPlan(plan.id)}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      詳細
                    </Button>
                    <Button onClick={() => handleEditPlan(plan.id)} variant="outline" size="sm">
                      編集
                    </Button>
                    <Button onClick={() => handleSharePlan(plan.id)} variant="outline" size="sm">
                      共有
                    </Button>
                    <Button
                      onClick={() => handleToggleFavorite(plan.id)}
                      variant="outline"
                      size="sm"
                      className={plan.status === 'favorite' ? 'text-pink-600' : ''}
                    >
                      {plan.status === 'favorite' ? '❤️' : '🤍'}
                    </Button>
                    <Button
                      onClick={() => handleDeletePlan(plan.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 統計情報 */}
        {sortedPlans.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">統計情報</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
                <div className="text-sm text-gray-600">総プラン数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {plans.filter((p) => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">完了済み</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {plans.filter((p) => p.status === 'favorite').length}
                </div>
                <div className="text-sm text-gray-600">お気に入り</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {plans.filter((p) => p.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">下書き</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
