import { setupMSW, server, createMockHandler } from '../setup';
import { profileContracts } from '../contracts/profile.contracts';

// MSWセットアップ
setupMSW();

describe('プロファイルAPI CDC テスト (MSW)', () => {
  describe('プロファイル取得API契約テスト', () => {
    test('認証されたユーザーが自分のプロファイルを取得', async () => {
      const contract = profileContracts[0]; // getProfileContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('email');
      expect(data.data).toHaveProperty('createdAt');
      expect(data.data).toHaveProperty('updatedAt');
    });

    test('未認証ユーザーがプロファイル取得を試行して失敗', async () => {
      const contract = profileContracts[2]; // getProfileUnauthorizedContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'GET',
        headers: {},
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.error).toBe('認証が必要です');
    });
  });

  describe('プロファイル更新API契約テスト', () => {
    test('認証されたユーザーが有効なデータでプロファイル更新成功', async () => {
      const contract = profileContracts[1]; // updateProfileSuccessContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer mock-access-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract.request!.body),
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('email');
      expect(data.data.name).toBe('更新されたユーザー名');
      expect(data.data.email).toBe('updated@example.com');
    });
  });

  describe('他ユーザープロファイル取得API契約テスト', () => {
    test('認証されたユーザーが他ユーザーのプロファイルを取得', async () => {
      const contract = profileContracts[3]; // getUserProfileContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/profile/user-456', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('email');
      expect(data.data.id).toBe('user-456');
    });
  });

  describe('プロファイルAPI契約の一貫性テスト', () => {
    test('すべてのプロファイルAPI契約が有効な形式である', () => {
      profileContracts.forEach((contract) => {
        expect(contract).toHaveProperty('endpoint');
        expect(contract).toHaveProperty('method');
        expect(contract).toHaveProperty('response');
        expect(contract).toHaveProperty('description');
        expect(contract.response).toHaveProperty('status');
        expect(typeof contract.response.status).toBe('number');
      });
    });

    test('プロファイルデータの構造が一貫している', () => {
      const successContracts = profileContracts.filter(
        (contract) => contract.response.status < 400 && contract.response.body?.data
      );

      successContracts.forEach((contract) => {
        const profileData = contract.response.body.data;

        expect(profileData).toHaveProperty('id');
        expect(profileData).toHaveProperty('name');
        expect(profileData).toHaveProperty('email');
        expect(typeof profileData.id).toBe('string');
        expect(typeof profileData.name).toBe('string');
        expect(typeof profileData.email).toBe('string');
      });
    });

    test('認証が必要なエンドポイントで適切なエラーが返される', () => {
      const unauthorizedContracts = profileContracts.filter(
        (contract) => contract.response.status === 401
      );

      unauthorizedContracts.forEach((contract) => {
        expect(contract.response.body.error).toBe('認証が必要です');
      });
    });

    test('成功レスポンスが標準形式に従う', () => {
      const successContracts = profileContracts.filter(
        (contract) => contract.response.status < 400
      );

      successContracts.forEach((contract) => {
        expect(contract.response.body).toHaveProperty('data');
        if (contract.response.headers) {
          expect(contract.response.headers).toHaveProperty('Content-Type');
          expect(contract.response.headers['Content-Type']).toBe('application/json');
        }
      });
    });

    test('更新系APIで適切なHTTPメソッドが使用されている', () => {
      const updateContract = profileContracts.find((contract) =>
        contract.description.includes('更新')
      );

      expect(updateContract).toBeDefined();
      expect(updateContract!.method).toBe('PUT');
      expect(updateContract!.request).toHaveProperty('body');
    });
  });
});
