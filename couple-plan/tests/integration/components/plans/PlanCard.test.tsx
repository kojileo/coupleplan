import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { PlanCard } from '@/components/features/plans/PlanCard';
import { useAuth } from '@/contexts/AuthContext';
import type { Plan } from '@/types/plan';
import { createMockSession } from '@tests/utils/test-constants';

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
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
  createdAt: new Date(),
  updatedAt: new Date(),
  profile: {
    name: 'テストユーザー',
  },
  likes: [],
  _count: {
    likes: 0,
  },
};

describe('PlanCardコンポーネント統合テスト', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  // 安全なモックセッションを生成
  const testUserId = 'user-123';
  const mockSession = createMockSession(testUserId);

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
  });

  it('プランの詳細が正しく表示される', () => {
    render(<PlanCard plan={mockPlan} />);
    
    // タイトルが表示されていることを確認
    expect(screen.getByText('テストプラン')).toBeInTheDocument();
    
    // 説明が表示されていることを確認
    expect(screen.getByText('テスト用のプラン説明')).toBeInTheDocument();
    
    // 日時が表示されていることを確認
    expect(screen.getByText(/日時：/)).toBeInTheDocument();
    expect(screen.getByText(/2024年1月1日 18:00/)).toBeInTheDocument();
    
    // 予算が表示されていることを確認
    expect(screen.getByText(/予算：/)).toBeInTheDocument();
    expect(screen.getByText(/5,000円/)).toBeInTheDocument();
    
    // 場所のURLが表示されていることを確認
    expect(screen.getByText('example.com')).toBeInTheDocument();
    
    // 作成者が表示されていることを確認
    expect(screen.getByText(/作成者: テストユーザー/)).toBeInTheDocument();
  });

  it('カードをクリックするとプラン詳細ページに遷移する', () => {
    render(<PlanCard plan={mockPlan} />);
    
    // カードをクリック
    fireEvent.click(screen.getByRole('article'));
    
    // ルーターのpushメソッドが正しく呼び出されたことを確認
    expect(mockRouter.push).toHaveBeenCalledWith('/plans/plan-123');
  });

  it('公開/非公開ボタンが表示され、クリックするとコールバックが呼ばれる', async () => {
    const mockPublishToggle = jest.fn().mockResolvedValue(undefined);
    
    render(
      <PlanCard 
        plan={mockPlan} 
        onPublishToggle={mockPublishToggle}
      />
    );
    
    // 非公開ボタンが表示されていることを確認
    const publishButton = screen.getByText('非公開');
    expect(publishButton).toBeInTheDocument();
    
    // ボタンをクリック
    fireEvent.click(publishButton);
    
    // コールバックが正しく呼び出されたことを確認
    expect(mockPublishToggle).toHaveBeenCalledWith('plan-123', true);
  });

  it('公開中のプランには公開中ボタンが表示される', () => {
    const publicPlan = { ...mockPlan, isPublic: true };
    const mockPublishToggle = jest.fn().mockResolvedValue(undefined);
    
    render(
      <PlanCard 
        plan={publicPlan} 
        onPublishToggle={mockPublishToggle}
      />
    );
    
    // 公開中ボタンが表示されていることを確認
    expect(screen.getByText('公開中')).toBeInTheDocument();
  });

  it('isPublicがtrueの場合は公開/非公開ボタンが表示されない', () => {
    render(
      <PlanCard 
        plan={mockPlan} 
        isPublic={true}
      />
    );
    
    // 非公開ボタンが表示されていないことを確認
    expect(screen.queryByText('非公開')).not.toBeInTheDocument();
    expect(screen.queryByText('公開中')).not.toBeInTheDocument();
  });
}); 