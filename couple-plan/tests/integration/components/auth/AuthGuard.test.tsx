import { render, screen } from '@testing-library/react';
import AuthGuard from '@/components/features/auth/AuthGuard';
import { useRequireAuth } from '@/hooks/useRequireAuth';

// モック
jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

describe('AuthGuardコンポーネント統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング中はローディングインジケータが表示される', () => {
    // ローディング中のモック
    (useRequireAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    });
    
    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );
    
    // ローディングインジケータが表示されていることを確認
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // 子コンポーネントが表示されていないことを確認
    expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
  });

  it('認証済みの場合は子コンポーネントが表示される', () => {
    // 認証済みのモック
    (useRequireAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      isLoading: false,
    });
    
    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );
    
    // 子コンポーネントが表示されていることを確認
    expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
    
    // ローディングインジケータが表示されていないことを確認
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
}); 