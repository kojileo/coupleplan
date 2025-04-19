import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

describe('NewPlanPage コンポーネント', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };
  const mockSearchParams = new URLSearchParams('template=123');

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useAuth as jest.Mock).mockReturnValue({
      session: {
        user: { id: 'test-user' },
        access_token: 'test-token',
      },
    });
    (api.plans.create as jest.Mock).mockResolvedValue({ data: { id: 'new-plan-id' } });
    (api.plans.get as jest.Mock).mockResolvedValue({
      data: {
        id: '123',
        title: 'テンプレートプラン',
        description: 'テンプレートの説明',
        date: '2024-01-01',
        budget: 5000,
        locations: [{ url: 'https://example.com', name: 'テスト場所' }],
        region: 'tokyo',
        isPublic: true,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('フォームが正しく表示される', async () => {
    await act(async () => {
      render(<NewPlanPage />);
    });

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('日付')).toBeInTheDocument();
    expect(screen.getByLabelText('予算')).toBeInTheDocument();
    expect(screen.getByLabelText('場所URL')).toBeInTheDocument();
    expect(screen.getByLabelText('地域')).toBeInTheDocument();
    expect(screen.getByLabelText('公開する')).toBeInTheDocument();
  });

  it('フォームに入力できる', async () => {
    await act(async () => {
      render(<NewPlanPage />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
      fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'テスト用の説明文' } });
      fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
      fireEvent.click(screen.getByText('URLを追加'));
      fireEvent.change(screen.getByLabelText('場所URL'), {
        target: { value: 'https://example.com' },
      });
      fireEvent.change(screen.getByLabelText('地域'), { target: { value: 'tokyo' } });
      fireEvent.click(screen.getByLabelText('公開する'));
    });

    expect(screen.getByLabelText('タイトル')).toHaveValue('テストプラン');
    expect(screen.getByLabelText('説明')).toHaveValue('テスト用の説明文');
    expect(screen.getByLabelText('日付')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('予算')).toHaveValue(5000);
    expect(screen.getByLabelText('場所URL')).toHaveValue('https://example.com');
    expect(screen.getByLabelText('地域')).toHaveValue('tokyo');
    expect(screen.getByLabelText('公開する')).toBeChecked();
  });

  it('フォーム送信時にAPIが呼ばれる', async () => {
    await act(async () => {
      render(<NewPlanPage />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
      fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'テスト用の説明文' } });
      fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
      fireEvent.click(screen.getByText('URLを追加'));
      fireEvent.change(screen.getByLabelText('場所URL'), {
        target: { value: 'https://example.com' },
      });
      fireEvent.change(screen.getByLabelText('地域'), { target: { value: 'tokyo' } });
      fireEvent.click(screen.getByLabelText('公開する'));
    });

    const form = screen.getByTestId('plan-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(api.plans.create).toHaveBeenCalledWith(
        'test-user',
        expect.objectContaining({
          title: 'テストプラン',
          description: 'テスト用の説明文',
          date: '2024-01-01',
          budget: 5000,
          locations: [{ url: 'https://example.com', name: 'テスト場所' }],
          region: 'tokyo',
          isPublic: true,
        })
      );
    });
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    (api.plans.create as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));

    await act(async () => {
      render(<NewPlanPage />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
      fireEvent.click(screen.getByText('作成'));
    });

    await waitFor(() => {
      expect(screen.getByText('プランの作成に失敗しました')).toBeInTheDocument();
    });
  });

  it('キャンセルボタンをクリックすると前のページに戻る', async () => {
    await act(async () => {
      render(<NewPlanPage />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('キャンセル'));
    });

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('セッションがない場合、フォーム送信時に何も起こらない', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null });

    await act(async () => {
      render(<NewPlanPage />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
      fireEvent.click(screen.getByText('作成'));
    });

    await waitFor(() => {
      expect(api.plans.create).not.toHaveBeenCalled();
    });
  });

  it('保存中はボタンが無効化され、テキストが「作成中...」に変わる', async () => {
    // APIの呼び出しを遅延させる
    (api.plans.create as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    await act(async () => {
      render(<NewPlanPage />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    });

    const submitButton = screen.getByRole('button', { name: '作成' });
    const form = screen.getByTestId('plan-form');

    await act(async () => {
      fireEvent.submit(form);
    });

    // 状態更新を待つ
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('作成中...');
    });
  });

  it('テンプレートプランが正しく読み込まれる', async () => {
    const mockTemplate = {
      title: 'テンプレートプラン',
      description: 'テンプレートの説明',
      date: '2024-01-01',
      budget: 5000,
      locations: [{ url: 'https://example.com', name: 'テスト場所' }],
      region: 'tokyo',
      isPublic: false,
    };

    (api.plans.get as jest.Mock).mockResolvedValue({ data: mockTemplate });

    render(<NewPlanPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('タイトル')).toHaveValue('テンプレートプラン');
      expect(screen.getByLabelText('説明')).toHaveValue('テンプレートの説明');
      expect(screen.getByLabelText('日付')).toHaveValue('2024-01-01');
      expect(screen.getByLabelText('予算')).toHaveValue(5000);
      expect(screen.getByLabelText('場所URL')).toHaveValue('https://example.com');
      expect(screen.getByLabelText('場所の名前（任意）')).toHaveValue('テスト場所');
      expect(screen.getByLabelText('地域')).toHaveValue('tokyo');
      expect(screen.getByLabelText('公開する')).not.toBeChecked();
    });
  });
});
