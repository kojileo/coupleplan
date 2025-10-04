'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface SearchResult {
  id: string;
  type: 'article' | 'spot';
  title: string;
  description: string;
  category: string;
  location?: string;
  rating?: number;
  priceRange?: string;
  imageUrl: string;
  publishedAt?: number;
  readTime?: number;
  views?: number;
  likes?: number;
  tags: string[];
}

interface Filter {
  category: string;
  priceRange: string;
  rating: number;
  sortBy: string;
}

export default function SearchPage(): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Filter>({
    category: 'all',
    priceRange: 'all',
    rating: 0,
    sortBy: 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'cafe', name: 'カフェ' },
    { id: 'restaurant', name: 'レストラン' },
    { id: 'activity', name: 'アクティビティ' },
    { id: 'shopping', name: 'ショッピング' },
    { id: 'nature', name: '自然・公園' },
    { id: 'culture', name: '文化・芸術' },
  ];

  const priceRanges = [
    { id: 'all', name: 'すべて' },
    { id: 'free', name: '無料' },
    { id: 'low', name: '¥1,000未満' },
    { id: 'medium', name: '¥1,000-5,000' },
    { id: 'high', name: '¥5,000以上' },
  ];

  const sortOptions = [
    { id: 'relevance', name: '関連度順' },
    { id: 'newest', name: '新しい順' },
    { id: 'popular', name: '人気順' },
    { id: 'rating', name: '評価順' },
    { id: 'price_low', name: '価格の安い順' },
    { id: 'price_high', name: '価格の高い順' },
  ];

  useEffect(() => {
    // URLパラメータから検索クエリを取得
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';
    setSearchQuery(query);

    if (query) {
      performSearch(query);
    }
  }, []);

  const performSearch = async (query: string) => {
    setIsLoading(true);

    // 検索結果のシミュレーション
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'article',
        title: '渋谷で楽しめるロマンチックなデートスポット10選',
        description:
          '渋谷エリアでカップルにおすすめのデートスポットを厳選してご紹介。カフェから展望台まで、特別な時間を過ごせる場所ばかりです。',
        category: 'cafe',
        imageUrl: '/api/placeholder/300/200',
        publishedAt: Date.now() - 86400000,
        readTime: 5,
        views: 1234,
        likes: 89,
        tags: ['渋谷', 'デート', 'ロマンチック'],
      },
      {
        id: '2',
        type: 'spot',
        title: '渋谷スカイ',
        description: '東京の絶景を360度楽しめる展望台。都内随一の高さから見る夜景は格別です。',
        category: 'activity',
        location: '渋谷区',
        rating: 4.8,
        priceRange: '¥2,000-',
        imageUrl: '/api/placeholder/300/200',
        tags: ['渋谷', '展望台', '夜景'],
      },
      {
        id: '3',
        type: 'spot',
        title: 'Blue Bottle Coffee 渋谷店',
        description:
          '香り高いコーヒーとおしゃれな空間でリラックスタイム。カップルにおすすめのカフェです。',
        category: 'cafe',
        location: '渋谷区',
        rating: 4.5,
        priceRange: '¥500-',
        imageUrl: '/api/placeholder/300/200',
        tags: ['渋谷', 'カフェ', 'コーヒー'],
      },
      {
        id: '4',
        type: 'article',
        title: '雨の日でも楽しめる室内デートプラン',
        description:
          '天気に左右されない室内デートのアイデア集。美術館、カフェ、ショッピングモールなど、雨の日でも充実した時間を過ごせます。',
        category: 'activity',
        imageUrl: '/api/placeholder/300/200',
        publishedAt: Date.now() - 172800000,
        readTime: 7,
        views: 987,
        likes: 67,
        tags: ['雨の日', '室内', 'デート'],
      },
      {
        id: '5',
        type: 'spot',
        title: '代々木公園',
        description: '都心のオアシス、自然豊かな公園。散歩やピクニックに最適な場所です。',
        category: 'nature',
        location: '渋谷区',
        rating: 4.3,
        priceRange: '無料',
        imageUrl: '/api/placeholder/300/200',
        tags: ['渋谷', '公園', '自然'],
      },
    ];

    // フィルタリング
    let filteredResults = mockResults.filter((result) => {
      if (filters.category !== 'all' && result.category !== filters.category) {
        return false;
      }
      if (filters.priceRange !== 'all') {
        if (filters.priceRange === 'free' && result.priceRange !== '無料') {
          return false;
        }
        if (
          filters.priceRange === 'low' &&
          result.priceRange &&
          !result.priceRange.includes('¥1,000未満')
        ) {
          return false;
        }
        // 他の価格帯のフィルタリングロジック
      }
      if (filters.rating > 0 && (!result.rating || result.rating < filters.rating)) {
        return false;
      }
      return true;
    });

    // ソート
    filteredResults.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return (b.publishedAt || 0) - (a.publishedAt || 0);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price_low':
          // 価格の安い順のロジック
          return 0;
        case 'price_high':
          // 価格の高い順のロジック
          return 0;
        default:
          return 0;
      }
    });

    setResults(filteredResults);
    setIsLoading(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleFilterChange = (key: keyof Filter, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'article') {
      window.location.href = `/dashboard/portal/articles/${result.id}`;
    } else {
      window.location.href = `/dashboard/portal/spots/${result.id}`;
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, string> = {
      cafe: '☕',
      restaurant: '🍽️',
      activity: '🎯',
      shopping: '🛍️',
      nature: '🌳',
      culture: '🎭',
    };
    return icons[categoryId] || '📍';
  };

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
              <h1 className="text-2xl font-bold text-gray-900">検索結果</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索バー */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="デートスポットやキーワードを検索..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button onClick={handleSearch} className="px-8">
              検索
            </Button>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="px-4">
              {showFilters ? 'フィルターを閉じる' : 'フィルター'}
            </Button>
          </div>
        </div>

        {/* フィルター */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">フィルター</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">価格帯</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">評価</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>すべて</option>
                  <option value={4}>4.0以上</option>
                  <option value={4.5}>4.5以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 検索結果 */}
        <div className="mb-4">
          <p className="text-gray-600">
            「{searchQuery}」の検索結果: {results.length}件
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">検索中...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500">検索結果が見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={result.imageUrl}
                      alt={result.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {getCategoryIcon(result.category)} {getCategoryName(result.category)}
                      </span>
                      {result.type === 'article' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          記事
                        </span>
                      )}
                      {result.type === 'spot' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          スポット
                        </span>
                      )}
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {result.title}
                    </h4>

                    <p className="text-gray-600 mb-4 line-clamp-3">{result.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {result.location && <span>📍 {result.location}</span>}
                        {result.rating && <span>⭐ {result.rating}</span>}
                        {result.priceRange && <span>💰 {result.priceRange}</span>}
                        {result.views && <span>👁️ {result.views.toLocaleString()}</span>}
                        {result.likes && <span>❤️ {result.likes}</span>}
                        {result.readTime && <span>📖 {result.readTime}分</span>}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
