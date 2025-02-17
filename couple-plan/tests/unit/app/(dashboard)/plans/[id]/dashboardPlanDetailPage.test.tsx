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
  const mockUserId = 'user-123';
  const mockPlan = {
    id: '123',
    title: 'Plan Detail Title',
    description: 'Plan description',
    date: '2023-10-10',
    budget: 1500,
    location: 'https://example.com',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-05',
    userId: mockUserId, // プラン作成者のID
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ロード中にスピナーが表示される', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('プラン作成者の場合、編集系のボタンが表示される', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 編集系のボタンが表示されていることを確認
    expect(screen.getByRole('button', { name: /公開設定/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /編集/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /削除/i })).toBeInTheDocument();
  });

  it('プラン作成者以外の場合、編集系のボタンが表示されない', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: 'different-user' } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 編集系のボタンが表示されていないことを確認
    expect(screen.queryByRole('button', { name: /公開設定/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /編集/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /削除/i })).not.toBeInTheDocument();
  });

  it('プラン作成者の場合、削除処理が実行できる', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
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
      expect(push).toHaveBeenCalledWith('/plans');
    });
  });

  it('プラン作成者の場合、公開設定ダイアログを開ける', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    expect(screen.getByTestId('publish-dialog')).toHaveTextContent('Closed');
    fireEvent.click(screen.getByRole('button', { name: /公開設定/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('publish-dialog')).toHaveTextContent('Open');
    });
  });

  it('プランの詳細情報が正しく表示される', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 詳細情報の表示を確認
    expect(screen.getByText('説明')).toBeInTheDocument();
    expect(screen.getByText('Plan description')).toBeInTheDocument();
    expect(screen.getByText('予算')).toBeInTheDocument();
    expect(screen.getByText('¥1,500')).toBeInTheDocument();
    expect(screen.getByText('場所URL')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    
    // 日付の表示を確認
    const date = new Date(mockPlan.date).toLocaleDateString();
    expect(screen.getByText(date)).toBeInTheDocument();

    // 作成日・更新日の表示を確認
    const createdDate = new Date(mockPlan.createdAt).toLocaleDateString();
    const updatedDate = new Date(mockPlan.updatedAt).toLocaleDateString();
    expect(screen.getByText(`作成日: ${createdDate}`)).toBeInTheDocument();
    expect(screen.getByText(`更新日: ${updatedDate}`)).toBeInTheDocument();
  });

  it('プラン作成者以外でも詳細情報を閲覧できる', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: 'different-user' } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 基本情報が表示されることを確認
    expect(screen.getByText('Plan description')).toBeInTheDocument();
    expect(screen.getByText('¥1,500')).toBeInTheDocument();
    
    // 編集系のボタンが表示されないことを確認
    expect(screen.queryByRole('button', { name: /公開設定/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /編集/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /削除/i })).not.toBeInTheDocument();
  });
});