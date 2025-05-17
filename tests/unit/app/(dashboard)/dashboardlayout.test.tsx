import { render, screen } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';

// AuthGuard と Navbar をモック化
jest.mock('@/components/features/auth/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-guard">{children}</div>
  ),
}));

jest.mock('@/components/features/dashboard/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

describe('DashboardLayout コンポーネント', () => {
  it('子要素と Navbar を正しくレンダリングする', () => {
    render(
      <DashboardLayout>
        <div data-testid="child">Dashboard Content</div>
      </DashboardLayout>
    );
    expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});