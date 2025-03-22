import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlanDetailPage from '@/app/(dashboard)/plans/[id]/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { Plan } from '@/types/plan';
import { createMockSession, TEST_AUTH } from '@tests/utils/test-constants';

// モック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      get: jest.fn(),
      delete: jest.fn(),
      publish: jest.fn(),
    },
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// テスト用のモックデータ
const mockPlan: Plan = {
  id: 'plan-123',
  title: 'テストプラン',
  description: 'テスト用のプラン説明',
  date: new Date('2024-01-01T18:00:00'),
  budget: 5000,
  location: 'https://example.com/location',
  isPublic: false,
  userId: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  profile: {
    name: 'テストユーザー',
  },
  likes: [],
  _count: {
    likes: 0,
  },
};

describe('プラン詳細ページ統合テスト', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  // 安全なモックセッションを生成
  const testUserId = 'user-123';
  const mockSession = createMockSession(testUserId);

  // params のモック
  const mockParams = {
    params: Promise.resolve({ id: 'plan-123' }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (api.plans.get as jest.Mock).mockResolvedValue({ data: mockPlan });
    
    // window.confirm のモック
    window.confirm = jest.fn().mockImplementation(() => true);
    
    // console.error のモック
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ローディング中はローディングインジケータが表示される', async () => {
    // APIレスポンスを遅延させてローディング状態を作る
    jest.spyOn(api.plans, 'get').mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ data: mockPlan }), 100))
    );
    
    render(<PlanDetailPage {...mockParams} />);
    
    // ローディングインジケータが表示されていることを確認
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('プラン詳細が正しく表示される', async () => {
    render(<PlanDetailPage {...mockParams} />);
    
    // プラン詳細が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('テストプラン')).toBeInTheDocument();
    });
    
    // 各情報が表示されていることを確認
    expect(screen.getByText('テスト用のプラン説明')).toBeInTheDocument();
    expect(screen.getByText('¥5,000')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    
    // 作成者の場合は編集・削除ボタンが表示される
    expect(screen.getByText('編集')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
    expect(screen.getByText('公開設定')).toBeInTheDocument();
  });

  it('他のユーザーのプランの場合は編集・削除ボタンが表示されない', async () => {
    // 別のユーザーのセッションをモック
    const otherUserId = 'other-user';
    const otherUserSession = createMockSession(otherUserId);
    
    (useAuth as jest.Mock).mockReturnValue({
      session: otherUserSession
    });
    
    render(<PlanDetailPage {...mockParams} />);
    
    // プラン詳細が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('テストプラン')).toBeInTheDocument();
    });
    
    // 編集・削除ボタンが表示されないことを確認
    expect(screen.queryByText('編集')).not.toBeInTheDocument();
    expect(screen.queryByText('削除')).not.toBeInTheDocument();
    expect(screen.queryByText('公開設定')).not.toBeInTheDocument();
  });

  it('編集ボタンをクリックすると編集ページに遷移する', async () => {
    render(<PlanDetailPage {...mockParams} />);
    
    // プラン詳細が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('編集')).toBeInTheDocument();
    });
    
    // 編集ボタンをクリック
    fireEvent.click(screen.getByText('編集'));
    
    // ルーターのpushメソッドが正しく呼び出されたことを確認
    expect(mockRouter.push).toHaveBeenCalledWith('/plans/plan-123/edit');
  });

  it('削除ボタンをクリックするとプランが削除される', async () => {
    // 削除APIのモック
    (api.plans.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
    
    render(<PlanDetailPage {...mockParams} />);
    
    // プラン詳細が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
    
    // 削除ボタンをクリック
    fireEvent.click(screen.getByText('削除'));
    
    // 確認ダイアログが表示されることを確認
    expect(window.confirm).toHaveBeenCalledWith('このプランを削除してもよろしいですか？');
    
    // 削除APIが呼び出されることを確認
    await waitFor(() => {
      expect(api.plans.delete).toHaveBeenCalledWith(TEST_AUTH.ACCESS_TOKEN, 'plan-123');
    });
    
    // 削除後にプラン一覧ページに遷移することを確認
    expect(mockRouter.push).toHaveBeenCalledWith('/plans');
  });

  it('削除確認をキャンセルするとプランは削除されない', async () => {
    // 確認ダイアログでキャンセルを選択
    (window.confirm as jest.Mock).mockReturnValue(false);
    
    render(<PlanDetailPage {...mockParams} />);
    
    // プラン詳細が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
    
    // 削除ボタンをクリック
    fireEvent.click(screen.getByText('削除'));
    
    // 確認ダイアログが表示されることを確認
    expect(window.confirm).toHaveBeenCalledWith('このプランを削除してもよろしいですか？');
    
    // 削除APIが呼び出されないことを確認
    expect(api.plans.delete).not.toHaveBeenCalled();
    
    // ページ遷移が発生しないことを確認
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('削除APIがエラーを返した場合はエラーメッセージが表示される', async () => {
    // 削除APIのモック（エラーを返す）
    (api.plans.delete as jest.Mock).mockResolvedValue({ error: '削除エラー' });
    
    // window.alert のモック
    window.alert = jest.fn();
    
    render(<PlanDetailPage {...mockParams} />);
    
    // プラン詳細が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
    
    // 削除ボタンをクリック
    fireEvent.click(screen.getByText('削除'));
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('プランの削除に失敗しました');
    });
    
    // コンソールエラーが出力されることを確認
    expect(console.error).toHaveBeenCalledWith('プランの削除に失敗しました:', expect.any(Error));
    
    // ページ遷移が発生しないことを確認
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('プランが存在しない場合は空の要素が表示される', async () => {
    // プランが存在しないケースをモック
    (api.plans.get as jest.Mock).mockResolvedValue({ data: null });
    
    render(<PlanDetailPage {...mockParams} />);
    
    // 空の要素が表示されるまで待機
    await waitFor(() => {
      expect(document.querySelector('div')).toBeInTheDocument();
    });
    
    // プランのタイトルが表示されないことを確認
    expect(screen.queryByText('テストプラン')).not.toBeInTheDocument();
  });

  it('APIエラー時にはプラン一覧ページにリダイレクトされる', async () => {
    // APIエラーをモック
    (api.plans.get as jest.Mock).mockResolvedValue({ error: 'APIエラー' });
    
    render(<PlanDetailPage {...mockParams} />);
    
    // エラーが発生してリダイレクトされることを確認
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('プランの取得に失敗しました:', expect.any(Error));
      expect(mockRouter.push).toHaveBeenCalledWith('/plans');
    });
  });
}); 