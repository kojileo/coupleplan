import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyPlansPage from '@/app/(dashboard)/plans/page';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { Plan } from '@/types/plan';

// モック
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

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// テスト用のモックデータ
const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    title: 'テストプラン1',
    description: 'テスト用のプラン説明1',
    date: new Date('2024-01-01T18:00:00'),
    budget: 5000,
    location: 'https://example.com/location1',
    isPublic: true,
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      name: 'テストユーザー',
    },
    likes: [],
    _count: {
      likes: 0,
    },
  },
  {
    id: 'plan-2',
    title: 'テストプラン2',
    description: 'テスト用のプラン説明2',
    date: new Date('2024-01-02T18:00:00'),
    budget: 10000,
    location: 'https://example.com/location2',
    isPublic: false,
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      name: 'テストユーザー',
    },
    likes: [],
    _count: {
      likes: 0,
    },
  },
];

describe('マイプラン一覧ページ統合テスト', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockSession = {
    user: {
      id: 'user-123',
    },
    access_token: 'test-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
  });

  it('ローディング中はローディングインジケータが表示される', () => {
    // APIレスポンスを遅延させる
    (api.plans.list as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: mockPlans }), 100))
    );
    
    render(<MyPlansPage />);
    
    // ローディングインジケータが表示されていることを確認
    // クラス名で要素を検索
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('プラン一覧が正しく表示される', async () => {
    // APIモックの設定
    (api.plans.list as jest.Mock).mockResolvedValue({ data: mockPlans });
    
    render(<MyPlansPage />);
    
    // プラン一覧が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });
    
    // 各プランの情報が表示されていることを確認
    expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    expect(screen.getByText('テストプラン2')).toBeInTheDocument();
    
    // ヘッダーの新規作成ボタンが表示されていることを確認
    expect(screen.getByTestId('header-create-button')).toBeInTheDocument();
  });

  it('プランが存在しない場合は適切なメッセージが表示される', async () => {
    // APIモックの設定（空の配列を返す）
    (api.plans.list as jest.Mock).mockResolvedValue({ data: [] });
    
    render(<MyPlansPage />);
    
    // メッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('プランがまだありません')).toBeInTheDocument();
    });
    
    // 空の状態の新規作成ボタンが表示されていることを確認
    expect(screen.getByTestId('empty-create-button')).toBeInTheDocument();
  });

  it('新規作成ボタンをクリックすると新規作成ページに遷移する', async () => {
    // APIモックの設定
    (api.plans.list as jest.Mock).mockResolvedValue({ data: mockPlans });
    
    render(<MyPlansPage />);
    
    // ボタンが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByTestId('header-create-button')).toBeInTheDocument();
    });
    
    // 新規作成ボタンをクリック
    fireEvent.click(screen.getByTestId('header-create-button'));
    
    // ルーターのpushメソッドが正しく呼び出されたことを確認
    expect(mockRouter.push).toHaveBeenCalledWith('/plans/new');
  });

  it('空の状態で新規作成ボタンをクリックすると新規作成ページに遷移する', async () => {
    // APIモックの設定（空の配列を返す）
    (api.plans.list as jest.Mock).mockResolvedValue({ data: [] });
    
    render(<MyPlansPage />);
    
    // ボタンが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByTestId('empty-create-button')).toBeInTheDocument();
    });
    
    // 新規作成ボタンをクリック
    fireEvent.click(screen.getByTestId('empty-create-button'));
    
    // ルーターのpushメソッドが正しく呼び出されたことを確認
    expect(mockRouter.push).toHaveBeenCalledWith('/plans/new');
  });

  it('APIエラー時にコンソールエラーが出力される', async () => {
    // コンソールエラーのモック
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // APIモックの設定（エラーを返す）
    (api.plans.list as jest.Mock).mockResolvedValue({ error: 'APIエラー' });
    
    render(<MyPlansPage />);
    
    // エラーが出力されることを確認
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'プランの取得に失敗しました:',
        expect.any(Error)
      );
    });
    
    // モックを元に戻す
    console.error = originalConsoleError;
  });
}); 