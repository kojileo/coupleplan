import type { APIContract } from '../setup';

// ログイン成功契約
export const loginSuccessContract: APIContract = {
  endpoint: '/api/auth/login',
  method: 'POST',
  request: {
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'test@example.com',
      password: 'password123',
    },
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        session: {
          access_token: 'mock-access-token',
          token_type: 'bearer',
        },
      },
    },
  },
  description: 'ユーザーが有効な認証情報でログインを試行する場合',
};

// ログイン失敗契約（無効な認証情報）
export const loginFailureContract: APIContract = {
  endpoint: '/api/auth/login',
  method: 'POST',
  request: {
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'invalid@example.com',
      password: 'wrongpassword',
    },
  },
  response: {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      error: 'ログインに失敗しました',
    },
  },
  description: 'ユーザーが無効な認証情報でログインを試行する場合',
};

// ログイン失敗契約（無効なリクエスト形式）
export const loginInvalidRequestContract: APIContract = {
  endpoint: '/api/auth/login',
  method: 'POST',
  request: {
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'test@example.com',
      // passwordが欠けている
    },
  },
  response: {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      error: '無効なリクエストデータです',
    },
  },
  description: 'ユーザーが不完全なリクエストでログインを試行する場合',
};

// サインアップ成功契約
export const signupSuccessContract: APIContract = {
  endpoint: '/api/auth/signup',
  method: 'POST',
  request: {
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'Test User',
    },
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      data: {
        user: {
          id: 'user-456',
          email: 'newuser@example.com',
        },
      },
    },
  },
  description: 'ユーザーが有効な情報でサインアップを試行する場合',
};

// パスワードリセット契約
export const resetPasswordContract: APIContract = {
  endpoint: '/api/auth/reset-password',
  method: 'POST',
  request: {
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'test@example.com',
    },
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      data: {
        message: 'パスワードリセットメールを送信しました',
      },
    },
  },
  description: 'ユーザーがパスワードリセットを要求する場合',
};

export const authContracts = [
  loginSuccessContract,
  loginFailureContract,
  loginInvalidRequestContract,
  signupSuccessContract,
  resetPasswordContract,
];
