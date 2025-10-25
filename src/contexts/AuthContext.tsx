'use client';

import { User, Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { supabase } from '@/lib/supabase-auth';
import {
  safeAuthCheck,
  clearSession,
  detectAndClearCorruptedSession,
  type AuthStatus,
} from '@/lib/manual-auth';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearCorruptedSession: () => Promise<void>;
  authStatus: AuthStatus | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
  clearCorruptedSession: async () => {},
  authStatus: null,
});

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  useEffect(() => {
    let mounted = true;

    // 初期セッション取得（破損したセッションをチェック）
    const getInitialSession = async () => {
      try {
        // まず破損したセッションをチェック
        const isCorrupted = await detectAndClearCorruptedSession();
        if (isCorrupted) {
          console.log('破損したセッションをクリアしました');
          if (mounted) {
            setSession(null);
            setUser(null);
            setAuthStatus({
              isAuthenticated: false,
              needsRefresh: false,
              error: 'セッションが破損していたためクリアしました',
            });
            setIsLoading(false);
          }
          return;
        }

        const status = await safeAuthCheck();

        if (mounted) {
          setAuthStatus(status);

          if (status.isAuthenticated) {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
          } else {
            setSession(null);
            setUser(null);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('セッション取得に失敗:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setAuthStatus({
            isAuthenticated: false,
            needsRefresh: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          setIsLoading(false);
        }
      }
    };

    // 認証状態変更の監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('認証状態変更:', event, 'session:', session ? 'exists' : 'null');

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 初期セッション取得
    void getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setAuthStatus(null);
      // ホーム画面にリダイレクト
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const status = await safeAuthCheck();
      setAuthStatus(status);

      if (status.isAuthenticated) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      }
    } catch (error) {
      console.error('認証リフレッシュエラー:', error);
    }
  };

  const clearCorruptedSession = async (): Promise<void> => {
    try {
      await clearSession();
      setSession(null);
      setUser(null);
      setAuthStatus({
        isAuthenticated: false,
        needsRefresh: false,
        error: 'セッションを手動でクリアしました',
      });
    } catch (error) {
      console.error('セッションクリアエラー:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        refreshAuth,
        clearCorruptedSession,
        authStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
