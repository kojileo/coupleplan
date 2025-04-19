import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewPlanPage from '@/app/(dashboard)/plans/new/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { createMockSession } from '@tests/utils/test-constants';

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      create: jest.fn(),
    },
  },
}));

describe('NewPlanPage コンポーネント', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: createMockSession('test-user') });
    (api.plans.create as jest.Mock).mockResolvedValue({ data: { id: 'new-plan-id' } });
  });

  it('フォームが正しく表示される', () => {
    render(<NewPlanPage />);

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('日付')).toBeInTheDocument();
    expect(screen.getByLabelText('予算')).toBeInTheDocument();
    expect(screen.getByLabelText('場所URL')).toBeInTheDocument();
    expect(screen.getByLabelText('地域')).toBeInTheDocument();
    expect(screen.getByLabelText('公開する')).toBeInTheDocument();
  });

  it('フォームに入力できる', () => {
    render(<NewPlanPage />);

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'テスト用の説明文' } });
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('場所URL'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.change(screen.getByLabelText('地域'), { target: { value: 'tokyo' } });
    fireEvent.click(screen.getByLabelText('公開する'));

    expect(screen.getByLabelText('タイトル')).toHaveValue('テストプラン');
    expect(screen.getByLabelText('説明')).toHaveValue('テスト用の説明文');
    expect(screen.getByLabelText('日付')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('予算')).toHaveValue(5000);
    expect(screen.getByLabelText('場所URL')).toHaveValue('https://example.com');
    expect(screen.getByLabelText('地域')).toHaveValue('tokyo');
    expect(screen.getByLabelText('公開する')).toBeChecked();
  });

  it('フォーム送信時にAPIが呼ばれる', async () => {
    render(<NewPlanPage />);

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'テスト用の説明文' } });
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('場所URL'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.change(screen.getByLabelText('地域'), { target: { value: 'tokyo' } });
    fireEvent.click(screen.getByLabelText('公開する'));

    fireEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(api.plans.create).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          title: 'テストプラン',
          description: 'テスト用の説明文',
          date: '2024-01-01',
          budget: 5000,
          locations: [{ url: 'https://example.com', name: null }],
          region: 'tokyo',
          isPublic: true,
        })
      );
    });
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    (api.plans.create as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));

    render(<NewPlanPage />);

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(screen.getByText('プランの作成に失敗しました')).toBeInTheDocument();
    });
  });

  it('キャンセルボタンをクリックすると前のページに戻る', () => {
    render(<NewPlanPage />);

    fireEvent.click(screen.getByText('キャンセル'));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('セッションがない場合、フォーム送信時に何も起こらない', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null });

    render(<NewPlanPage />);

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(api.plans.create).not.toHaveBeenCalled();
    });
  });

  it('保存中はボタンが無効化され、テキストが「作成中...」に変わる', async () => {
    render(<NewPlanPage />);

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.click(screen.getByText('作成'));

    expect(screen.getByText('作成中...')).toBeDisabled();
  });
});
