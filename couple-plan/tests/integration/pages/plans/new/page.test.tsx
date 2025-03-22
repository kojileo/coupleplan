import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewPlanPage from '@/app/(dashboard)/plans/new/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { createMockSession, TEST_AUTH } from '@tests/utils/test-constants';

// モック
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

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('プラン作成ページ統合テスト', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };
  
  // 安全なモックセッションを生成
  const testUserId = 'user-123';
  const mockSession = createMockSession(testUserId);

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (api.plans.create as jest.Mock).mockResolvedValue({ data: { id: 'new-plan-id' } });
    
    // window.alert のモック
    window.alert = jest.fn();
    
    // console.error のモック
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('フォームが正しく表示される', () => {
    render(<NewPlanPage />);
    
    // ヘッダーが表示されることを確認
    expect(screen.getByText('新規プラン作成')).toBeInTheDocument();
    
    // 各フォーム要素が表示されることを確認
    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('日付')).toBeInTheDocument();
    expect(screen.getByLabelText('予算')).toBeInTheDocument();
    expect(screen.getByLabelText('場所URL')).toBeInTheDocument();
    
    // ボタンが表示されることを確認
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
  });

  it('フォームに入力できる', () => {
    render(<NewPlanPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'テスト用の説明文' } });
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('場所URL'), { target: { value: 'https://example.com' } });
    
    // 入力値が反映されていることを確認
    expect(screen.getByLabelText('タイトル')).toHaveValue('テストプラン');
    expect(screen.getByLabelText('説明')).toHaveValue('テスト用の説明文');
    expect(screen.getByLabelText('日付')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('予算')).toHaveValue(5000);
    expect(screen.getByLabelText('場所URL')).toHaveValue('https://example.com');
  });

  it('フォーム送信時にAPIが呼ばれる', async () => {
    render(<NewPlanPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'テスト用の説明文' } });
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('場所URL'), { target: { value: 'https://example.com' } });
    
    // フォームを送信
    fireEvent.click(screen.getByText('作成'));
    
    // APIが呼ばれることを確認
    await waitFor(() => {
      expect(api.plans.create).toHaveBeenCalledWith(TEST_AUTH.ACCESS_TOKEN, {
        title: 'テストプラン',
        description: 'テスト用の説明文',
        date: expect.any(Date),
        budget: 5000,
        location: 'https://example.com',
        isPublic: false,
      });
    });
    
    // 成功時にプラン一覧ページに遷移することを確認
    expect(mockRouter.push).toHaveBeenCalledWith('/plans');
  });

  it('必須フィールドが空の場合はフォーム送信できない', () => {
    render(<NewPlanPage />);
    
    // タイトルを空にする
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '' } });
    
    // 予算を入力
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
    
    // フォームを送信
    const submitButton = screen.getByText('作成');
    fireEvent.click(submitButton);
    
    // APIが呼ばれないことを確認
    expect(api.plans.create).not.toHaveBeenCalled();
  });

  it('送信中は作成ボタンが無効化される', async () => {
    // APIレスポンスを遅延させる
    (api.plans.create as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: { id: 'new-plan-id' } }), 100))
    );
    
    render(<NewPlanPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
    
    // フォームを送信
    fireEvent.click(screen.getByText('作成'));
    
    // ボタンのテキストが変わることを確認
    expect(screen.getByText('作成中...')).toBeInTheDocument();
    
    // ボタンが無効化されていることを確認
    expect(screen.getByText('作成中...')).toBeDisabled();
    
    // APIレスポンス後にページ遷移することを確認
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/plans');
    });
  });

  it('APIがエラーを返した場合はエラーメッセージが表示される', async () => {
    // APIエラーをモック
    (api.plans.create as jest.Mock).mockResolvedValue({ error: 'プランの作成に失敗しました' });
    
    render(<NewPlanPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
    
    // フォームを送信
    fireEvent.click(screen.getByText('作成'));
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('プランの作成に失敗しました');
    });
    
    // コンソールエラーが出力されることを確認
    expect(console.error).toHaveBeenCalledWith('プランの作成に失敗しました:', expect.any(Error));
    
    // ページ遷移が発生しないことを確認
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('キャンセルボタンをクリックすると前のページに戻る', () => {
    render(<NewPlanPage />);
    
    // キャンセルボタンをクリック
    fireEvent.click(screen.getByText('キャンセル'));
    
    // 前のページに戻ることを確認
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('未ログイン状態ではフォーム送信できない', async () => {
    // 未ログイン状態のモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    
    render(<NewPlanPage />);
    
    // 各フィールドに入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'テストプラン' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '5000' } });
    
    // フォームを送信
    fireEvent.click(screen.getByText('作成'));
    
    // APIが呼ばれないことを確認
    await waitFor(() => {
      expect(api.plans.create).not.toHaveBeenCalled();
    });
  });
}); 