'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: number;
  readTime: number;
  imageUrl: string;
  tags: string[];
  views: number;
  likes: number;
}

interface PopularSpot {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  imageUrl: string;
  priceRange: string;
  description: string;
  isBookmarked: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export default function PortalPage(): ReactElement {
  const [articles, setArticles] = useState<Article[]>([]);
  const [popularSpots, setPopularSpots] = useState<PopularSpot[]>([]);
  const [categories] = useState<Category[]>([
    { id: 'cafe', name: 'カフェ', icon: '☕', count: 45 },
    { id: 'restaurant', name: 'レストラン', icon: '🍽️', count: 78 },
    { id: 'activity', name: 'アクティビティ', icon: '🎯', count: 32 },
    { id: 'shopping', name: 'ショッピング', icon: '🛍️', count: 56 },
    { id: 'nature', name: '自然・公園', icon: '🌳', count: 28 },
    { id: 'culture', name: '文化・芸術', icon: '🎭', count: 41 },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // データの読み込みシミュレーション
    const loadData = async () => {
      setIsLoading(true);

      // 記事データのシミュレーション
      const mockArticles: Article[] = [
        {
          id: '1',
          title: '渋谷で楽しめるロマンチックなデートスポット10選',
          excerpt:
            '渋谷エリアでカップルにおすすめのデートスポットを厳選してご紹介。カフェから展望台まで、特別な時間を過ごせる場所ばかりです。',
          category: 'cafe',
          author: 'デートプラン編集部',
          publishedAt: Date.now() - 86400000, // 1日前
          readTime: 5,
          imageUrl: '/api/placeholder/400/250',
          tags: ['渋谷', 'デート', 'ロマンチック'],
          views: 1234,
          likes: 89,
        },
        {
          id: '2',
          title: '雨の日でも楽しめる室内デートプラン',
          excerpt:
            '天気に左右されない室内デートのアイデア集。美術館、カフェ、ショッピングモールなど、雨の日でも充実した時間を過ごせます。',
          category: 'activity',
          author: 'デートプラン編集部',
          publishedAt: Date.now() - 172800000, // 2日前
          readTime: 7,
          imageUrl: '/api/placeholder/400/250',
          tags: ['雨の日', '室内', 'デート'],
          views: 987,
          likes: 67,
        },
        {
          id: '3',
          title: '予算別デートプラン：5000円で楽しむ東京デート',
          excerpt:
            '限られた予算でも素敵なデートを楽しむ方法をご紹介。5000円以内でできるお得で楽しいデートプランを提案します。',
          category: 'restaurant',
          author: 'デートプラン編集部',
          publishedAt: Date.now() - 259200000, // 3日前
          readTime: 6,
          imageUrl: '/api/placeholder/400/250',
          tags: ['予算', '東京', 'お得'],
          views: 2156,
          likes: 156,
        },
        {
          id: '4',
          title: '季節のデートスポット：秋の紅葉デート特集',
          excerpt:
            '秋の紅葉シーズンにおすすめのデートスポットを厳選。都内の紅葉名所から近郊の絶景スポットまで、美しい秋を満喫できます。',
          category: 'nature',
          author: 'デートプラン編集部',
          publishedAt: Date.now() - 345600000, // 4日前
          readTime: 8,
          imageUrl: '/api/placeholder/400/250',
          tags: ['秋', '紅葉', '自然'],
          views: 1876,
          likes: 134,
        },
        {
          id: '5',
          title: 'カップル必見！写真映えするデートスポット',
          excerpt:
            'SNS映えする写真が撮れるデートスポットを厳選。インスタグラムで話題のスポットから隠れた名所まで、思い出に残る写真を撮影できます。',
          category: 'culture',
          author: 'デートプラン編集部',
          publishedAt: Date.now() - 432000000, // 5日前
          readTime: 4,
          imageUrl: '/api/placeholder/400/250',
          tags: ['写真', 'SNS', 'インスタ映え'],
          views: 3421,
          likes: 298,
        },
      ];

      // 人気スポットデータのシミュレーション
      const mockSpots: PopularSpot[] = [
        {
          id: '1',
          name: '渋谷スカイ',
          location: '渋谷区',
          category: 'activity',
          rating: 4.8,
          imageUrl: '/api/placeholder/300/200',
          priceRange: '¥2,000-',
          description: '東京の絶景を360度楽しめる展望台',
          isBookmarked: false,
        },
        {
          id: '2',
          name: 'Blue Bottle Coffee 渋谷店',
          location: '渋谷区',
          category: 'cafe',
          rating: 4.5,
          imageUrl: '/api/placeholder/300/200',
          priceRange: '¥500-',
          description: '香り高いコーヒーとおしゃれな空間',
          isBookmarked: true,
        },
        {
          id: '3',
          name: '代々木公園',
          location: '渋谷区',
          category: 'nature',
          rating: 4.3,
          imageUrl: '/api/placeholder/300/200',
          priceRange: '無料',
          description: '都心のオアシス、自然豊かな公園',
          isBookmarked: false,
        },
        {
          id: '4',
          name: '表参道ヒルズ',
          location: '渋谷区',
          category: 'shopping',
          rating: 4.2,
          imageUrl: '/api/placeholder/300/200',
          priceRange: '¥1,000-',
          description: 'おしゃれなショッピングモール',
          isBookmarked: true,
        },
      ];

      setArticles(mockArticles);
      setPopularSpots(mockSpots);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/portal/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleArticleClick = (articleId: string) => {
    window.location.href = `/dashboard/portal/articles/${articleId}`;
  };

  const handleSpotClick = (spotId: string) => {
    window.location.href = `/dashboard/portal/spots/${spotId}`;
  };

  const handleBookmarkToggle = (spotId: string) => {
    setPopularSpots((prev) =>
      prev.map((spot) =>
        spot.id === spotId ? { ...spot, isBookmarked: !spot.isBookmarked } : spot
      )
    );
  };

  const handleAppDownload = () => {
    window.location.href = '/dashboard/portal/download';
  };

  const filteredArticles =
    selectedCategory === 'all'
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">デート情報ポータル</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleAppDownload}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                アプリをダウンロード
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            カップルのためのデート情報ポータル
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            素敵なデートプランを見つけて、特別な時間を過ごしましょう
          </p>

          {/* 検索バー */}
          <div className="max-w-2xl mx-auto">
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
            </div>
          </div>
        </div>

        {/* カテゴリフィルター */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">カテゴリ</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて ({articles.length})
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 記事一覧 */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6">最新記事</h3>
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {categories.find((c) => c.id === article.category)?.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">{article.readTime}分で読める</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>👁️ {article.views.toLocaleString()}</span>
                          <span>❤️ {article.likes}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
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
                </article>
              ))}
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            {/* 人気スポット */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">人気スポット</h3>
              <div className="space-y-4">
                {popularSpots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => handleSpotClick(spot.id)}
                    className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={spot.imageUrl}
                        alt={spot.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{spot.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{spot.location}</p>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm text-gray-600">{spot.rating}</span>
                          <span className="text-sm text-gray-500">{spot.priceRange}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{spot.description}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkToggle(spot.id);
                        }}
                        className={`p-1 rounded ${
                          spot.isBookmarked ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        {spot.isBookmarked ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* アプリ誘導 */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">CouplePlanアプリ</h3>
              <p className="text-sm mb-4">より多くの機能をアプリでお楽しみください</p>
              <Button
                onClick={handleAppDownload}
                variant="outline"
                className="w-full bg-white text-pink-500 hover:bg-gray-100"
              >
                ダウンロード
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
