import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api/profile';
import type { Profile } from '@/types/profile';

interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<Profile | null>;
  deleteAccount: () => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = useCallback(async (): Promise<void> => {
    if (!session?.access_token) return;

    setIsLoading(true);
    setError(null);

    try {
      const profileData = await profileApi.fetchProfile(session.access_token);
      setProfile(profileData);
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
      setError(err instanceof Error ? err : new Error('プロフィールの取得に失敗しました'));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token) {
      void fetchUserProfile();
    }
  }, [session, fetchUserProfile]);

  const updateUserProfile = async (name: string, email: string): Promise<Profile | null> => {
    if (!session?.access_token) return null;

    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await profileApi.updateProfile(session.access_token, name, email);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('プロフィール更新エラー:', err);
      setError(err instanceof Error ? err : new Error('プロフィールの更新に失敗しました'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUserAccount = async (): Promise<boolean> => {
    if (!session?.access_token) return false;

    setIsLoading(true);
    setError(null);

    try {
      await profileApi.deleteAccount(session.access_token);
      // アカウント削除後、ログアウト処理を行う
      await signOut();
      return true;
    } catch (err) {
      console.error('アカウント削除エラー:', err);
      setError(err instanceof Error ? err : new Error('アカウントの削除に失敗しました'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    fetchProfile: fetchUserProfile,
    updateProfile: updateUserProfile,
    deleteAccount: deleteUserAccount,
  };
}
