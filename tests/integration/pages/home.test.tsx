import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Home from '@/app/page';

// Next.js router をモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// AuthContext をモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  describe('ユーザーが未ログイン状態の場合', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        session: null,
        isLoading: false,
        user: null,
        signOut: jest.fn(),
      });
    });

    it('メインコンテンツが正しく表示される', () => {
      render(<Home />);

      // メインタイトル
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Couple Plan');
      expect(screen.getByText('カップルのためのデートプラン作成・共有アプリ')).toBeInTheDocument();

      // 説明文（複数要素に分割されているため部分マッチで検証）
      expect(
        screen.getByText(/行きたい場所を保存して、カップルで予定を共有しよう！/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/共有されているデートプランにいいねをして、参考にしよう！/)
      ).toBeInTheDocument();
    });

    it('3つの機能紹介カードが表示される', () => {
      render(<Home />);

      // 機能カード
      expect(screen.getByText('カップルでデートプランを管理')).toBeInTheDocument();
      expect(screen.getByText('一緒にプランを作成・共有')).toBeInTheDocument();

      expect(screen.getByText('行きたい場所管理')).toBeInTheDocument();
      expect(screen.getByText('気になるスポットを保存')).toBeInTheDocument();

      expect(screen.getByText('公開されているデートプランを参考')).toBeInTheDocument();
      expect(screen.getByText('デートプランにいいねをしよう！')).toBeInTheDocument();
    });

    it('ログイン・新規登録ボタンが表示される', () => {
      render(<Home />);

      const loginLink = screen.getByRole('link', { name: 'ログイン' });
      const signupLink = screen.getByRole('link', { name: '新規登録' });

      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');

      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('公開プラン閲覧リンクが表示される', () => {
      render(<Home />);

      const publicPlansLink = screen.getByRole('link', {
        name: '公開されているデートプランを見る →',
      });

      expect(publicPlansLink).toBeInTheDocument();
      expect(publicPlansLink).toHaveAttribute('href', '/plans/public');
    });

    it('フッターが正しく表示される', () => {
      render(<Home />);

      // コピーライト
      expect(screen.getByText('© 2025 Couple Plan. All rights reserved.')).toBeInTheDocument();

      // フッターリンク
      const privacyLink = screen.getByRole('link', { name: 'プライバシーポリシー' });
      const contactLink = screen.getByRole('link', { name: 'お問い合わせ' });

      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy');

      expect(contactLink).toBeInTheDocument();
      expect(contactLink).toHaveAttribute('href', '/contact');

      // AdSense関連の注記
      expect(
        screen.getByText(
          '本サービスでは、サービス向上のためにGoogle AdSenseによる広告を配信しています'
        )
      ).toBeInTheDocument();
    });

    it('ページが読み込み完了状態で表示される', () => {
      render(<Home />);

      // ローディングスピナーが表示されていないことを確認
      expect(screen.queryByRole('status', { name: '読み込み中' })).not.toBeInTheDocument();

      // メインコンテンツが表示されていることを確認
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('ユーザーがログイン済みの場合', () => {
    beforeEach(() => {
      const TEST_TOKEN = 'test-token-' + Date.now();
      const TEST_REFRESH_TOKEN = 'test-refresh-token-' + Date.now();

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2025-01-01T00:00:00.000Z',
      };

      mockUseAuth.mockReturnValue({
        session: {
          user: mockUser,
          access_token: process.env.TEST_ACCESS_TOKEN || TEST_TOKEN,
          refresh_token: process.env.TEST_REFRESH_TOKEN || TEST_REFRESH_TOKEN,
          expires_in: 3600,
          token_type: 'bearer',
        } as any,
        isLoading: false,
        user: mockUser,
        signOut: jest.fn(),
      });
    });

    it('プランページにリダイレクトする', () => {
      render(<Home />);

      expect(mockPush).toHaveBeenCalledWith('/plans');
    });
  });

  describe('ローディング状態の場合', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        session: null,
        isLoading: true,
        user: null,
        signOut: jest.fn(),
      });
    });

    it('ローディングスピナーが表示される', () => {
      render(<Home />);

      expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument();
      expect(screen.queryByRole('main')).not.toBeInTheDocument();
    });

    it('ローディングスピナーのアニメーション要素が存在する', () => {
      render(<Home />);

      const spinner = screen.getByRole('status', { name: '読み込み中' });
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'border-t-2',
        'border-b-2',
        'border-rose-500'
      );
    });
  });

  describe('アクセシビリティ', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        session: null,
        isLoading: false,
        user: null,
        signOut: jest.fn(),
      });
    });

    it('見出し構造が適切である', () => {
      render(<Home />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h3s).toHaveLength(3); // 3つの機能紹介カード
    });

    it('全てのリンクにアクセス可能なテキストがある', () => {
      render(<Home />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });

    it('ローディング状態にaria-labelが設定されている', () => {
      mockUseAuth.mockReturnValue({
        session: null,
        isLoading: true,
        user: null,
        signOut: jest.fn(),
      });

      render(<Home />);

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-label', '読み込み中');
    });
  });

  describe('レスポンシブ対応', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        session: null,
        isLoading: false,
        user: null,
        signOut: jest.fn(),
      });
    });

    it('グリッドレイアウトのクラスが設定されている', () => {
      render(<Home />);

      // 機能紹介カードのグリッド
      const gridContainer = screen.getByText('カップルでデートプランを管理').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-3');

      // フッターのレスポンシブレイアウト
      const footerContainer = screen
        .getByText('© 2025 Couple Plan. All rights reserved.')
        .closest('.flex');
      expect(footerContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });
});
