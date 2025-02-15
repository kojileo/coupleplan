import { render, screen, waitFor } from '@testing-library/react';
import PublicPlansPage from '@/app/(dashboard)/plans/public/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      listPublic: jest.fn(),
    },
  },
}));

jest.mock('@/components/features/plans/PlanCard', () => ({
  PlanCard: ({ plan }: { plan: any, isPublic: boolean }) => <div data-testid="plan-card">{plan.title}</div>,
}));

describe('PublicPlansPage コンポーネント', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: 'token123' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ロード中はスピナーが表示される', () => {
    (api.plans.listPublic as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<PublicPlansPage />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('公開プランが存在しない場合、メッセージが表示される', async () => {
    (api.plans.listPublic as jest.Mock).mockResolvedValueOnce({ data: [] });
    render(<PublicPlansPage />);
    
    await waitFor(() => {
      expect(screen.getByText('公開プランがまだありません')).toBeInTheDocument();
    });
  });

  it('公開プランが存在する場合、PlanCard がレンダリングされる', async () => {
    const mockPublicPlans = [
      { id: '1', title: 'Public Plan 1', description: '', date: '2023-10-10', budget: 1000, location: '', isPublic: true },
      { id: '2', title: 'Public Plan 2', description: '', date: '2023-10-11', budget: 2000, location: '', isPublic: true }
    ];
    (api.plans.listPublic as jest.Mock).mockResolvedValueOnce({ data: mockPublicPlans });
    render(<PublicPlansPage />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('plan-card').length).toBe(2);
    });
  });
});