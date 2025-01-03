'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return <>{children}</>
}