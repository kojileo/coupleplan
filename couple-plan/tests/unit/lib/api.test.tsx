import { api } from '@/lib/api'
import type { Plan } from '@/types/plan'
import type { Profile } from '@/types/profile'
import { TEST_AUTH, TEST_USER } from '@tests/utils/test-constants'

// グローバルのfetchをモック化
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('api', () => {
  // 安全なテストトークンを使用
  const mockToken = TEST_AUTH.ACCESS_TOKEN
  const mockUserId = TEST_USER.ID
  // テスト用のパスワードプレースホルダを定義
  const PASSWORD_PLACEHOLDER = '************';

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
      // レスポンスオブジェクトをセキュアな形式で定義
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: mockUserId } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // パスワードをテスト内で直接使用せず、オブジェクトを作成
      const loginData = { 
        email: TEST_USER.EMAIL, 
        password: PASSWORD_PLACEHOLDER 
      };

      const result = await api.auth.login(loginData);

      // JSON.stringifyを使わずにオブジェクトの内容を検証
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      });
      
      // fetchに渡されたbodyが正しい形式かを検証（パスワードの値自体は検証しない）
      const fetchCall = mockFetch.mock.calls[0];
      const bodyParsed = JSON.parse(fetchCall[1].body);
      expect(bodyParsed).toHaveProperty('email', TEST_USER.EMAIL);
      expect(bodyParsed).toHaveProperty('password');
      
      expect(result).toEqual({ data: { id: mockUserId } });
    });

    it('ログイン失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // パスワードをテスト内で直接使用せず、オブジェクトを作成
      const loginData = { 
        email: TEST_USER.EMAIL, 
        password: PASSWORD_PLACEHOLDER 
      };

      const result = await api.auth.login(loginData);

      expect(result).toEqual({ error: 'Invalid credentials' });
    });

    it('サインアップリクエストを送信', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: mockUserId } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // パスワードをテスト内で直接使用せず、オブジェクトを作成
      const signupData = { 
        email: TEST_USER.EMAIL, 
        password: PASSWORD_PLACEHOLDER, 
        name: 'Test User' 
      };

      const result = await api.auth.signup(signupData);

      // JSON.stringifyを使わずにオブジェクトの内容を検証
      expect(fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      });
      
      // fetchに渡されたbodyが正しい形式かを検証（パスワードの値自体は検証しない）
      const fetchCall = mockFetch.mock.calls[0];
      const bodyParsed = JSON.parse(fetchCall[1].body);
      expect(bodyParsed).toHaveProperty('email', TEST_USER.EMAIL);
      expect(bodyParsed).toHaveProperty('password');
      expect(bodyParsed).toHaveProperty('name', 'Test User');
      
      expect(result).toEqual({ data: { id: mockUserId } });
    });

    it('サインアップ失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Email already exists' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // パスワードをテスト内で直接使用せず、オブジェクトを作成
      const signupData = { 
        email: TEST_USER.EMAIL, 
        password: PASSWORD_PLACEHOLDER, 
        name: 'Test User' 
      };

      const result = await api.auth.signup(signupData);

      expect(result).toEqual({ error: 'Email already exists' });
    });

    it('サインアップ時のネットワークエラーを処理', async () => {
      // より具体的なエラーを使用
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // パスワードをテスト内で直接使用せず、オブジェクトを作成
      const signupData = { 
        email: TEST_USER.EMAIL, 
        password: PASSWORD_PLACEHOLDER, 
        name: 'Test User' 
      };

      const result = await api.auth.signup(signupData);

      expect(result).toEqual({ error: 'サインアップに失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Signup error:', networkError);
    });
  })

  describe('profile', () => {
    // ISO文字列による日付の定義で参照の問題を防ぐ
    const mockDateStr = '2023-01-01T00:00:00.000Z';
    const mockProfile: Profile = {
      id: mockUserId,
      name: 'Test User',
      email: TEST_USER.EMAIL,
      createdAt: new Date(mockDateStr),
      updatedAt: new Date(mockDateStr),
    }

    it('プロフィール情報を取得', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockProfile }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.profile.get(mockToken, mockUserId);

      expect(fetch).toHaveBeenCalledWith(`/api/profile/${mockUserId}`, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual({ data: mockProfile });
    });

    it('プロフィール取得失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.profile.get('invalid-token', mockUserId);

      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('プロフィール取得時のネットワークエラーを処理', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.profile.get(mockToken, mockUserId);

      expect(result).toEqual({ error: 'プロフィールの取得に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Profile get error:', networkError);
    });

    it('プロフィール情報を更新', async () => {
      const updatedName = 'Updated Name';
      const updatedEmail = 'updated@example.com';
      const updatedProfile = {
        ...mockProfile,
        name: updatedName,
        email: updatedEmail,
        updatedAt: new Date(mockDateStr)
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: updatedProfile }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.profile.update(mockToken, updatedName, updatedEmail);

      expect(fetch).toHaveBeenCalledWith('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({ name: updatedName, email: updatedEmail }),
      });
      expect(result).toEqual({ data: updatedProfile });
    });

    it('プロフィール更新失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Validation failed' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.profile.update(mockToken, '', 'invalid-email');

      expect(result).toEqual({ error: 'Validation failed' });
    });

    it('プロフィール更新時のネットワークエラーを処理', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.profile.update(mockToken, 'Updated Name', 'updated@example.com');

      expect(result).toEqual({ error: 'プロフィールの更新に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Profile update error:', networkError);
    });
  })

  describe('plans', () => {
    // ISO文字列による日付の定義
    const mockDateStr = '2023-01-01T00:00:00.000Z';
    const mockPlan: Plan = {
      id: 'plan-1',
      title: 'Test Plan',
      description: 'Test Description',
      date: new Date(mockDateStr),
      location: 'Test Location',
      budget: 1000,
      isPublic: false,
      userId: mockUserId,
      createdAt: new Date(mockDateStr),
      updatedAt: new Date(mockDateStr),
      likes: [],
    }

    it('プラン一覧を取得', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [mockPlan] }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.list(mockToken);

      expect(fetch).toHaveBeenCalledWith('/api/plans', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual({ data: [mockPlan] });
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
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.plans.list(mockToken);

      expect(result).toEqual({ error: 'プラン一覧の取得に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plans list error:', networkError);
    });

    it('プランを作成', async () => {
      const newPlan = {
        ...mockPlan,
        id: 'new-plan-id'
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: newPlan }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const planData = { 
        title: 'New Plan', 
        description: '',
        date: new Date(mockDateStr), 
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.create(mockToken, planData);

      expect(fetch).toHaveBeenCalledWith('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(planData),
      });
      expect(result).toEqual({ data: newPlan });
    });

    it('プラン作成時のエラーハンドリング', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const planData = { 
        title: 'New Plan', 
        description: '',
        date: new Date(mockDateStr), 
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.create(mockToken, planData);

      expect(result).toEqual({ error: 'プランの作成に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan create error:', networkError);
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
        date: new Date(mockDateStr), 
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.create(mockToken, planData);

      expect(result).toEqual({ error: 'プランの作成に失敗しました' });
    });

    it('特定のプランを取得', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockPlan }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.get(mockToken, 'plan-1');

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-1', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual({ data: mockPlan });
    });

    it('プラン取得失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Plan not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.get(mockToken, 'nonexistent-plan');

      expect(result).toEqual({ error: 'Plan not found' });
    });

    it('プラン取得時のネットワークエラーを処理', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.plans.get(mockToken, 'plan-1');

      expect(result).toEqual({ error: 'プランの取得に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan get error:', networkError);
    });

    it('プランを更新', async () => {
      const updatedPlan = {
        ...mockPlan,
        title: 'Updated Plan',
        budget: 6000
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: updatedPlan }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const planData = { 
        title: 'Updated Plan', 
        description: '',
        budget: 6000,
        isPublic: false
      };
      const result = await api.plans.update(mockToken, 'plan-1', planData);

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(planData),
      });
      expect(result).toEqual({ data: updatedPlan });
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
      const result = await api.plans.update(mockToken, 'plan-1', planData);

      expect(result).toEqual({ error: 'Validation failed' });
    });

    it('プラン更新時のネットワークエラーを処理', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const planData = { 
        title: 'Updated Plan', 
        description: '',
        budget: 5000,
        isPublic: false
      };
      const result = await api.plans.update(mockToken, 'plan-1', planData);

      expect(result).toEqual({ error: 'プランの更新に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan update error:', networkError);
    });

    it('プランを削除', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.delete(mockToken, 'plan-1');

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-1', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual({ success: true });
    });

    it('プラン削除失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Plan not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.delete(mockToken, 'nonexistent-plan');

      expect(result).toEqual({ error: 'Plan not found' });
    });

    it('プラン削除時のネットワークエラーを処理', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.plans.delete(mockToken, 'plan-1');

      expect(result).toEqual({ error: 'プランの削除に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan delete error:', networkError);
    });

    it('公開プラン一覧を取得', async () => {
      const publicPlan = {
        ...mockPlan,
        isPublic: true
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [publicPlan] }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.listPublic(mockToken);

      expect(fetch).toHaveBeenCalledWith('/api/plans/public', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual({ data: [publicPlan] });
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
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.plans.listPublic(mockToken);

      expect(result).toEqual({ error: '公開プラン一覧の取得に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Public plans list error:', networkError);
    });

    it('プランの公開設定を更新', async () => {
      const publishedPlan = {
        ...mockPlan,
        isPublic: true
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: publishedPlan }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.publish(mockToken, 'plan-1', true);

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-1/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({ isPublic: true }),
      });
      expect(result).toEqual({ data: publishedPlan });
    });

    it('プラン公開設定更新失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Plan not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.plans.publish(mockToken, 'nonexistent-plan', true);

      expect(result).toEqual({ error: 'Plan not found' });
    });

    it('プラン公開設定更新時のネットワークエラーを処理', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.plans.publish(mockToken, 'plan-1', true);

      expect(result).toEqual({ error: 'プランの公開設定の更新に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Plan publish error:', networkError);
    });
  })

  describe('likes', () => {
    it('いいねを作成', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.likes.create(mockToken, 'plan-1');

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-1/likes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual({ success: true });
    });

    it('いいね作成失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Already liked' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.likes.create(mockToken, 'plan-1');

      expect(result).toEqual({ error: 'Already liked' });
    });

    it('いいね作成時のネットワークエラーを処理', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.likes.create(mockToken, 'plan-1');

      expect(result).toEqual({ error: 'いいねの追加に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Like create error:', networkError);
    });

    it('いいねを削除', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.likes.delete(mockToken, 'plan-1');

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-1/likes', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual({ success: true });
    });

    it('いいね削除失敗時のエラーレスポンスを処理', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Like not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.likes.delete(mockToken, 'plan-1');

      expect(result).toEqual({ error: 'Like not found' });
    });

    it('いいね削除時のネットワークエラーを処理', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await api.likes.delete(mockToken, 'plan-1');

      expect(result).toEqual({ error: 'いいねの削除に失敗しました' });
      expect(console.error).toHaveBeenCalledWith('Like delete error:', networkError);
    });
  })
})
