import { render, screen, waitFor } from '@testing-library/react';
import PublicPlansPage from '@/app/(dashboard)/plans/public/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { TEST_AUTH } from '@tests/utils/test-constants';

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
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: TEST_AUTH.ACCESS_TOKEN } });
    // console.error をモック化して、テスト中のエラーログを抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
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

  it('セッションがない場合、APIが呼ばれずにローディング状態が解除される', async () => {
    // セッションなしをモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    render(<PublicPlansPage />);
    
    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
    
    // APIが呼ばれていないことを確認
    expect(api.plans.listPublic).not.toHaveBeenCalled();
    
    // 公開プランが空の状態で表示されることを確認
    expect(screen.getByText('公開プランがまだありません')).toBeInTheDocument();
  });

  it('APIエラーが発生した場合、エラーがログに出力され、ローディング状態が解除される', async () => {
    // APIエラーをモック
    (api.plans.listPublic as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    render(<PublicPlansPage />);
    
    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
    
    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalledWith('公開プランの取得に失敗しました:', expect.any(Error));
    
    // 公開プランが空の状態で表示されることを確認
    expect(screen.getByText('公開プランがまだありません')).toBeInTheDocument();
  });

  it('APIレスポンスにエラーが含まれる場合、エラーがログに出力される', async () => {
    // エラーレスポンスをモック
    (api.plans.listPublic as jest.Mock).mockResolvedValueOnce({ error: 'データの取得に失敗しました' });
    render(<PublicPlansPage />);
    
    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
    
    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();
    
    // 公開プランが空の状態で表示されることを確認
    expect(screen.getByText('公開プランがまだありません')).toBeInTheDocument();
  });

  it('APIレスポンスにdataフィールドがない場合、空の配列が使用される', async () => {
    // dataフィールドがないレスポンスをモック
    (api.plans.listPublic as jest.Mock).mockResolvedValueOnce({});
    render(<PublicPlansPage />);
    
    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
    
    // 公開プランが空の状態で表示されることを確認
    expect(screen.getByText('公開プランがまだありません')).toBeInTheDocument();
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