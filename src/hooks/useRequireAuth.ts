'use client';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth(): { user: User | null; isLoading: boolean } {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}
