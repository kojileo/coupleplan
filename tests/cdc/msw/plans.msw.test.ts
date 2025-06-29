import { setupMSW, server, createMockHandler } from '../setup';
import { plansContracts } from '../contracts/plans.contracts';

// MSWセットアップ
setupMSW();

describe('プランAPI CDC テスト (MSW)', () => {
  describe('プラン一覧取得API契約テスト', () => {
    test('認証されたユーザーがプラン一覧を取得', async () => {
      const contract = plansContracts[0]; // getPlansContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/plans', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data[0]).toHaveProperty('id');
      expect(data.data[0]).toHaveProperty('title');
      expect(data.data[0]).toHaveProperty('description');
      expect(data.data[0]).toHaveProperty('profile');
      expect(data.data[0]).toHaveProperty('_count');
    });
  });

  describe('プラン作成API契約テスト', () => {
    test('認証されたユーザーが有効なデータでプラン作成成功', async () => {
      const contract = plansContracts[1]; // createPlanSuccessContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/plans', {
        method: 'POST',
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
      expect(data.data).toHaveProperty('title');
      expect(data.data).toHaveProperty('locations');
      expect(Array.isArray(data.data.locations)).toBe(true);
    });

    test('未認証ユーザーがプラン作成を試行して失敗', async () => {
      const contract = plansContracts[2]; // createPlanUnauthorizedContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract.request!.body),
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.error).toBe('認証が必要です');
    });

    test('無効なデータでプラン作成を試行して失敗', async () => {
      const contract = plansContracts[3]; // createPlanInvalidDataContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/plans', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer mock-access-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract.request!.body),
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.error).toBe('プランの作成に失敗しました');
    });
  });

  describe('特定プラン取得API契約テスト', () => {
    test('認証されたユーザーが特定プランを取得', async () => {
      const contract = plansContracts[4]; // getPlanByIdContract
      const handler = createMockHandler(contract);
      server.use(handler);

      const response = await fetch('http://localhost:3000/api/plans/plan-123', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.status).toBe(contract.response.status);

      const data = await response.json();
      expect(data).toEqual(contract.response.body);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('locations');
      expect(Array.isArray(data.data.locations)).toBe(true);
    });
  });

  describe('プランAPI契約の一貫性テスト', () => {
    test('すべてのプランAPI契約が有効な形式である', () => {
      plansContracts.forEach((contract) => {
        expect(contract).toHaveProperty('endpoint');
        expect(contract).toHaveProperty('method');
        expect(contract).toHaveProperty('response');
        expect(contract).toHaveProperty('description');
        expect(contract.response).toHaveProperty('status');
        expect(typeof contract.response.status).toBe('number');
      });
    });

    test('プランデータの構造が一貫している', () => {
      const successContracts = plansContracts.filter(
        (contract) => contract.response.status < 400 && contract.response.body?.data
      );

      successContracts.forEach((contract) => {
        const planData = Array.isArray(contract.response.body.data)
          ? contract.response.body.data[0]
          : contract.response.body.data;

        if (planData) {
          expect(planData).toHaveProperty('id');
          expect(planData).toHaveProperty('title');
          expect(planData).toHaveProperty('description');
          expect(planData).toHaveProperty('userId');
          expect(typeof planData.budget).toBe('number');
          expect(typeof planData.isPublic).toBe('boolean');
        }
      });
    });

    test('認証が必要なエンドポイントで適切なエラーが返される', () => {
      const unauthorizedContracts = plansContracts.filter(
        (contract) => contract.response.status === 401
      );

      unauthorizedContracts.forEach((contract) => {
        expect(contract.response.body.error).toBe('認証が必要です');
      });
    });
  });
});
