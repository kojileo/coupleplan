import { setupMSW, server, createMockHandler } from '../setup';
import { authContracts } from '../contracts/auth.contracts';

// MSWセットアップ
setupMSW();

describe('認証API CDC テスト (MSW)', () => {
  describe('ログインAPI契約テスト', () => {
    test('有効な認証情報でログイン成功', async () => {
      const contract = authContracts[0]; // loginSuccessContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract.request!.body),
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.data.user).toHaveProperty('id');
      expect(data.data.user).toHaveProperty('email');
      expect(data.data.session).toHaveProperty('access_token');
    });

    test('無効な認証情報でログイン失敗', async () => {
      const contract = authContracts[1]; // loginFailureContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract.request!.body),
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.error).toBe('ログインに失敗しました');
    });

    test('無効なリクエスト形式でログイン失敗', async () => {
      const contract = authContracts[2]; // loginInvalidRequestContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract.request!.body),
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.error).toBe('無効なリクエストデータです');
    });
  });

  describe('サインアップAPI契約テスト', () => {
    test('有効な情報でサインアップ成功', async () => {
      const contract = authContracts[3]; // signupSuccessContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract.request!.body),
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.data.user).toHaveProperty('id');
      expect(data.data.user).toHaveProperty('email');
    });
  });

  describe('パスワードリセットAPI契約テスト', () => {
    test('パスワードリセット要求成功', async () => {
      const contract = authContracts[4]; // resetPasswordContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract.request!.body),
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.data.message).toBe('パスワードリセットメールを送信しました');
    });
  });

  describe('API契約の一貫性テスト', () => {
    test('すべての認証API契約が有効な形式である', () => {
      authContracts.forEach((contract) => {
        expect(contract).toHaveProperty('endpoint');
        expect(contract).toHaveProperty('method');
        expect(contract).toHaveProperty('response');
        expect(contract).toHaveProperty('description');
        expect(contract.response).toHaveProperty('status');
        expect(typeof contract.response.status).toBe('number');
      });
    });

    test('エラーレスポンスが標準形式に従う', () => {
      const errorContracts = authContracts.filter((contract) => contract.response.status >= 400);

      errorContracts.forEach((contract) => {
        expect(contract.response.body).toHaveProperty('error');
        expect(typeof contract.response.body.error).toBe('string');
      });
    });

    test('成功レスポンスが標準形式に従う', () => {
      const successContracts = authContracts.filter((contract) => contract.response.status < 400);

      successContracts.forEach((contract) => {
        expect(contract.response.body).toHaveProperty('data');
      });
    });
  });
});
