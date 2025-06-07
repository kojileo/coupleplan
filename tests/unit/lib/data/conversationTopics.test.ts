import {
  conversationTopics,
  getTopicsByCategory,
  getRandomTopic,
  getRandomTopicByCategory,
  categories,
  type ConversationTopic,
} from '@/lib/data/conversationTopics';

describe('conversationTopics', () => {
  describe('conversationTopics data', () => {
    it('conversationTopicsが配列であること', () => {
      expect(Array.isArray(conversationTopics)).toBe(true);
    });

    it('すべてのトピックが必要なプロパティを持つこと', () => {
      conversationTopics.forEach((topic) => {
        expect(topic).toHaveProperty('id');
        expect(topic).toHaveProperty('category');
        expect(topic).toHaveProperty('question');
        expect(typeof topic.id).toBe('string');
        expect(typeof topic.category).toBe('string');
        expect(typeof topic.question).toBe('string');

        if (topic.description) {
          expect(typeof topic.description).toBe('string');
        }
      });
    });

    it('すべてのIDが一意であること', () => {
      const ids = conversationTopics.map((topic) => topic.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('少なくとも1つのトピックが存在すること', () => {
      expect(conversationTopics.length).toBeGreaterThan(0);
    });

    it('すべてのカテゴリがcategories配列に含まれること', () => {
      const topicCategories = new Set(conversationTopics.map((topic) => topic.category));
      topicCategories.forEach((category) => {
        expect(categories).toContain(category);
      });
    });
  });

  describe('getTopicsByCategory', () => {
    it('指定されたカテゴリのトピックのみを返すこと', () => {
      const category = '軽い話題';
      const result = getTopicsByCategory(category);

      expect(result).toBeInstanceOf(Array);
      result.forEach((topic) => {
        expect(topic.category).toBe(category);
      });
    });

    it('存在しないカテゴリの場合は空配列を返すこと', () => {
      const result = getTopicsByCategory('存在しないカテゴリ');
      expect(result).toEqual([]);
    });

    it('各カテゴリに対して正しいトピックを返すこと', () => {
      categories.forEach((category) => {
        const result = getTopicsByCategory(category);
        expect(result.length).toBeGreaterThan(0);
        result.forEach((topic) => {
          expect(topic.category).toBe(category);
        });
      });
    });

    it('空文字のカテゴリの場合は空配列を返すこと', () => {
      const result = getTopicsByCategory('');
      expect(result).toEqual([]);
    });
  });

  describe('getRandomTopic', () => {
    it('有効なトピックを返すこと', () => {
      const result = getRandomTopic();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('question');
      expect(conversationTopics).toContainEqual(result);
    });

    it('複数回呼び出しても有効なトピックを返すこと', () => {
      for (let i = 0; i < 10; i++) {
        const result = getRandomTopic();
        expect(conversationTopics).toContainEqual(result);
      }
    });

    it('ランダム性をテストする（統計的テスト）', () => {
      const results = new Set();
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const topic = getRandomTopic();
        results.add(topic.id);
      }

      // 50回実行して少なくとも2つ以上の異なるトピックが出ることを期待
      // (確率的に非常に高い確率で成功するはず)
      expect(results.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getRandomTopicByCategory', () => {
    it('カテゴリが指定された場合、そのカテゴリのトピックを返すこと', () => {
      const category = '軽い話題';
      const result = getRandomTopicByCategory(category);

      expect(result).toBeDefined();
      if (result) {
        expect(result.category).toBe(category);
        expect(conversationTopics).toContainEqual(result);
      }
    });

    it('存在しないカテゴリの場合、undefinedを返すこと', () => {
      const result = getRandomTopicByCategory('存在しないカテゴリ');
      expect(result).toBeUndefined();
    });

    it('カテゴリが指定されていない場合、任意のトピックを返すこと', () => {
      const result = getRandomTopicByCategory();

      expect(result).toBeDefined();
      if (result) {
        expect(conversationTopics).toContainEqual(result);
      }
    });

    it('undefined が渡された場合、任意のトピックを返すこと', () => {
      const result = getRandomTopicByCategory(undefined);

      expect(result).toBeDefined();
      if (result) {
        expect(conversationTopics).toContainEqual(result);
      }
    });

    it('各カテゴリで正しく動作すること', () => {
      categories.forEach((category) => {
        const result = getRandomTopicByCategory(category);
        expect(result).toBeDefined();
        if (result) {
          expect(result.category).toBe(category);
        }
      });
    });

    it('空文字のカテゴリの場合、任意のトピックを返すこと', () => {
      const result = getRandomTopicByCategory('');
      expect(result).toBeDefined();
      if (result) {
        expect(conversationTopics).toContainEqual(result);
      }
    });
  });

  describe('categories', () => {
    it('categories配列が定義されていること', () => {
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
    });

    it('少なくとも1つのカテゴリが存在すること', () => {
      expect(categories.length).toBeGreaterThan(0);
    });

    it('すべてのカテゴリが文字列であること', () => {
      categories.forEach((category) => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });
    });

    it('カテゴリが一意であること', () => {
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });

    it('期待されるカテゴリが含まれていること', () => {
      const expectedCategories = ['軽い話題', '深い話題', '楽しい話題', 'グルメ', '恋愛', '季節'];
      expectedCategories.forEach((expectedCategory) => {
        expect(categories).toContain(expectedCategory);
      });
    });
  });

  describe('データの整合性', () => {
    it('すべてのカテゴリに対してトピックが存在すること', () => {
      categories.forEach((category) => {
        const topicsInCategory = getTopicsByCategory(category);
        expect(topicsInCategory.length).toBeGreaterThan(0);
      });
    });

    it('トピック内で使用されているカテゴリがすべてcategories配列に含まれること', () => {
      const usedCategories = new Set(conversationTopics.map((topic) => topic.category));
      usedCategories.forEach((usedCategory) => {
        expect(categories).toContain(usedCategory);
      });
    });

    it('questionフィールドが空でないこと', () => {
      conversationTopics.forEach((topic) => {
        expect(topic.question.trim().length).toBeGreaterThan(0);
      });
    });

    it('idフィールドが有効な形式であること', () => {
      conversationTopics.forEach((topic) => {
        expect(topic.id).toMatch(/^[a-z]+-\d+$/);
      });
    });
  });
});
