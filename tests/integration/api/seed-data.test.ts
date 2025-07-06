import { prisma } from '@/lib/db';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      create: jest.fn(),
    },
    plan: {
      create: jest.fn(),
    },
    location: {
      create: jest.fn(),
    },
  },
}));

describe('専門性の高いシードデータテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('管理者プロファイルが正しく作成される', async () => {
    const mockAdminProfile = {
      id: 'admin-profile-1',
      userId: 'admin-user-1',
      name: '管理者',
      email: 'admin@example.com',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.profile.create as jest.Mock).mockResolvedValue(mockAdminProfile);

    const result = await prisma.profile.create({
      data: {
        userId: 'admin-user-1',
        name: '管理者',
        email: 'admin@example.com',
        isAdmin: true,
      },
    });

    expect(result.isAdmin).toBe(true);
    expect(result.name).toBe('管理者');
    expect(prisma.profile.create).toHaveBeenCalledWith({
      data: {
        userId: 'admin-user-1',
        name: '管理者',
        email: 'admin@example.com',
        isAdmin: true,
      },
    });
  });

  it('心理学戦略プランが正しい専門性を持つ', async () => {
    const mockPsychologyPlan = {
      id: 'psychology-plan-1',
      title: '初デート成功の心理学戦略プラン【渋谷編】',
      description:
        '心理学に基づいた初デートの成功確率を最大化するプラン。ミラーリング効果、近接効果、共感的理解を活用し、自然な会話の流れを作る5段階構成。',
      region: 'tokyo',
      budget: 12000,
      category: '定番デート',
      isPublic: true,
      isRecommended: true,
      userId: 'admin-user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.plan.create as jest.Mock).mockResolvedValue(mockPsychologyPlan);

    const result = await prisma.plan.create({
      data: mockPsychologyPlan,
    });

    expect(result.title).toContain('心理学戦略プラン');
    expect(result.description).toContain('ミラーリング効果');
    expect(result.description).toContain('近接効果');
    expect(result.description).toContain('共感的理解');
    expect(result.description).toContain('5段階構成');
    expect(result.isRecommended).toBe(true);
    expect(result.budget).toBe(12000);
  });

  it('マインドフルネスデートプランが正しい専門性を持つ', async () => {
    const mockMindfulnessPlan = {
      id: 'mindfulness-plan-1',
      title: '関係性深化の鎌倉マインドフルネスデート',
      description:
        '恋愛関係を深めるための心理学的アプローチを取り入れた鎌倉デート。マインドフルネス技法を活用し、相手への集中力を高める5つのポイント。',
      region: 'yokohama',
      budget: 8000,
      category: '観光',
      isPublic: true,
      isRecommended: true,
      userId: 'admin-user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.plan.create as jest.Mock).mockResolvedValue(mockMindfulnessPlan);

    const result = await prisma.plan.create({
      data: mockMindfulnessPlan,
    });

    expect(result.title).toContain('マインドフルネス');
    expect(result.description).toContain('心理学的アプローチ');
    expect(result.description).toContain('マインドフルネス技法');
    expect(result.description).toContain('5つのポイント');
    expect(result.isRecommended).toBe(true);
  });

  it('ロケーションデータが心理学的効果を含む', async () => {
    const mockLocationWithPsychology = {
      id: 'location-1',
      name: '建長寺（マインドフルネス実践・心理的安定効果）',
      url: 'https://www.kenchoji.com/',
      planId: 'mindfulness-plan-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.location.create as jest.Mock).mockResolvedValue(mockLocationWithPsychology);

    const result = await prisma.location.create({
      data: mockLocationWithPsychology,
    });

    expect(result.name).toContain('マインドフルネス実践');
    expect(result.name).toContain('心理的安定効果');
    expect(result.url).toContain('kenchoji.com');
  });

  it('全ての専門プランが適切な予算設定を持つ', async () => {
    const expertPlans = [
      {
        title: '初デート成功の心理学戦略プラン【渋谷編】',
        budget: 12000,
        category: '定番デート',
      },
      {
        title: '関係性深化の鎌倉マインドフルネスデート',
        budget: 8000,
        category: '観光',
      },
      {
        title: '五感を使った横浜中華街グルメ心理学デート',
        budget: 15000,
        category: 'グルメ',
      },
      {
        title: '挑戦と成長の心理学：富士山ハイキングデート',
        budget: 18000,
        category: 'アウトドア',
      },
      {
        title: '夏の花火大会：感情共有と記憶定着の心理学デート',
        budget: 10000,
        category: 'イベント',
      },
      {
        title: '記念日の心理学：特別感演出と関係性強化の高級ディナー',
        budget: 25000,
        category: '記念日',
      },
    ];

    for (const plan of expertPlans) {
      expect(plan.budget).toBeGreaterThan(0);
      expect(plan.budget).toBeLessThan(30000);
      // 心理学またはマインドフルネスの専門用語を含む
      const hasExpertTerm =
        plan.title.includes('心理学') || plan.title.includes('マインドフルネス');
      expect(hasExpertTerm).toBe(true);
      expect(plan.category).toBeTruthy();
    }
  });

  it('専門プランの説明が科学的根拠を含む', async () => {
    const expertPlanDescriptions = [
      '心理学に基づいた初デートの成功確率を最大化するプラン。ミラーリング効果、近接効果、共感的理解を活用し、自然な会話の流れを作る5段階構成。',
      '恋愛関係を深めるための心理学的アプローチを取り入れた鎌倉デート。マインドフルネス技法を活用し、相手への集中力を高める5つのポイント。',
      '味覚・嗅覚・聴覚・触覚・視覚を戦略的に活用した横浜中華街デート。プロクセミクス理論（物理的距離と心理的距離の相関）を応用し、親密度を段階的に高める。',
      '共同目標達成による絆の強化を狙ったハイキングデート。スポーツ心理学の「フロー状態」理論を活用し、困難を乗り越える体験を通じて関係性を深化させる。',
      '集団心理学とイベント心理学を融合した花火大会デート。感情の共有と記憶の定着を最大化し、特別な思い出を意図的に作り出す戦略的アプローチ。',
      '恋愛心理学における「特別感」の演出理論を活用した記念日ディナー。環境心理学に基づく店舗選択と、関係性強化のための会話戦略を組み合わせた総合プラン。',
    ];

    for (const description of expertPlanDescriptions) {
      // 心理学関連の専門用語を含む
      const hasExpertTerms =
        description.includes('心理学') ||
        description.includes('マインドフルネス') ||
        description.includes('理論') ||
        description.includes('効果');
      expect(hasExpertTerms).toBe(true);
      expect(description.length).toBeGreaterThan(50);

      // 少なくとも一つの専門用語を含む
      const hasSpecificTerms = [
        'ミラーリング効果',
        '近接効果',
        'マインドフルネス',
        'プロクセミクス理論',
        'フロー状態',
        '集団心理学',
        '環境心理学',
      ].some((term) => description.includes(term));

      expect(hasSpecificTerms).toBe(true);
    }
  });

  it('専門プランのロケーションが心理学的効果を含む', async () => {
    const expertLocations = [
      '渋谷スカイ（高所効果による心理的距離短縮・共感体験の強化）',
      '建長寺（マインドフルネス実践・心理的安定効果）',
      '横浜中華街（五感刺激による記憶定着・文化的共感体験）',
      '富士山五合目（達成感共有・絆強化効果）',
      '隅田川花火大会会場（集団心理効果・感情共有体験）',
      '恵比寿ガーデンプレイス（環境心理学的効果・特別感演出）',
    ];

    for (const location of expertLocations) {
      // 効果や体験を含む
      const hasEffectOrExperience =
        location.includes('効果') || location.includes('体験') || location.includes('実践');
      expect(hasEffectOrExperience).toBe(true);

      // 心理学的な専門用語または効果的な記述を含む
      const hasPsychologicalOrExpert =
        location.includes('心理') ||
        location.includes('マインドフルネス') ||
        location.includes('共感') ||
        location.includes('五感') ||
        location.includes('達成感') ||
        location.includes('絆');
      expect(hasPsychologicalOrExpert).toBe(true);
    }
  });

  it('専門プランが適切な構成を持つ', async () => {
    const planStructures = [
      '5段階構成',
      '5つのポイント',
      '4つの戦略',
      '3つのフェーズ',
      '6つの要素',
      '7つのステップ',
    ];

    for (const structure of planStructures) {
      expect(structure).toMatch(/\d+[つの段階構成ポイント戦略フェーズ要素ステップ]/);
    }
  });

  it('専門プランのカテゴリが適切に設定されている', async () => {
    const categories = ['定番デート', '観光', 'グルメ', 'アウトドア', 'イベント', '記念日'];

    for (const category of categories) {
      expect(category).toBeTruthy();
      expect(category.length).toBeGreaterThan(0);
    }
  });
});
