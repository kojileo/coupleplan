'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: number;
  readTime: number;
  imageUrl: string;
  tags: string[];
  views: number;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface RelatedArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  readTime: number;
  publishedAt: number;
}

export default function ArticleDetailPage({ params }: { params: { id: string } }): ReactElement {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      setIsLoading(true);

      // 記事データのシミュレーション
      const mockArticle: Article = {
        id: params.id,
        title: '渋谷で楽しめるロマンチックなデートスポット10選',
        content: `# 渋谷で楽しめるロマンチックなデートスポット10選

渋谷エリアは、カップルにとって魅力的なデートスポットが数多く存在する人気エリアです。今回は、特別な時間を過ごせるロマンチックなスポットを厳選してご紹介します。

## 1. 渋谷スカイ

**住所**: 東京都渋谷区渋谷2-1-1  
**営業時間**: 9:00-22:30（最終入場22:00）  
**料金**: 大人¥2,000

渋谷の新名所として注目を集める展望台です。地上230mの高さから見る東京の絶景は格別で、特に夕暮れ時から夜景にかけての時間帯は、カップルにとって最高のロマンチックな時間を過ごせます。

### おすすめポイント
- 360度のパノラマビュー
- 夕日と夜景の両方を楽しめる
- 記念写真撮影に最適

## 2. Blue Bottle Coffee 渋谷店

**住所**: 東京都渋谷区恵比寿1-32-8  
**営業時間**: 8:00-20:00  
**料金**: コーヒー¥500-800

香り高いコーヒーとおしゃれな空間でリラックスタイムを楽しめるカフェです。落ち着いた雰囲気で、ゆっくりと会話を楽しむのに最適です。

### おすすめポイント
- 本格的なコーヒー
- インスタ映えする店内デザイン
- 落ち着いた雰囲気

## 3. 代々木公園

**住所**: 東京都渋谷区代々木神園町2-1  
**営業時間**: 24時間開放  
**料金**: 無料

都心のオアシスとして親しまれる大きな公園です。四季折々の自然を楽しめ、散歩やピクニックに最適な場所です。

### おすすめポイント
- 四季の自然を楽しめる
- 広々とした空間
- 無料で利用可能

## 4. 表参道ヒルズ

**住所**: 東京都渋谷区神宮前4-12-10  
**営業時間**: 11:00-21:00  
**料金**: ショッピング・食事による

おしゃれなショッピングモールとして人気のスポットです。ブランドショップやレストランが集まり、一日中楽しめる場所です。

### おすすめポイント
- おしゃれなショッピング
- 多様なレストラン
- 建築デザインも見どころ

## 5. 明治神宮

**住所**: 東京都渋谷区代々木神園町1-1  
**営業時間**: 6:00-18:00（季節により変動）  
**料金**: 無料

都心にありながら静寂な空間を提供する神社です。参拝や散策を通じて、心を落ち着かせることができます。

### おすすめポイント
- 静寂な空間
- 歴史ある建築
- 自然豊かな環境

## デートプランのコツ

### 時間帯別のおすすめ
- **午前**: 明治神宮での散策
- **午後**: 表参道ヒルズでのショッピング
- **夕方**: 渋谷スカイでの夕日鑑賞
- **夜**: レストランでのディナー

### 予算の目安
- **低予算**: ¥3,000-5,000（公園散策 + カフェ）
- **中予算**: ¥8,000-15,000（展望台 + レストラン）
- **高予算**: ¥20,000以上（高級レストラン + アクティビティ）

## まとめ

渋谷エリアには、カップルが楽しめる多様なスポットが揃っています。相手の好みや予算に合わせて、最適なプランを組み立ててみてください。特別な時間を過ごすことで、きっと素敵な思い出が作れるはずです。`,
        excerpt:
          '渋谷エリアでカップルにおすすめのデートスポットを厳選してご紹介。カフェから展望台まで、特別な時間を過ごせる場所ばかりです。',
        category: 'cafe',
        author: 'デートプラン編集部',
        publishedAt: Date.now() - 86400000,
        readTime: 5,
        imageUrl: '/api/placeholder/800/400',
        tags: ['渋谷', 'デート', 'ロマンチック'],
        views: 1234,
        likes: 89,
        isLiked: false,
        isBookmarked: false,
      };

      // 関連記事のシミュレーション
      const mockRelatedArticles: RelatedArticle[] = [
        {
          id: '2',
          title: '雨の日でも楽しめる室内デートプラン',
          excerpt: '天気に左右されない室内デートのアイデア集。',
          imageUrl: '/api/placeholder/300/200',
          readTime: 7,
          publishedAt: Date.now() - 172800000,
        },
        {
          id: '3',
          title: '予算別デートプラン：5000円で楽しむ東京デート',
          excerpt: '限られた予算でも素敵なデートを楽しむ方法をご紹介。',
          imageUrl: '/api/placeholder/300/200',
          readTime: 6,
          publishedAt: Date.now() - 259200000,
        },
        {
          id: '4',
          title: '季節のデートスポット：秋の紅葉デート特集',
          excerpt: '秋の紅葉シーズンにおすすめのデートスポットを厳選。',
          imageUrl: '/api/placeholder/300/200',
          readTime: 8,
          publishedAt: Date.now() - 345600000,
        },
      ];

      setArticle(mockArticle);
      setRelatedArticles(mockRelatedArticles);
      setIsLiked(mockArticle.isLiked);
      setIsBookmarked(mockArticle.isBookmarked);
      setIsLoading(false);
    };

    loadArticle();
  }, [params.id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (article) {
      setArticle((prev) =>
        prev
          ? {
              ...prev,
              likes: prev.likes + (isLiked ? -1 : 1),
              isLiked: !isLiked,
            }
          : null
      );
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (article) {
      setArticle((prev) =>
        prev
          ? {
              ...prev,
              isBookmarked: !isBookmarked,
            }
          : null
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('リンクをコピーしました');
    }
  };

  const handleRelatedArticleClick = (articleId: string) => {
    window.location.href = `/dashboard/portal/articles/${articleId}`;
  };

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

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">記事が見つかりませんでした</p>
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
              <h1 className="text-2xl font-bold text-gray-900">記事詳細</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={handleShare} variant="outline" size="sm">
                共有
              </Button>
              <Button
                onClick={handleBookmark}
                variant="outline"
                size="sm"
                className={isBookmarked ? 'text-red-500' : ''}
              >
                {isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 記事ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              ☕ カフェ
            </span>
            <span className="text-sm text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
            <span className="text-sm text-gray-500">{article.readTime}分で読める</span>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{article.title}</h1>

          <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>👁️ {article.views.toLocaleString()}</span>
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <span>{isLiked ? '❤️' : '🤍'}</span>
                <span>{article.likes}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 記事画像 */}
        <div className="mb-8">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-xl"
          />
        </div>

        {/* 記事本文 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: article.content
                  .replace(
                    /^# (.*$)/gim,
                    '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8">$1</h1>'
                  )
                  .replace(
                    /^## (.*$)/gim,
                    '<h2 class="text-2xl font-bold text-gray-800 mb-4 mt-6">$1</h2>'
                  )
                  .replace(
                    /^### (.*$)/gim,
                    '<h3 class="text-xl font-bold text-gray-700 mb-3 mt-4">$1</h3>'
                  )
                  .replace(
                    /^\*\*(.*?)\*\*: (.*$)/gim,
                    '<p class="mb-2"><strong class="text-gray-700">$1</strong>: <span class="text-gray-600">$2</span></p>'
                  )
                  .replace(/^- (.*$)/gim, '<li class="mb-1 text-gray-600">$1</li>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
                  .replace(/\n/g, '<br>'),
              }}
            />
          </div>
        </div>

        {/* 関連記事 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">関連記事</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <div
                key={relatedArticle.id}
                onClick={() => handleRelatedArticleClick(relatedArticle.id)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img
                  src={relatedArticle.imageUrl}
                  alt={relatedArticle.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {relatedArticle.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{relatedArticle.excerpt}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{relatedArticle.readTime}分</span>
                  <span>•</span>
                  <span>{new Date(relatedArticle.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
