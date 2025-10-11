import { ApiResponse, LoginRequest, SignUpRequest, PlanRequest } from '@/types/api';
import type { DatePlanDetail } from '@/types/date-plan';

const API_BASE = '/api';

export const api = {
  auth: {
    login: async (data: LoginRequest): Promise<ApiResponse> => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return (await response.json()) as ApiResponse;
    },

    signup: async (data: SignUpRequest): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return (await response.json()) as ApiResponse;
      } catch (error) {
        console.error('Signup error:', error);
        return { error: 'サインアップに失敗しました' };
      }
    },
  },

  profile: {
    get: async (token: string, userId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch(`${API_BASE}/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return (await response.json()) as ApiResponse<any>;
      } catch (error) {
        console.error('Profile get error:', error);
        return { error: 'プロフィールの取得に失敗しました' };
      }
    },

    update: async (token: string, name: string, email: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch(`${API_BASE}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email }),
        });
        return (await response.json()) as ApiResponse<any>;
      } catch (error) {
        console.error('Profile update error:', error);
        return { error: 'プロフィールの更新に失敗しました' };
      }
    },
  },

  plans: {
    list: async (token: string): Promise<{ data: DatePlanDetail[] } | { error: string }> => {
      try {
        const response = await fetch('/api/plans', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('プラン一覧の取得に失敗しました');
        }

        const responseData = (await response.json()) as { data: DatePlanDetail[] };
        return { data: responseData.data };
      } catch (error) {
        console.error('Plans list error:', error);
        return { error: 'プラン一覧の取得に失敗しました' };
      }
    },

    create: async (token: string, data: PlanRequest): Promise<ApiResponse<DatePlanDetail>> => {
      try {
        const response = await fetch(`${API_BASE}/plans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        const responseData = (await response.json()) as ApiResponse<DatePlanDetail>;

        if (!response.ok) {
          console.error('API Error:', responseData);
          return { error: responseData.error || 'プランの作成に失敗しました' };
        }

        return responseData;
      } catch (error) {
        console.error('Plan create error:', error);
        return { error: 'プランの作成に失敗しました' };
      }
    },

    get: async (token: string, id: string): Promise<ApiResponse<DatePlanDetail>> => {
      try {
        const response = await fetch(`${API_BASE}/plans/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return (await response.json()) as ApiResponse<DatePlanDetail>;
      } catch (error) {
        console.error('Plan get error:', error);
        return { error: 'プランの取得に失敗しました' };
      }
    },

    update: async (
      token: string,
      id: string,
      data: PlanRequest
    ): Promise<ApiResponse<DatePlanDetail>> => {
      try {
        const response = await fetch(`${API_BASE}/plans/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        return (await response.json()) as ApiResponse<DatePlanDetail>;
      } catch (error) {
        console.error('Plan update error:', error);
        return { error: 'プランの更新に失敗しました' };
      }
    },

    delete: async (token: string, id: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_BASE}/plans/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return (await response.json()) as ApiResponse;
      } catch (error) {
        console.error('Plan delete error:', error);
        return { error: 'プランの削除に失敗しました' };
      }
    },

    listPublic: async (): Promise<{ data: DatePlanDetail[] } | { error: string }> => {
      try {
        const response = await fetch('/api/plans/public');

        if (!response.ok) {
          throw new Error('公開プラン一覧の取得に失敗しました');
        }

        const responseData = (await response.json()) as { data: DatePlanDetail[] };
        return { data: responseData.data };
      } catch (error) {
        console.error('Public plans list error:', error);
        return { error: '公開プラン一覧の取得に失敗しました' };
      }
    },

    publish: async (
      token: string,
      planId: string,
      isPublic: boolean
    ): Promise<ApiResponse<DatePlanDetail>> => {
      try {
        const response = await fetch(`${API_BASE}/plans/${planId}/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPublic }),
        });
        return (await response.json()) as ApiResponse<DatePlanDetail>;
      } catch (error) {
        console.error('Plan publish error:', error);
        return { error: 'プランの公開設定の更新に失敗しました' };
      }
    },
  },

  likes: {
    create: async (token: string, planId: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_BASE}/plans/${planId}/likes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return (await response.json()) as ApiResponse;
      } catch (error) {
        console.error('Like create error:', error);
        return { error: 'いいねの追加に失敗しました' };
      }
    },

    delete: async (token: string, planId: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_BASE}/plans/${planId}/likes`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return (await response.json()) as ApiResponse;
      } catch (error) {
        console.error('Like delete error:', error);
        return { error: 'いいねの削除に失敗しました' };
      }
    },
  },
};
