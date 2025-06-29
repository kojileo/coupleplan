import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// MSWサーバーのセットアップ
export const server = setupServer();

// MSWサーバーのライフサイクル設定
export const setupMSW = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};

// API契約の型定義
export interface APIContract {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  request?: {
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  };
  response: {
    status: number;
    headers?: Record<string, string>;
    body?: any;
  };
  description: string;
}

// 契約情報の検証ヘルパー関数
export const validateContract = (contract: APIContract): boolean => {
  return !!(
    contract.endpoint &&
    contract.method &&
    contract.response &&
    contract.description &&
    typeof contract.response.status === 'number'
  );
};

// 共通のMockハンドラー作成関数
export const createMockHandler = (contract: APIContract) => {
  const fullUrl = `http://localhost:3000${contract.endpoint}`;

  switch (contract.method) {
    case 'GET':
      return http.get(fullUrl, () => {
        return HttpResponse.json(contract.response.body, {
          status: contract.response.status,
          headers: contract.response.headers,
        });
      });
    case 'POST':
      return http.post(fullUrl, async ({ request }) => {
        // リクエストボディの検証（オプション）
        if (contract.request?.body) {
          try {
            const requestBody = (await request.json()) as Record<string, any>;
            if (requestBody && typeof requestBody === 'object') {
              // 契約で定義されたフィールドが存在するかチェック
              const contractFields = Object.keys(contract.request.body);
              for (const field of contractFields) {
                if (field in contract.request.body && !(field in requestBody)) {
                  return HttpResponse.json(
                    { error: '無効なリクエストデータです' },
                    { status: 400 }
                  );
                }
              }
            }
          } catch (error) {
            return HttpResponse.json({ error: '無効なJSONデータです' }, { status: 400 });
          }
        }

        return HttpResponse.json(contract.response.body, {
          status: contract.response.status,
          headers: contract.response.headers,
        });
      });
    case 'PUT':
      return http.put(fullUrl, async ({ request }) => {
        if (contract.request?.body) {
          await request.json(); // ボディを消費
        }
        return HttpResponse.json(contract.response.body, {
          status: contract.response.status,
          headers: contract.response.headers,
        });
      });
    case 'DELETE':
      return http.delete(fullUrl, () => {
        return HttpResponse.json(contract.response.body, {
          status: contract.response.status,
          headers: contract.response.headers,
        });
      });
    case 'PATCH':
      return http.patch(fullUrl, async ({ request }) => {
        if (contract.request?.body) {
          await request.json(); // ボディを消費
        }
        return HttpResponse.json(contract.response.body, {
          status: contract.response.status,
          headers: contract.response.headers,
        });
      });
    default:
      throw new Error(`Unsupported HTTP method: ${contract.method}`);
  }
};
