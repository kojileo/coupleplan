import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import NewPlanPage from '@/app/(dashboard)/plans/new/page';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      create: jest.fn(),
      get: jest.fn(),
    },
  },
}));

describe('NewPlanPage', () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  const mockSession = {
    access_token: 'test-token',
    user: { id: 'test-user-id' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (api.plans.create as jest.Mock).mockResolvedValue({ data: { id: 'new-plan-id' } });
    (api.plans.get as jest.Mock).mockResolvedValue({ data: null });
  });

  it('フォームが正しく表示される', () => {
    render(<NewPlanPage />);
    expect(screen.getByTestId('plan-form')).toBeInTheDocument();
    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('日付')).toBeInTheDocument();
    expect(screen.getByLabelText('予算')).toBeInTheDocument();
    expect(screen.getByLabelText('場所URL')).toBeInTheDocument();
    expect(screen.getByLabelText('地域')).toBeInTheDocument();
  });

  it('フォーム送信時にAPIが呼び出される', async () => {
    render(<NewPlanPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('タイトル'), 'テストプラン');
    await user.type(screen.getByLabelText('説明'), 'テスト説明');
    await user.type(screen.getByLabelText('日付'), '2024-01-01');
    await user.type(screen.getByLabelText('予算'), '10000');
    await user.type(screen.getByLabelText('場所URL'), 'https://example.com');
    await user.selectOptions(screen.getByLabelText('地域'), 'tokyo');

    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(api.plans.create).toHaveBeenCalledWith('test-token', {
        title: 'テストプラン',
        description: 'テスト説明',
        date: '2024-01-01',
        locations: [{ url: 'https://example.com', name: null }],
        region: 'tokyo',
        budget: 10000,
        isPublic: false,
      });
    });
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    (api.plans.create as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));
    render(<NewPlanPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('タイトル'), 'テストプラン');
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('プランの作成に失敗しました');
    });
  });

  it('ローディング中はスピナーが表示される', async () => {
    (api.plans.create as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<NewPlanPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('タイトル'), 'テストプラン');
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  it('キャンセルボタンをクリックするとrouter.backが呼び出される', async () => {
    render(<NewPlanPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it.skip('テンプレートプランが正しく読み込まれる', async () => {
    const mockTemplatePlan = {
      title: 'テンプレートプラン',
      description: 'テンプレート説明',
      date: new Date('2024-01-01'),
      locations: [{ url: 'https://example.com', name: 'テスト場所' }],
      region: 'tokyo',
      budget: 10000,
      isPublic: true,
    };

    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('template=test-template-id')
    );
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockTemplatePlan });

    render(<NewPlanPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('タイトル')).toHaveValue('テンプレートプラン');
      expect(screen.getByLabelText('説明')).toHaveValue('テンプレート説明');
      expect(screen.getByLabelText('日付')).toHaveValue('2024-01-01');
      expect(screen.getByLabelText('予算')).toHaveValue('10000');
      expect(screen.getByLabelText('場所URL')).toHaveValue('https://example.com');
      expect(screen.getByLabelText('場所の名前（任意）')).toHaveValue('テスト場所');
      expect(screen.getByLabelText('地域')).toHaveValue('tokyo');
    });
  });

  it.skip('テンプレートプランの読み込み中はローディングが表示される', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('template=test-template-id')
    );
    (api.plans.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<NewPlanPage />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it.skip('テンプレートプランの読み込みに失敗した場合エラーメッセージが表示される', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('template=test-template-id')
    );
    (api.plans.get as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));

    render(<NewPlanPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'テンプレートプランの読み込みに失敗しました'
      );
    });
  });
});
