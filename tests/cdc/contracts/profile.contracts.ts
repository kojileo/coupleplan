import type { APIContract } from '../setup';

// プロファイル取得契約
export const getProfileContract: APIContract = {
  endpoint: '/api/profile',
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
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  },
  description: '認証されたユーザーが自分のプロファイルを取得する場合',
};

// プロファイル更新成功契約
export const updateProfileSuccessContract: APIContract = {
  endpoint: '/api/profile',
  method: 'PUT',
  request: {
    headers: {
      Authorization: 'Bearer mock-access-token',
      'Content-Type': 'application/json',
    },
    body: {
      name: '更新されたユーザー名',
      email: 'updated@example.com',
    },
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      data: {
        id: 'user-123',
        name: '更新されたユーザー名',
        email: 'updated@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-06-01T00:00:00.000Z',
      },
    },
  },
  description: '認証されたユーザーが有効なデータでプロファイルを更新する場合',
};

// プロファイル取得失敗契約（認証なし）
export const getProfileUnauthorizedContract: APIContract = {
  endpoint: '/api/profile',
  method: 'GET',
  request: {
    headers: {},
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
  description: '未認証のユーザーがプロファイルを取得しようとする場合',
};

// 他ユーザーのプロファイル取得契約
export const getUserProfileContract: APIContract = {
  endpoint: '/api/profile/user-456',
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
        id: 'user-456',
        name: 'Other User',
        email: 'other@example.com',
        createdAt: '2024-02-01T00:00:00.000Z',
      },
    },
  },
  description: '認証されたユーザーが他のユーザーのプロファイルを取得する場合',
};

export const profileContracts = [
  getProfileContract,
  updateProfileSuccessContract,
  getProfileUnauthorizedContract,
  getUserProfileContract,
];
