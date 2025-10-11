// 好みタグデータ
// デートプラン作成時に使用する好みタグ

import { PreferenceTag } from '@/types/date-plan';

/**
 * 好みタグのカテゴリ
 */
export const preferenceCategories = {
  food: '食事',
  activity: 'アクティビティ',
  culture: '文化',
  nature: '自然',
  entertainment: 'エンターテイメント',
  relaxation: 'リラックス',
  shopping: 'ショッピング',
  sports: 'スポーツ',
};

/**
 * 好みタグリスト
 */
export const preferenceTags: PreferenceTag[] = [
  // 食事
  { id: 'restaurant', name: 'レストラン', category: 'food' },
  { id: 'cafe', name: 'カフェ', category: 'food' },
  { id: 'izakaya', name: '居酒屋', category: 'food' },
  { id: 'sushi', name: '寿司', category: 'food' },
  { id: 'ramen', name: 'ラーメン', category: 'food' },
  { id: 'italian', name: 'イタリアン', category: 'food' },
  { id: 'french', name: 'フレンチ', category: 'food' },
  { id: 'chinese', name: '中華', category: 'food' },
  { id: 'yakiniku', name: '焼肉', category: 'food' },
  { id: 'sweets', name: 'スイーツ', category: 'food' },

  // アクティビティ
  { id: 'movie', name: '映画', category: 'activity' },
  { id: 'walk', name: '散歩', category: 'activity' },
  { id: 'cycling', name: 'サイクリング', category: 'activity' },
  { id: 'hiking', name: 'ハイキング', category: 'activity' },
  { id: 'camping', name: 'キャンプ', category: 'activity' },
  { id: 'fishing', name: '釣り', category: 'activity' },
  { id: 'picnic', name: 'ピクニック', category: 'activity' },
  { id: 'bbq', name: 'バーベキュー', category: 'activity' },

  // 文化
  { id: 'museum', name: '美術館', category: 'culture' },
  { id: 'gallery', name: 'ギャラリー', category: 'culture' },
  { id: 'temple', name: 'お寺', category: 'culture' },
  { id: 'shrine', name: '神社', category: 'culture' },
  { id: 'castle', name: '城', category: 'culture' },
  { id: 'library', name: '図書館', category: 'culture' },
  { id: 'theater', name: '劇場', category: 'culture' },
  { id: 'concert', name: 'コンサート', category: 'culture' },
  { id: 'exhibition', name: '展覧会', category: 'culture' },

  // 自然
  { id: 'park', name: '公園', category: 'nature' },
  { id: 'garden', name: '庭園', category: 'nature' },
  { id: 'beach', name: 'ビーチ', category: 'nature' },
  { id: 'mountain', name: '山', category: 'nature' },
  { id: 'lake', name: '湖', category: 'nature' },
  { id: 'river', name: '川', category: 'nature' },
  { id: 'forest', name: '森', category: 'nature' },
  { id: 'flower', name: '花見', category: 'nature' },
  { id: 'autumn-leaves', name: '紅葉', category: 'nature' },

  // エンターテイメント
  { id: 'amusement-park', name: '遊園地', category: 'entertainment' },
  { id: 'aquarium', name: '水族館', category: 'entertainment' },
  { id: 'zoo', name: '動物園', category: 'entertainment' },
  { id: 'planetarium', name: 'プラネタリウム', category: 'entertainment' },
  { id: 'karaoke', name: 'カラオケ', category: 'entertainment' },
  { id: 'bowling', name: 'ボウリング', category: 'entertainment' },
  { id: 'darts', name: 'ダーツ', category: 'entertainment' },
  { id: 'billiards', name: 'ビリヤード', category: 'entertainment' },
  { id: 'arcade', name: 'ゲームセンター', category: 'entertainment' },

  // リラックス
  { id: 'onsen', name: '温泉', category: 'relaxation' },
  { id: 'spa', name: 'スパ', category: 'relaxation' },
  { id: 'massage', name: 'マッサージ', category: 'relaxation' },
  { id: 'yoga', name: 'ヨガ', category: 'relaxation' },
  { id: 'meditation', name: '瞑想', category: 'relaxation' },
  { id: 'reading', name: '読書', category: 'relaxation' },

  // ショッピング
  { id: 'shopping', name: 'ショッピング', category: 'shopping' },
  { id: 'mall', name: 'ショッピングモール', category: 'shopping' },
  { id: 'outlet', name: 'アウトレット', category: 'shopping' },
  { id: 'market', name: 'マーケット', category: 'shopping' },
  { id: 'bookstore', name: '書店', category: 'shopping' },
  { id: 'antique', name: '骨董品', category: 'shopping' },

  // スポーツ
  { id: 'golf', name: 'ゴルフ', category: 'sports' },
  { id: 'tennis', name: 'テニス', category: 'sports' },
  { id: 'badminton', name: 'バドミントン', category: 'sports' },
  { id: 'swimming', name: 'スイミング', category: 'sports' },
  { id: 'running', name: 'ランニング', category: 'sports' },
  { id: 'gym', name: 'ジム', category: 'sports' },
  { id: 'basketball', name: 'バスケットボール', category: 'sports' },
  { id: 'soccer', name: 'サッカー', category: 'sports' },
  { id: 'baseball', name: '野球', category: 'sports' },
];

/**
 * カテゴリ別に好みタグを取得
 */
export function getTagsByCategory(category: string): PreferenceTag[] {
  return preferenceTags.filter((tag) => tag.category === category);
}

/**
 * IDから好みタグを取得
 */
export function getTagById(id: string): PreferenceTag | undefined {
  return preferenceTags.find((tag) => tag.id === id);
}

/**
 * 名前から好みタグを検索
 */
export function searchTags(query: string): PreferenceTag[] {
  const lowerQuery = query.toLowerCase();
  return preferenceTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(lowerQuery) || tag.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * すべての好みタグを取得
 */
export function getAllTags(): PreferenceTag[] {
  return preferenceTags;
}

/**
 * すべてのカテゴリを取得
 */
export function getAllCategories(): Record<string, string> {
  return preferenceCategories;
}
