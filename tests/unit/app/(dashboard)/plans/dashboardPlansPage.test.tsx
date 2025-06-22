import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MyPlansPage from '@/app/(dashboard)/plans/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import React from 'react';
import { TEST_AUTH } from '@tests/utils/test-constants';

// PlanCard コンポーネントを簡易モック化
jest.mock('@/components/features/plans/PlanCard', () => ({
  PlanCard: ({ plan }: { plan: any; isPublic: boolean }) => (
    <div data-testid="plan-card">{plan.title}</div>
  ),
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

// EmergencyButtonをモック
jest.mock('@/components/features/emergency/EmergencyButton', () => ({
  EmergencyButton: () => <div data-testid="emergency-button">緊急ヘルプ</div>,
}));

describe('MyPlansPage コンポーネント', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: TEST_AUTH.ACCESS_TOKEN } });
    // console.error をモック化して、テスト中のエラーログを抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
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

  it('セッションがない場合、APIが呼ばれずにローディング状態が解除される', async () => {
    // セッションがない状態をモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    render(<MyPlansPage />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // APIが呼ばれていないことを確認
    expect(api.plans.list).not.toHaveBeenCalled();

    // プランが空の状態で表示されることを確認
    expect(screen.getByText('プランがまだありません')).toBeInTheDocument();
  });

  it('APIエラーが発生した場合、エラーがログに出力され、ローディング状態が解除される', async () => {
    // APIエラーをモック
    (api.plans.list as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    render(<MyPlansPage />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalledWith('プランの取得に失敗しました:', expect.any(Error));

    // プランが空の状態で表示されることを確認
    expect(screen.getByText('プランがまだありません')).toBeInTheDocument();
  });

  it('APIレスポンスにエラーが含まれる場合、エラーがログに出力される', async () => {
    // エラーレスポンスをモック
    (api.plans.list as jest.Mock).mockResolvedValueOnce({ error: 'データの取得に失敗しました' });
    render(<MyPlansPage />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();

    // プランが空の状態で表示されることを確認
    expect(screen.getByText('プランがまだありません')).toBeInTheDocument();
  });

  it('APIレスポンスにdataフィールドがない場合、空の配列が使用される', async () => {
    // dataフィールドがないレスポンスをモック
    (api.plans.list as jest.Mock).mockResolvedValueOnce({});
    render(<MyPlansPage />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // プランが空の状態で表示されることを確認
    expect(screen.getByText('プランがまだありません')).toBeInTheDocument();
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
      {
        id: '1',
        title: 'Plan 1',
        description: '',
        date: '2023-10-10',
        budget: 1000,
        location: '',
        isPublic: false,
      },
      {
        id: '2',
        title: 'Plan 2',
        description: '',
        date: '2023-10-11',
        budget: 2000,
        location: '',
        isPublic: false,
      },
    ];
    (api.plans.list as jest.Mock).mockResolvedValueOnce({ data: mockPlans });
    render(<MyPlansPage />);

    await waitFor(() => {
      expect(screen.getAllByTestId('plan-card').length).toBe(2);
    });
  });

  it('ヘッダーの新規プラン作成ボタンをクリックすると、/plans/new に遷移する', async () => {
    (api.plans.list as jest.Mock).mockResolvedValueOnce({ data: [] });
    render(<MyPlansPage />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // ヘッダーの新規プラン作成ボタンをクリック
    fireEvent.click(screen.getByTestId('header-create-button'));
    expect(push).toHaveBeenCalledWith('/plans/new');
  });

  it('WeatherOutfitCardが表示されない（SOS機能に移動されたため）', async () => {
    (api.plans.list as jest.Mock).mockResolvedValueOnce({ data: [] });
    render(<MyPlansPage />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // WeatherOutfitCardが表示されていないことを確認
    expect(screen.queryByText('今日の天気')).not.toBeInTheDocument();
    expect(screen.queryByText('おすすめの服装')).not.toBeInTheDocument();

    // 代わりにEmergencyButtonが表示されていることを確認
    expect(screen.getByTestId('emergency-button')).toBeInTheDocument();
  });

  it('EmergencyButtonが正しく表示される', async () => {
    (api.plans.list as jest.Mock).mockResolvedValueOnce({ data: [] });
    render(<MyPlansPage />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // EmergencyButtonが表示されていることを確認
    const emergencyButton = screen.getByTestId('emergency-button');
    expect(emergencyButton).toBeInTheDocument();
    expect(emergencyButton).toHaveTextContent('緊急ヘルプ');
  });
});
