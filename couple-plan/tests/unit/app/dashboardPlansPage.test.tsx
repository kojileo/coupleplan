import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MyPlansPage from '@/app/(dashboard)/plans/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import React from 'react';

// PlanCard コンポーネントを簡易モック化
jest.mock('@/components/features/plans/PlanCard', () => ({
  PlanCard: ({ plan }: { plan: any, isPublic: boolean }) => <div data-testid="plan-card">{plan.title}</div>,
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      list: jest.fn(),
    },
  },
}));

describe('MyPlansPage コンポーネント', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: 'token123' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ロード中はスピナーが表示される', () => {
    (api.plans.list as jest.Mock).mockImplementation(() => new Promise(() => {})); // resolve されない
    render(<MyPlansPage />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('プランが存在しない場合、適切なメッセージと新規作成ボタンが表示され、ボタン押下で /plans/new に遷移する', async () => {
    (api.plans.list as jest.Mock).mockResolvedValueOnce({ data: [] });
    render(<MyPlansPage />);
    
    await waitFor(() => {
      expect(screen.getByText('プランがまだありません')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('empty-create-button'));
    expect(push).toHaveBeenCalledWith('/plans/new');
  });
  
  it('プランが存在する場合、PlanCard がレンダリングされる', async () => {
    const mockPlans = [
      { id: '1', title: 'Plan 1', description: '', date: '2023-10-10', budget: 1000, location: '', isPublic: false },
      { id: '2', title: 'Plan 2', description: '', date: '2023-10-11', budget: 2000, location: '', isPublic: false }
    ];
    (api.plans.list as jest.Mock).mockResolvedValueOnce({ data: mockPlans });
    render(<MyPlansPage />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('plan-card').length).toBe(2);
    });
  });
});