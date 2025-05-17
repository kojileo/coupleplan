'use client';

import type { ReactElement, ReactNode } from 'react';

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AuthGuard({ children }: { children: ReactNode }): ReactElement {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          role="status"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        />
      </div>
    );
  }

  return <>{children}</>;
}
