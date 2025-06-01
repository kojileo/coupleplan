/**
 * E2Eテスト用のテストデータフィクスチャ
 */

// テスト用パスワードを環境変数または動的生成で取得
const getTestPassword = () => process.env.E2E_TEST_PASSWORD || `Test${Date.now()}!`;

export const TEST_USERS = {
  user1: {
    email: 'user1@e2etest.com',
    password: getTestPassword(),
    name: 'テストユーザー1',
  },
  user2: {
    email: 'user2@e2etest.com',
    password: getTestPassword(),
    name: 'テストユーザー2',
  },
  admin: {
    email: 'admin@e2etest.com',
    password: getTestPassword(),
    name: '管理者',
  },
} as const;

export const TEST_PLANS = {
  validPlan: {
    title: '東京デートプラン',
    description: '東京の美味しいレストランと映画館を巡るデートプラン',
    date: '2024-12-25',
    budget: '15000',
    locations: [
      'https://tabelog.com/tokyo/A1301/A130101/13123456/',
      'https://www.tohotheater.jp/theater/014/cinema014/',
    ],
    region: 'tokyo',
  },
  invalidPlan: {
    title: '',
    description: '',
    date: '',
    budget: '-1000',
    locations: ['invalid-url'],
    region: '',
  },
  longPlan: {
    title: 'とても長いタイトル'.repeat(10),
    description: 'とても長い説明文'.repeat(50),
    date: '2024-12-31',
    budget: '999999',
    locations: Array(10).fill('https://example.com'),
    region: 'osaka',
  },
} as const;

export const TEST_REGIONS = [
  'hokkaido',
  'tohoku',
  'kanto',
  'chubu',
  'kansai',
  'chugoku',
  'shikoku',
  'kyushu',
] as const;

export const TEST_CONVERSATION_TOPICS = [
  {
    id: 1,
    title: '趣味について',
    description: 'お互いの趣味や好きなことについて話しましょう',
    category: 'hobby',
  },
  {
    id: 2,
    title: '将来の夢',
    description: '将来やってみたいことや夢について語りましょう',
    category: 'future',
  },
  {
    id: 3,
    title: '好きな食べ物',
    description: '好きな料理や食べ物について話しましょう',
    category: 'food',
  },
] as const;

export const TEST_ERRORS = {
  network: {
    message: 'ネットワークエラーが発生しました',
    code: 'NETWORK_ERROR',
  },
  validation: {
    message: '入力内容に誤りがあります',
    code: 'VALIDATION_ERROR',
  },
  unauthorized: {
    message: 'ログインが必要です',
    code: 'UNAUTHORIZED',
  },
  notFound: {
    message: 'ページが見つかりません',
    code: 'NOT_FOUND',
  },
} as const;

/**
 * ランダムなテストデータ生成関数
 */
export function generateRandomPlan() {
  const randomId = Math.floor(Math.random() * 1000);
  return {
    title: `ランダムプラン ${randomId}`,
    description: `テスト用のランダムプラン ${randomId} です`,
    date: '2024-12-31',
    budget: String(Math.floor(Math.random() * 50000) + 5000),
    locations: [`https://example.com/location/${randomId}`],
    region: TEST_REGIONS[Math.floor(Math.random() * TEST_REGIONS.length)],
  };
}

export function generateRandomUser() {
  const randomId = Math.floor(Math.random() * 1000);
  return {
    email: `testuser${randomId}@e2etest.com`,
    password: getTestPassword(),
    name: `テストユーザー${randomId}`,
  };
}

/**
 * 日付関連のテストデータ
 */
export const TEST_DATES = {
  past: '2020-01-01',
  today: new Date().toISOString().split('T')[0],
  future: '2025-12-31',
  invalid: 'invalid-date',
} as const;

/**
 * URL関連のテストデータ
 */
export const TEST_URLS = {
  valid: [
    'https://tabelog.com/tokyo/A1301/',
    'https://www.jalan.net/kankou/',
    'https://www.booking.com/hotel/',
  ],
  invalid: ['not-a-url', 'http://', 'ftp://example.com', ''],
} as const;
