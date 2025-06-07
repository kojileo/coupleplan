// 会話ネタのカテゴリと内容
export interface ConversationTopic {
  id: string;
  category: string;
  question: string;
  description?: string;
}

export const conversationTopics: ConversationTopic[] = [
  // 軽い話題・アイスブレイク
  {
    id: 'light-1',
    category: '軽い話題',
    question: '今日一番印象に残ったことは何？',
    description: 'デートの感想を共有しよう',
  },
  {
    id: 'light-2',
    category: '軽い話題',
    question: '最近ハマっているものはある？',
    description: 'お互いの趣味を知るきっかけに',
  },
  {
    id: 'light-3',
    category: '軽い話題',
    question: '子供の頃の夢は何だった？',
    description: '昔の話で盛り上がろう',
  },
  {
    id: 'light-4',
    category: '軽い話題',
    question: '今度の休日は何をしたい？',
    description: '次のデートの参考にも',
  },

  // 深い話題
  {
    id: 'deep-1',
    category: '深い話題',
    question: '人生で一番大切にしていることは？',
    description: '価値観を知り合おう',
  },
  {
    id: 'deep-2',
    category: '深い話題',
    question: '5年後、どんな自分になっていたい？',
    description: '将来の話をしてみよう',
  },
  {
    id: 'deep-3',
    category: '深い話題',
    question: '今まで受けた最高のプレゼントは？',
    description: '思い出話で距離を縮めよう',
  },

  // 楽しい話題・ゲーム系
  {
    id: 'fun-1',
    category: '楽しい話題',
    question: 'もし魔法が使えたら何をしたい？',
    description: '想像力を膨らませて楽しもう',
  },
  {
    id: 'fun-2',
    category: '楽しい話題',
    question: '無人島に一つだけ持っていくとしたら？',
    description: '定番だけど盛り上がる質問',
  },
  {
    id: 'fun-3',
    category: '楽しい話題',
    question: '今まで見た中で一番面白かった映画は？',
    description: '共通の話題を見つけよう',
  },
  {
    id: 'fun-4',
    category: '楽しい話題',
    question: 'もし宝くじで1億円当たったら？',
    description: '夢の話で盛り上がろう',
  },

  // グルメ・趣味
  {
    id: 'food-1',
    category: 'グルメ',
    question: '人生最後の晩餐は何を食べたい？',
    description: '好きな食べ物について話そう',
  },
  {
    id: 'food-2',
    category: 'グルメ',
    question: '今度一緒に作ってみたい料理は？',
    description: '次の家デートの参考に',
  },
  {
    id: 'food-3',
    category: 'グルメ',
    question: '苦手な食べ物を克服するとしたら？',
    description: 'お互いの好みを知ろう',
  },

  // 恋愛・関係性
  {
    id: 'love-1',
    category: '恋愛',
    question: '理想のデートはどんなの？',
    description: '相手の好みを知るチャンス',
  },
  {
    id: 'love-2',
    category: '恋愛',
    question: '一緒にいて一番落ち着く瞬間は？',
    description: '関係性を深める質問',
  },
  {
    id: 'love-3',
    category: '恋愛',
    question: '今度挑戦してみたいことは？',
    description: '一緒に新しいことを始めるきっかけに',
  },

  // 季節・時事
  {
    id: 'season-1',
    category: '季節',
    question: '今の季節で一番好きなことは？',
    description: '季節の話題で自然な会話を',
  },
  {
    id: 'season-2',
    category: '季節',
    question: '来年の今頃は何をしていたい？',
    description: '一年後の話をしてみよう',
  },
  {
    id: 'season-3',
    category: '季節',
    question: 'この時期にしかできないことって何？',
    description: '季節限定の楽しみを見つけよう',
  },
];

// カテゴリ別に取得する関数
export function getTopicsByCategory(category: string): ConversationTopic[] {
  return conversationTopics.filter((topic) => topic.category === category);
}

// ランダムに話題を取得する関数
export function getRandomTopic(): ConversationTopic {
  const randomIndex = Math.floor(Math.random() * conversationTopics.length);
  return conversationTopics[randomIndex];
}

// カテゴリをランダムに選んでから話題を取得
export function getRandomTopicByCategory(category?: string): ConversationTopic | undefined {
  const trimmedCategory = category?.trim();
  if (trimmedCategory) {
    const categoryTopics = getTopicsByCategory(trimmedCategory);
    if (categoryTopics.length === 0) {
      return undefined;
    }
    const randomIndex = Math.floor(Math.random() * categoryTopics.length);
    return categoryTopics[randomIndex];
  }
  return getRandomTopic();
}

// 全カテゴリのリスト
export const categories = ['軽い話題', '深い話題', '楽しい話題', 'グルメ', '恋愛', '季節'];
