import { Profile } from '@/types/profile';

export interface ApiErrorResponse {
  error: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export const profileApi = {
  // プロフィール情報を取得する関数
  fetchProfile: async (token: string): Promise<Profile> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse;
        throw new Error(errorData.error || 'プロフィールの取得に失敗しました');
      }

      const { data } = (await response.json()) as ApiSuccessResponse<Profile>;
      return data;
    } catch (error) {
      // ネットワークエラーも含めて統一したエラーメッセージを返す
      throw new Error(
        error instanceof Error && error.message !== 'Network error'
          ? error.message
          : 'プロフィールの取得に失敗しました'
      );
    }
  },

  // プロフィール情報を更新する関数
  updateProfile: async (token: string, name: string, email: string): Promise<Profile> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse;
        throw new Error(errorData.error || 'プロフィールの更新に失敗しました');
      }

      const { data } = (await response.json()) as ApiSuccessResponse<Profile>;
      return data;
    } catch (error) {
      // ネットワークエラーも含めて統一したエラーメッセージを返す
      throw new Error(
        error instanceof Error && error.message !== 'Network error'
          ? error.message
          : 'プロフィールの更新に失敗しました'
      );
    }
  },

  // 特定のユーザーIDのプロフィールを取得する関数
  fetchUserProfile: async (token: string, userId: string): Promise<Profile> => {
    try {
      const response = await fetch(`/api/profile/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse;
        throw new Error(errorData.error || 'プロフィールの取得に失敗しました');
      }

      const { data } = (await response.json()) as ApiSuccessResponse<Profile>;
      return data;
    } catch (error) {
      // ネットワークエラーも含めて統一したエラーメッセージを返す
      throw new Error(
        error instanceof Error && error.message !== 'Network error'
          ? error.message
          : 'プロフィールの取得に失敗しました'
      );
    }
  },

  // アカウントを削除する関数
  deleteAccount: async (token: string): Promise<{ data: string }> => {
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse;
        throw new Error(errorData.error || 'アカウントの削除に失敗しました');
      }

      return (await response.json()) as ApiSuccessResponse<string>;
    } catch (error) {
      // ネットワークエラーも含めて統一したエラーメッセージを返す
      throw new Error(
        error instanceof Error && error.message !== 'Network error'
          ? error.message
          : 'アカウントの削除に失敗しました'
      );
    }
  },
};
