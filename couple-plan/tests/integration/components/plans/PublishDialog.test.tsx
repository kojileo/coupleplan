import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PublishDialog from '@/components/features/plans/PublishDialog';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
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
      publish: jest.fn(),
    },
  },
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

describe('PublishDialogコンポーネント統合テスト', () => {
  // 安全なモックセッションを生成
  const testUserId = 'user-123';
  const mockSession = createMockSession(testUserId);
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (api.plans.get as jest.Mock).mockResolvedValue({ data: mockPlan });
    (api.plans.publish as jest.Mock).mockResolvedValue({ data: { ...mockPlan, isPublic: true } });
    
    // console.error のモック
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('isOpenがfalseの場合は何も表示されない', () => {
    render(
      <PublishDialog
        planId="plan-123"
        isOpen={false}
        onClose={mockOnClose}
      />
    );
    
    // ダイアログが表示されないことを確認
    expect(screen.queryByText('プランの公開設定')).not.toBeInTheDocument();
  });

  it('isOpenがtrueの場合はダイアログが表示される', async () => {
    render(
      <PublishDialog
        planId="plan-123"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    // ダイアログが表示されることを確認
    expect(screen.getByText('プランの公開設定')).toBeInTheDocument();
    
    // プランデータが取得されるまで待機
    await waitFor(() => {
      expect(api.plans.get).toHaveBeenCalledWith(TEST_AUTH.ACCESS_TOKEN, 'plan-123');
    });
    
    // 非公開プランの場合のメッセージが表示されることを確認
    expect(screen.getByText(/このプランを公開しますか？/)).toBeInTheDocument();
    
    // ボタンが表示されることを確認
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('公開する')).toBeInTheDocument();
  });

  it('公開プランの場合は非公開にするメッセージが表示される', async () => {
    // 公開プランのモック
    const publicPlan = { ...mockPlan, isPublic: true };
    (api.plans.get as jest.Mock).mockResolvedValue({ data: publicPlan });
    
    render(
      <PublishDialog
        planId="plan-123"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    // プランデータが取得されるまで待機
    await waitFor(() => {
      expect(screen.getByText(/このプランは現在公開されています/)).toBeInTheDocument();
    });
    
    // 非公開にするボタンが表示されることを確認
    expect(screen.getByText('非公開にする')).toBeInTheDocument();
  });

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    render(
      <PublishDialog
        planId="plan-123"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    // キャンセルボタンをクリック
    fireEvent.click(screen.getByText('キャンセル'));
    
    // onCloseが呼ばれることを確認
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('公開ボタンをクリックするとAPIが呼ばれ、成功するとダイアログが閉じる', async () => {
    render(
      <PublishDialog
        planId="plan-123"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    // プランデータが取得されるまで待機
    await waitFor(() => {
      expect(screen.getByText('公開する')).toBeInTheDocument();
    });
    
    // 公開ボタンをクリック
    fireEvent.click(screen.getByText('公開する'));
    
    // APIが呼ばれることを確認
    await waitFor(() => {
      expect(api.plans.publish).toHaveBeenCalledWith(TEST_AUTH.ACCESS_TOKEN, 'plan-123', true);
    });
    
    // 成功するとonCloseが呼ばれることを確認
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('非公開ボタンをクリックするとAPIが呼ばれ、成功するとダイアログが閉じる', async () => {
    // 公開プランのモック
    const publicPlan = { ...mockPlan, isPublic: true };
    (api.plans.get as jest.Mock).mockResolvedValue({ data: publicPlan });
    
    render(
      <PublishDialog
        planId="plan-123"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    // プランデータが取得されるまで待機
    await waitFor(() => {
      expect(screen.getByText('非公開にする')).toBeInTheDocument();
    });
    
    // 非公開ボタンをクリック
    fireEvent.click(screen.getByText('非公開にする'));
    
    // APIが呼ばれることを確認
    await waitFor(() => {
      expect(api.plans.publish).toHaveBeenCalledWith(TEST_AUTH.ACCESS_TOKEN, 'plan-123', false);
    });
    
    // 成功するとonCloseが呼ばれることを確認
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('プラン取得APIがエラーを返した場合はエラーメッセージが表示される', async () => {
    // APIエラーをモック
    (api.plans.get as jest.Mock).mockRejectedValueOnce(new Error('プランの取得に失敗しました'));
    
    render(
      <PublishDialog
        planId="plan-123"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('プランの取得に失敗しました');
    });
    
    // コンソールエラーが出力されることを確認
    expect(console.error).toHaveBeenCalledWith('プランの取得に失敗しました:', expect.any(Error));
  });
}); 