import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'
import type { Profile } from '@/types/profile'

// グローバルのfetchをモック化
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('api', () => {
  const mockToken = 'test-token'
  const mockUserId = 'user-1'

  beforeEach(() => {
    mockFetch.mockClear()
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('auth', () => {
    it('ログインリクエストを送信', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ user: { id: 'user-123' } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.auth.login({ email: 'test@example.com', password: 'password' });

      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      });
      expect(result).toEqual({ user: { id: 'user-123' } });
    });

    it('ログイン失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.auth.login({ email: 'test@example.com', password: 'wrong-password' });

      expect(result).toEqual({ error: 'Invalid credentials' });
    });

    it('サインアップリクエストを送信', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ user: { id: 'user-123' } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.auth.signup({ email: 'test@example.com', password: 'password', name: 'Test User' });

      expect(fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password', name: 'Test User' }),
      });
      expect(result).toEqual({ user: { id: 'user-123' } });
    });

    it('サインアップ失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Email already exists' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.auth.signup({ email: 'existing@example.com', password: 'password', name: 'Test User' });

      expect(result).toEqual({ error: 'Email already exists' });
    });

    it('サインアップ時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.auth.signup({ email: 'test@example.com', password: 'password', name: 'Test User' });

      expect(result).toEqual({ error: 'サインアップに失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Signup error:', expect.any(Error));
    });
  })

  describe('profile', () => {
    const mockProfile: Profile = {
      userId: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('プロフィール情報を取得', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ name: 'Test User' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.profile.get('token-123', 'user-123');

      expect(fetch).toHaveBeenCalledWith('/api/profile/user-123', {
        headers: { Authorization: 'Bearer token-123' },
      });
      expect(result).toEqual({ name: 'Test User' });
    });

    it('プロフィール取得失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.profile.get('invalid-token', 'user-123');

      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('プロフィール取得時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.profile.get('token-123', 'user-123');

      expect(result).toEqual({ error: 'プロフィールの取得に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Profile get error:', expect.any(Error));
    });

    it('プロフィール情報を更新', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ name: 'Updated Name', email: 'updated@example.com' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.profile.update('token-123', 'Updated Name', 'updated@example.com');

      expect(fetch).toHaveBeenCalledWith('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify({ name: 'Updated Name', email: 'updated@example.com' }),
      });
      expect(result).toEqual({ name: 'Updated Name', email: 'updated@example.com' });
    });

    it('プロフィール更新失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Validation failed' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.profile.update('token-123', '', 'invalid-email');

      expect(result).toEqual({ error: 'Validation failed' });
    });

    it('プロフィール更新時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.profile.update('token-123', 'Updated Name', 'updated@example.com');

      expect(result).toEqual({ error: 'プロフィールの更新に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Profile update error:', expect.any(Error));
    });
  })

  describe('plans', () => {
    const mockPlan: Plan = {
      id: 'plan-1',
      title: 'Test Plan',
      description: 'Test Description',
      date: new Date('2024-01-01'),
      location: 'Test Location',
      budget: 1000,
      isPublic: false,
      userId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: [],
    }

    it('プラン一覧を取得', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [{ id: 'plan-123', title: 'Test Plan' }] }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.list('token-123');

      expect(fetch).toHaveBeenCalledWith('/api/plans', {
        headers: { Authorization: 'Bearer token-123' },
      });
      expect(result).toEqual({ data: [{ id: 'plan-123', title: 'Test Plan' }] });
    });

    it('プラン一覧取得失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.list('invalid-token');

      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('プラン一覧取得時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.plans.list('token-123');

      expect(result).toEqual({ error: 'プラン一覧の取得に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plans list error:', expect.any(Error));
    });

    it('プランを作成', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 'plan-123', title: 'New Plan' } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const planData = { 
        title: 'New Plan', 
        description: '',
        date: new Date(), 
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.create('token-123', planData);

      expect(fetch).toHaveBeenCalledWith('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify(planData),
      });
      expect(result).toEqual({ data: { id: 'plan-123', title: 'New Plan' } });
    });

    it('プラン作成時のエラーハンドリング', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const planData = { 
        title: 'New Plan', 
        description: '',
        date: new Date(), 
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.create('token-123', planData);

      expect(result).toEqual({ error: 'プランの作成に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan create error:', expect.any(Error));
    });

    it('プラン作成時のレスポンスエラーを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'プランの作成に失敗しました' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const planData = { 
        title: '', 
        description: '',
        date: new Date(), 
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.create('token-123', planData);

      expect(result).toEqual({ error: 'プランの作成に失敗しました' });
    });

    it('特定のプランを取得', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 'plan-123', title: 'Test Plan' } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.get('token-123', 'plan-123');

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123', {
        headers: { Authorization: 'Bearer token-123' },
      });
      expect(result).toEqual({ data: { id: 'plan-123', title: 'Test Plan' } });
    });

    it('プラン取得失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Plan not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.get('token-123', 'nonexistent-plan');

      expect(result).toEqual({ error: 'Plan not found' });
    });

    it('プラン取得時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.plans.get('token-123', 'plan-123');

      expect(result).toEqual({ error: 'プランの取得に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan get error:', expect.any(Error));
    });

    it('プランを更新', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 'plan-123', title: 'Updated Plan' } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const planData = { 
        title: 'Updated Plan', 
        description: '',
        budget: 6000,
        isPublic: false
      };
      const result = await api.plans.update('token-123', 'plan-123', planData);

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify(planData),
      });
      expect(result).toEqual({ data: { id: 'plan-123', title: 'Updated Plan' } });
    });

    it('プラン更新失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Validation failed' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const planData = { 
        title: '', 
        description: '',
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.update('token-123', 'plan-123', planData);

      expect(result).toEqual({ error: 'Validation failed' });
    });

    it('プラン更新時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const planData = { 
        title: 'Updated Plan', 
        description: '',
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.update('token-123', 'plan-123', planData);

      expect(result).toEqual({ error: 'プランの更新に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan update error:', expect.any(Error));
    });

    it('プランを削除', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.delete('token-123', 'plan-123');

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer token-123' },
      });
      expect(result).toEqual({ success: true });
    });

    it('プラン削除失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Plan not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.delete('token-123', 'nonexistent-plan');

      expect(result).toEqual({ error: 'Plan not found' });
    });

    it('プラン削除時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.plans.delete('token-123', 'plan-123');

      expect(result).toEqual({ error: 'プランの削除に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan delete error:', expect.any(Error));
    });

    it('公開プラン一覧を取得', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [{ id: 'plan-123', title: 'Public Plan' }] }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.listPublic('token-123');

      expect(fetch).toHaveBeenCalledWith('/api/plans/public', {
        headers: { Authorization: 'Bearer token-123' },
      });
      expect(result).toEqual({ data: [{ id: 'plan-123', title: 'Public Plan' }] });
    });

    it('公開プラン一覧取得失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.listPublic('invalid-token');

      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('公開プラン一覧取得時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.plans.listPublic('token-123');

      expect(result).toEqual({ error: '公開プラン一覧の取得に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Public plans list error:', expect.any(Error));
    });

    it('プランの公開設定を更新', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 'plan-123', isPublic: true } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.publish('token-123', 'plan-123', true);

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify({ isPublic: true }),
      });
      expect(result).toEqual({ data: { id: 'plan-123', isPublic: true } });
    });

    it('プラン公開設定更新失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Plan not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.publish('token-123', 'nonexistent-plan', true);

      expect(result).toEqual({ error: 'Plan not found' });
    });

    it('プラン公開設定更新時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.plans.publish('token-123', 'plan-123', true);

      expect(result).toEqual({ error: 'プランの公開設定の更新に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan publish error:', expect.any(Error));
    });
  })

  describe('likes', () => {
    it('いいねを作成', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.likes.create('token-123', 'plan-123');

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123/likes', {
        method: 'POST',
        headers: { Authorization: 'Bearer token-123' },
      });
      expect(result).toEqual({ success: true });
    });

    it('いいね作成失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Already liked' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.likes.create('token-123', 'plan-123');

      expect(result).toEqual({ error: 'Already liked' });
    });

    it('いいね作成時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.likes.create('token-123', 'plan-123');

      expect(result).toEqual({ error: 'いいねの追加に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Like create error:', expect.any(Error));
    });

    it('いいねを削除', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.likes.delete('token-123', 'plan-123');

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123/likes', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer token-123' },
      });
      expect(result).toEqual({ success: true });
    });

    it('いいね削除失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Like not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.likes.delete('token-123', 'plan-123');

      expect(result).toEqual({ error: 'Like not found' });
    });

    it('いいね削除時のネットワークエラーを処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.likes.delete('token-123', 'plan-123');

      expect(result).toEqual({ error: 'いいねの削除に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Like delete error:', expect.any(Error));
    });
  })
})
