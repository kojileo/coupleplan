import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LikeButton } from '@/components/features/plans/LikeButton';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// モック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    likes: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('LikeButtonコンポーネント統合テスト', () => {
  const mockSession = {
    user: {
      id: 'user-123',
    },
    access_token: 'test-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
  });

  it('初期状態が正しく表示される（いいねしていない状態）', () => {
    render(
      <LikeButton
        planId="plan-123"
        initialIsLiked={false}
        likeCount={5}
      />
    );
    
    // いいねしていない状態のアイコンが表示されていることを確認
    expect(screen.getByText('🤍')).toBeInTheDocument();
    
    // いいね数が表示されていることを確認
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('初期状態が正しく表示される（いいねしている状態）', () => {
    render(
      <LikeButton
        planId="plan-123"
        initialIsLiked={true}
        likeCount={5}
      />
    );
    
    // いいねしている状態のアイコンが表示されていることを確認
    expect(screen.getByText('❤️')).toBeInTheDocument();
    
    // いいね数が表示されていることを確認
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('いいねボタンをクリックするといいねが追加される', async () => {
    // APIモックの設定
    (api.likes.create as jest.Mock).mockResolvedValue({ data: {} });
    
    render(
      <LikeButton
        planId="plan-123"
        initialIsLiked={false}
        likeCount={5}
      />
    );
    
    // いいねボタンをクリック
    fireEvent.click(screen.getByText('🤍'));
    
    // APIが正しく呼び出されたことを確認
    expect(api.likes.create).toHaveBeenCalledWith('test-token', 'plan-123');
    
    // 状態が更新されたことを確認
    await waitFor(() => {
      expect(screen.getByText('❤️')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });
  });

  it('いいね済みのボタンをクリックするといいねが削除される', async () => {
    // APIモックの設定
    (api.likes.delete as jest.Mock).mockResolvedValue({ data: {} });
    
    render(
      <LikeButton
        planId="plan-123"
        initialIsLiked={true}
        likeCount={5}
      />
    );
    
    // いいねボタンをクリック
    fireEvent.click(screen.getByText('❤️'));
    
    // APIが正しく呼び出されたことを確認
    expect(api.likes.delete).toHaveBeenCalledWith('test-token', 'plan-123');
    
    // 状態が更新されたことを確認
    await waitFor(() => {
      expect(screen.getByText('🤍')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  it('未ログイン状態ではいいねボタンが無効化される', () => {
    // 未ログイン状態のモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    
    render(
      <LikeButton
        planId="plan-123"
        initialIsLiked={false}
        likeCount={5}
      />
    );
    
    // ボタンが無効化されていることを確認
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('API呼び出し中はボタンが無効化される', async () => {
    // APIモックの設定（レスポンスを遅延させる）
    (api.likes.create as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );
    
    render(
      <LikeButton
        planId="plan-123"
        initialIsLiked={false}
        likeCount={5}
      />
    );
    
    // いいねボタンをクリック
    fireEvent.click(screen.getByText('🤍'));
    
    // ボタンが無効化されていることを確認
    expect(screen.getByRole('button')).toBeDisabled();
    
    // APIレスポンス後にボタンが有効化されることを確認
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('APIエラー時にコンソールエラーが出力される', async () => {
    // コンソールエラーのモック
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // APIモックの設定（エラーを返す）
    (api.likes.create as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(
      <LikeButton
        planId="plan-123"
        initialIsLiked={false}
        likeCount={5}
      />
    );
    
    // いいねボタンをクリック
    fireEvent.click(screen.getByText('🤍'));
    
    // エラーが出力されることを確認
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'いいねの操作に失敗しました:',
        expect.any(Error)
      );
    });
    
    // モックを元に戻す
    console.error = originalConsoleError;
  });
}); 