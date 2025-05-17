import type { ReactElement, ReactNode } from 'react';

import AuthGuard from '@/components/features/auth/AuthGuard';
import Navbar from '@/components/features/dashboard/Navbar';

export default function DashboardLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
