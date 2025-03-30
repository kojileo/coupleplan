import { api } from '@/lib/api';
import { ApiResponse, LoginRequest, SignUpRequest, PlanRequest } from '@/types/api';
import type { Plan } from '@/types/plan';
import type { Profile } from '@/types/profile';

// グローバルなfetchをモック化
global.fetch = jest.fn();

describe('api', () => {
  const mockToken = 'test-token';
  const mockUserId = 'user-123';
  const mockPlanId = 'plan-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auth', () => {
    describe('login', () => {
      it('正常にログインできる', async () => {
        const mockResponse = { data: { token: 'new-token' } };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const loginData: LoginRequest = {
          email: 'test@example.com',
          password: 'password123',
        };

        const result = await api.auth.login(loginData);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'ログインに失敗しました' }),
        });

        const loginData: LoginRequest = {
          email: 'test@example.com',
          password: 'password123',
        };

        const result = await api.auth.login(loginData);
        expect(result).toEqual({ error: 'ログインに失敗しました' });
      });
    });

    describe('signup', () => {
      it('正常にサインアップできる', async () => {
        const mockResponse = { data: { token: 'new-token' } };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const signupData: SignUpRequest = {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        };

        const result = await api.auth.signup(signupData);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signupData),
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const signupData: SignUpRequest = {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        };

        const result = await api.auth.signup(signupData);
        expect(result).toEqual({ error: 'サインアップに失敗しました' });
      });
    });
  });

  describe('profile', () => {
    describe('get', () => {
      it('正常にプロフィールを取得できる', async () => {
        const mockProfile: Profile = {
          id: mockUserId,
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date('2024-03-20T00:00:00.000Z'),
          updatedAt: new Date('2024-03-20T00:00:00.000Z'),
        };
        const mockResponse = { data: mockProfile };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.profile.get(mockToken, mockUserId);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(`/api/profile/${mockUserId}`, {
          headers: { Authorization: `Bearer ${mockToken}` },
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.profile.get(mockToken, mockUserId);
        expect(result).toEqual({ error: 'プロフィールの取得に失敗しました' });
      });
    });

    describe('update', () => {
      it('正常にプロフィールを更新できる', async () => {
        const mockProfile: Profile = {
          id: mockUserId,
          name: 'Updated Name',
          email: 'updated@example.com',
          createdAt: new Date('2024-03-20T00:00:00.000Z'),
          updatedAt: new Date('2024-03-20T00:00:00.000Z'),
        };
        const mockResponse = { data: mockProfile };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.profile.update(mockToken, 'Updated Name', 'updated@example.com');
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ name: 'Updated Name', email: 'updated@example.com' }),
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.profile.update(mockToken, 'Updated Name', 'updated@example.com');
        expect(result).toEqual({ error: 'プロフィールの更新に失敗しました' });
      });
    });
  });

  describe('plans', () => {
    describe('list', () => {
      it('正常にプラン一覧を取得できる', async () => {
        const mockPlans: Plan[] = [
          {
            id: 'plan-1',
            title: 'Test Plan 1',
            description: 'Description 1',
            date: new Date('2024-03-20'),
            location: 'Tokyo',
            region: '関東',
            budget: 5000,
            isPublic: false,
            userId: mockUserId,
            createdAt: new Date('2024-03-20T00:00:00.000Z'),
            updatedAt: new Date('2024-03-20T00:00:00.000Z'),
            profile: { name: 'Test User' },
            likes: [],
            _count: { likes: 0 },
          },
        ];
        const mockResponse = { data: mockPlans };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.plans.list(mockToken);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith('/api/plans', {
          headers: { Authorization: `Bearer ${mockToken}` },
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.plans.list(mockToken);
        expect(result).toEqual({ error: 'プラン一覧の取得に失敗しました' });
      });
    });

    describe('create', () => {
      it('正常にプランを作成できる', async () => {
        const planData: PlanRequest = {
          title: 'New Plan',
          description: 'New Description',
          date: new Date('2024-03-20'),
          location: 'Tokyo',
          region: '関東',
          budget: 5000,
          isPublic: false,
        };
        const mockPlan: Plan = {
          ...planData,
          id: mockPlanId,
          userId: mockUserId,
          createdAt: new Date('2024-03-20T00:00:00.000Z'),
          updatedAt: new Date('2024-03-20T00:00:00.000Z'),
          profile: { name: 'Test User' },
          likes: [],
          _count: { likes: 0 },
        };
        const mockResponse = { data: mockPlan };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.plans.create(mockToken, planData);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith('/api/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(planData),
        });
      });

      it('レスポンスがokでない場合エラーレスポンスを返す', async () => {
        const planData: PlanRequest = {
          title: 'New Plan',
          description: 'New Description',
          date: new Date('2024-03-20'),
          location: 'Tokyo',
          region: '関東',
          budget: 5000,
          isPublic: false,
        };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid data' }),
        });

        const result = await api.plans.create(mockToken, planData);
        expect(result).toEqual({ error: 'プランの作成に失敗しました' });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        const planData: PlanRequest = {
          title: 'New Plan',
          description: 'New Description',
          date: new Date('2024-03-20'),
          location: 'Tokyo',
          region: '関東',
          budget: 5000,
          isPublic: false,
        };
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.plans.create(mockToken, planData);
        expect(result).toEqual({ error: 'プランの作成に失敗しました' });
      });
    });

    describe('get', () => {
      it('正常にプランを取得できる', async () => {
        const mockPlan: Plan = {
          id: mockPlanId,
          title: 'Test Plan',
          description: 'Test Description',
          date: new Date('2024-03-20'),
          location: 'Tokyo',
          region: '関東',
          budget: 5000,
          isPublic: false,
          userId: mockUserId,
          createdAt: new Date('2024-03-20T00:00:00.000Z'),
          updatedAt: new Date('2024-03-20T00:00:00.000Z'),
          profile: { name: 'Test User' },
          likes: [],
          _count: { likes: 0 },
        };
        const mockResponse = { data: mockPlan };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.plans.get(mockToken, mockPlanId);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(`/api/plans/${mockPlanId}`, {
          headers: { Authorization: `Bearer ${mockToken}` },
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.plans.get(mockToken, mockPlanId);
        expect(result).toEqual({ error: 'プランの取得に失敗しました' });
      });
    });

    describe('update', () => {
      it('正常にプランを更新できる', async () => {
        const planData: PlanRequest = {
          title: 'Updated Plan',
          description: 'Updated Description',
          date: new Date('2024-03-20'),
          location: 'Tokyo',
          region: '関東',
          budget: 5000,
          isPublic: false,
        };
        const mockPlan: Plan = {
          ...planData,
          id: mockPlanId,
          userId: mockUserId,
          createdAt: new Date('2024-03-20T00:00:00.000Z'),
          updatedAt: new Date('2024-03-20T00:00:00.000Z'),
          profile: { name: 'Test User' },
          likes: [],
          _count: { likes: 0 },
        };
        const mockResponse = { data: mockPlan };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.plans.update(mockToken, mockPlanId, planData);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(`/api/plans/${mockPlanId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(planData),
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        const planData: PlanRequest = {
          title: 'Updated Plan',
          description: 'Updated Description',
          date: new Date('2024-03-20'),
          location: 'Tokyo',
          region: '関東',
          budget: 5000,
          isPublic: false,
        };
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.plans.update(mockToken, mockPlanId, planData);
        expect(result).toEqual({ error: 'プランの更新に失敗しました' });
      });
    });

    describe('delete', () => {
      it('正常にプランを削除できる', async () => {
        const mockResponse = { data: null };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.plans.delete(mockToken, mockPlanId);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(`/api/plans/${mockPlanId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${mockToken}` },
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.plans.delete(mockToken, mockPlanId);
        expect(result).toEqual({ error: 'プランの削除に失敗しました' });
      });
    });

    describe('listPublic', () => {
      it('正常に公開プラン一覧を取得できる', async () => {
        const mockPlans: Plan[] = [
          {
            id: 'plan-1',
            title: 'Public Plan 1',
            description: 'Description 1',
            date: new Date('2024-03-20'),
            location: 'Tokyo',
            region: '関東',
            budget: 5000,
            isPublic: true,
            userId: mockUserId,
            createdAt: new Date('2024-03-20T00:00:00.000Z'),
            updatedAt: new Date('2024-03-20T00:00:00.000Z'),
            profile: { name: 'Test User' },
            likes: [],
            _count: { likes: 0 },
          },
        ];
        const mockResponse = { data: mockPlans };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.plans.listPublic(mockToken);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith('/api/plans/public', {
          headers: { Authorization: `Bearer ${mockToken}` },
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.plans.listPublic(mockToken);
        expect(result).toEqual({ error: '公開プラン一覧の取得に失敗しました' });
      });
    });

    describe('publish', () => {
      it('正常にプランの公開設定を更新できる', async () => {
        const mockPlan: Plan = {
          id: mockPlanId,
          title: 'Test Plan',
          description: 'Test Description',
          date: new Date('2024-03-20'),
          location: 'Tokyo',
          region: '関東',
          budget: 5000,
          isPublic: true,
          userId: mockUserId,
          createdAt: new Date('2024-03-20T00:00:00.000Z'),
          updatedAt: new Date('2024-03-20T00:00:00.000Z'),
          profile: { name: 'Test User' },
          likes: [],
          _count: { likes: 0 },
        };
        const mockResponse = { data: mockPlan };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.plans.publish(mockToken, mockPlanId, true);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(`/api/plans/${mockPlanId}/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ isPublic: true }),
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.plans.publish(mockToken, mockPlanId, true);
        expect(result).toEqual({ error: 'プランの公開設定の更新に失敗しました' });
      });
    });
  });

  describe('likes', () => {
    describe('create', () => {
      it('正常にいいねを追加できる', async () => {
        const mockResponse = { data: null };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.likes.create(mockToken, mockPlanId);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(`/api/plans/${mockPlanId}/likes`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${mockToken}` },
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.likes.create(mockToken, mockPlanId);
        expect(result).toEqual({ error: 'いいねの追加に失敗しました' });
      });
    });

    describe('delete', () => {
      it('正常にいいねを削除できる', async () => {
        const mockResponse = { data: null };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.likes.delete(mockToken, mockPlanId);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(`/api/plans/${mockPlanId}/likes`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${mockToken}` },
        });
      });

      it('エラー時にエラーレスポンスを返す', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await api.likes.delete(mockToken, mockPlanId);
        expect(result).toEqual({ error: 'いいねの削除に失敗しました' });
      });
    });
  });
}); 