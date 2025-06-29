import type { APIContract } from '../setup';

// プラン一覧取得契約
export const getPlansContract: APIContract = {
  endpoint: '/api/plans',
  method: 'GET',
  request: {
    headers: {
      Authorization: 'Bearer mock-access-token',
    },
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      data: [
        {
          id: 'plan-123',
          title: 'テストプラン',
          description: 'テスト用のプランです',
          date: '2024-06-01T00:00:00.000Z',
          region: '東京',
          budget: 10000,
          isPublic: true,
          category: 'デート',
          userId: 'user-123',
          profile: {
            name: 'Test User',
          },
          likes: [],
          _count: {
            likes: 0,
          },
        },
      ],
    },
  },
  description: '認証されたユーザーが自分のプラン一覧を取得する場合',
};

// プラン作成成功契約
export const createPlanSuccessContract: APIContract = {
  endpoint: '/api/plans',
  method: 'POST',
  request: {
    headers: {
      Authorization: 'Bearer mock-access-token',
      'Content-Type': 'application/json',
    },
    body: {
      title: '新しいプラン',
      description: '新しく作成されたプランです',
      date: '2024-06-15',
      locations: [
        {
          url: 'https://example.com/location1',
          name: '場所1',
        },
      ],
      region: '大阪',
      budget: 15000,
      isPublic: false,
      category: '観光',
    },
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      data: {
        id: 'plan-456',
        title: '新しいプラン',
        description: '新しく作成されたプランです',
        date: '2024-06-15T00:00:00.000Z',
        region: '大阪',
        budget: 15000,
        isPublic: false,
        category: '観光',
        userId: 'user-123',
        profile: {
          name: 'Test User',
        },
        likes: [],
        _count: {
          likes: 0,
        },
        locations: [
          {
            id: 'location-1',
            name: '場所1',
            url: 'https://example.com/location1',
            planId: 'plan-456',
          },
        ],
      },
    },
  },
  description: '認証されたユーザーが有効なプラン情報で新しいプランを作成する場合',
};

// プラン作成失敗契約（認証なし）
export const createPlanUnauthorizedContract: APIContract = {
  endpoint: '/api/plans',
  method: 'POST',
  request: {
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      title: '新しいプラン',
      description: '新しく作成されたプランです',
      locations: [],
      budget: 15000,
      isPublic: false,
    },
  },
  response: {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      error: '認証が必要です',
    },
  },
  description: '未認証のユーザーがプランを作成しようとする場合',
};

// プラン作成失敗契約（無効なデータ）
export const createPlanInvalidDataContract: APIContract = {
  endpoint: '/api/plans',
  method: 'POST',
  request: {
    headers: {
      Authorization: 'Bearer mock-access-token',
      'Content-Type': 'application/json',
    },
    body: {
      // titleが欠けている
      description: '無効なプランです',
      locations: [],
      budget: 'invalid-budget', // 数値でない
      isPublic: false,
    },
  },
  response: {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      error: 'プランの作成に失敗しました',
    },
  },
  description: '認証されたユーザーが無効なデータでプランを作成しようとする場合',
};

// 特定プラン取得契約
export const getPlanByIdContract: APIContract = {
  endpoint: '/api/plans/plan-123',
  method: 'GET',
  request: {
    headers: {
      Authorization: 'Bearer mock-access-token',
    },
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      data: {
        id: 'plan-123',
        title: 'テストプラン',
        description: 'テスト用のプランです',
        date: '2024-06-01T00:00:00.000Z',
        region: '東京',
        budget: 10000,
        isPublic: true,
        category: 'デート',
        userId: 'user-123',
        profile: {
          name: 'Test User',
        },
        likes: [],
        _count: {
          likes: 0,
        },
        locations: [
          {
            id: 'location-1',
            name: '場所1',
            url: 'https://example.com/location1',
            planId: 'plan-123',
          },
        ],
      },
    },
  },
  description: '認証されたユーザーが特定のプランを取得する場合',
};

export const plansContracts = [
  getPlansContract,
  createPlanSuccessContract,
  createPlanUnauthorizedContract,
  createPlanInvalidDataContract,
  getPlanByIdContract,
];
