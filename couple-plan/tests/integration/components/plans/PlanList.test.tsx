import { render, screen, waitFor } from '@testing-library/react';
import PlanList from '@/components/features/plans/PlanList';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';
import { TEST_USER, createMockSession } from '@tests/utils/test-constants';

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
    userId: 'user-456',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      name: '別のユーザー',
    },
    likes: [],
    _count: {
      likes: 0,
    },
  },
];

describe('PlanListコンポーネント統合テスト', () => {
  // 共通のテストユーザーIDを使用
  const testUserId = 'user-123';
  // 安全なモックセッションを生成
  const mockSession = createMockSession(testUserId);

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
  });

  it('ローディング中はスケルトンが表示される', () => {
    // APIレスポンスを遅延させる
    (api.plans.list as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: mockPlans }), 100))
    );
    
    render(<PlanList />);
    
    // ローディングスケルトンが表示されていることを確認
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('プラン一覧が正しく表示される', async () => {
    // APIモックの設定
    (api.plans.list as jest.Mock).mockResolvedValue({ data: mockPlans });
    
    render(<PlanList />);
    
    // プラン一覧が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    });
    
    // 各プランの情報が表示されていることを確認
    expect(screen.getByText('テストプラン1')).toBeInTheDocument();
    expect(screen.getByText('テスト用のプラン説明1')).toBeInTheDocument();
    expect(screen.getByText('💰 5,000円')).toBeInTheDocument();
    
    expect(screen.getByText('テストプラン2')).toBeInTheDocument();
    expect(screen.getByText('テスト用のプラン説明2')).toBeInTheDocument();
    expect(screen.getByText('💰 10,000円')).toBeInTheDocument();
    
    // 公開プランのラベルが表示されていることを確認（ユーザーIDが異なるプランのみ）
    expect(screen.getByText('公開プラン')).toBeInTheDocument();
  });

  it('プランが存在しない場合は適切なメッセージが表示される', async () => {
    // APIモックの設定（空の配列を返す）
    (api.plans.list as jest.Mock).mockResolvedValue({ data: [] });
    
    render(<PlanList />);
    
    // メッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('まだプランがありません')).toBeInTheDocument();
    });
    
    // 新規作成リンクが表示されていることを確認
    expect(screen.getByText('新しいプランを作成する')).toBeInTheDocument();
  });

  it('APIエラー時にコンソールエラーが出力される', async () => {
    // コンソールエラーのモック
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // APIモックの設定（エラーを返す）
    (api.plans.list as jest.Mock).mockResolvedValue({ error: 'APIエラー' });
    
    render(<PlanList />);
    
    // エラーが出力されることを確認
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'マイプラン一覧の取得に失敗:',
        expect.any(Error)
      );
    });
    
    // モックを元に戻す
    console.error = originalConsoleError;
  });

  it('未ログイン状態では空の状態が表示される', async () => {
    // 未ログイン状態のモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    
    render(<PlanList />);
    
    // メッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('まだプランがありません')).toBeInTheDocument();
    });
    
    // APIが呼び出されていないことを確認
    expect(api.plans.list).not.toHaveBeenCalled();
  });
}); 