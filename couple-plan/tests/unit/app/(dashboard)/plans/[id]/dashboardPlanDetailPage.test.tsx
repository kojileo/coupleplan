import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PlanDetailPage from '@/app/(dashboard)/plans/[id]/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      get: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// PublishDialog を簡易モック化（isOpen の状態で表示内容を切替）
jest.mock('@/components/features/plans/PublishDialog', () => ({
  __esModule: true,
  default: (props: { isOpen: boolean; onClose: () => void; planId: string }) => (
    <div data-testid="publish-dialog">{props.isOpen ? 'Open' : 'Closed'}</div>
  ),
}));

describe('PlanDetailPage コンポーネント', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: 'token123' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ロード中にスピナーが表示される', () => {
    (api.plans.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('プラン詳細が正しくレンダリングされる', async () => {
    const mockPlan = {
      id: '123',
      title: 'Plan Detail Title',
      description: 'Plan description',
      date: '2023-10-10',
      budget: 1500,
      location: 'https://example.com',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-05'
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });
    expect(screen.getByText('Plan description')).toBeInTheDocument();
    expect(screen.getByText(/¥1,500/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /削除/i })).toBeInTheDocument();
  });

  it('プラン削除時、確認ダイアログで OK を選択すると削除処理が実行され /plans へ遷移する', async () => {
    const mockPlan = {
      id: '123',
      title: 'Plan Detail Title',
      description: 'Plan description',
      date: '2023-10-10',
      budget: 1500,
      location: 'https://example.com',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-05'
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    (api.plans.delete as jest.Mock).mockResolvedValueOnce({});
    window.confirm = jest.fn(() => true);
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));

    await waitFor(() => {
      expect(api.plans.delete).toHaveBeenCalledWith('token123', '123');
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans');
    });
  });

  it('公開設定ボタンのクリックで公開ダイアログが開く', async () => {
    const mockPlan = {
      id: '123',
      title: 'Plan Detail Title',
      description: 'Plan description',
      date: '2023-10-10',
      budget: 1500,
      location: 'https://example.com',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-05'
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 初期状態：ダイアログは閉じているはずなので "Closed" を確認
    expect(screen.getByTestId('publish-dialog')).toHaveTextContent('Closed');
    // 公開設定ボタンをクリックしてダイアログを開く
    fireEvent.click(screen.getByRole('button', { name: /公開設定/i }));
    await waitFor(() => {
      expect(screen.getByTestId('publish-dialog')).toHaveTextContent('Open');
    });
  });
});