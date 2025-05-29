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

    it('ナビゲーションヘッダーが正しく表示される', () => {
      render(<Home />);

      // ロゴ
      expect(screen.getByRole('link', { name: '💑 Couple Plan' })).toBeInTheDocument();

      // ナビゲーションリンク - ヘッダーの要素のみを確認
      const aboutLinks = screen.getAllByRole('link', { name: 'サービスについて' });
      expect(aboutLinks[0]).toHaveAttribute('href', '/about');

      const publicPlanLinks = screen.getAllByRole('link', { name: '公開プラン' });
      expect(publicPlanLinks[0]).toHaveAttribute('href', '/plans/public');

      const faqLinks = screen.getAllByRole('link', { name: 'よくある質問' });
      expect(faqLinks[0]).toHaveAttribute('href', '/faq');

      const contactLinks = screen.getAllByRole('link', { name: 'お問い合わせ' });
      expect(contactLinks[0]).toHaveAttribute('href', '/contact');

      // ヘッダーのボタン
      const headerButtons = screen.getAllByRole('link', { name: 'ログイン' });
      const headerButtons2 = screen.getAllByRole('link', { name: '新規登録' });
      expect(headerButtons[0]).toHaveAttribute('href', '/login');
      expect(headerButtons2[0]).toHaveAttribute('href', '/signup');
    });

    it('メインコンテンツが正しく表示される', () => {
      render(<Home />);

      // メインタイトル
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Couple Plan');
      expect(screen.getByText('カップルのためのデートプラン作成・共有アプリ')).toBeInTheDocument();

      // 説明文
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

    it('追加ナビゲーションリンクが表示される', () => {
      render(<Home />);

      const publicPlansLink = screen.getByRole('link', {
        name: '公開されているデートプランを見る →',
      });
      const aboutLink = screen.getByRole('link', {
        name: 'サービスについて詳しく →',
      });
      const faqLink = screen.getByRole('link', {
        name: 'よくある質問を見る →',
      });

      expect(publicPlansLink).toHaveAttribute('href', '/plans/public');
      expect(aboutLink).toHaveAttribute('href', '/about');
      expect(faqLink).toHaveAttribute('href', '/faq');
    });

    it('特徴セクションが表示される', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: 'Couple Planの特徴' })).toBeInTheDocument();

      // 特徴の項目
      expect(screen.getByText('簡単プラン作成')).toBeInTheDocument();
      expect(screen.getByText('予算管理')).toBeInTheDocument();
      expect(screen.getByText('プライバシー保護')).toBeInTheDocument();
      expect(screen.getByText('マルチデバイス対応')).toBeInTheDocument();
    });

    it('利用の流れセクションが表示される', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: '利用の流れ' })).toBeInTheDocument();

      // 各ステップ
      expect(screen.getByText('アカウント作成')).toBeInTheDocument();
      expect(screen.getByText('無料でアカウントを作成')).toBeInTheDocument();

      expect(screen.getByText('プラン作成')).toBeInTheDocument();
      expect(screen.getByText('行きたい場所を追加してデートプランを作成')).toBeInTheDocument();

      expect(screen.getByText('共有・調整')).toBeInTheDocument();
      expect(
        screen.getByText('プランを公開してパートナーと一緒にプランを調整')
      ).toBeInTheDocument();

      expect(screen.getByText('実行・記録')).toBeInTheDocument();
      expect(screen.getByText('デートを楽しみ、プランを記録')).toBeInTheDocument();
    });

    it('拡張されたフッターが正しく表示される', () => {
      render(<Home />);

      // サービスセクション
      const serviceLinks = screen.getAllByRole('link', { name: 'サービスについて' });
      expect(serviceLinks.length).toBeGreaterThan(0);

      // サポートセクション
      expect(screen.getByText('サポート')).toBeInTheDocument();

      // アカウントセクション
      expect(screen.getByText('アカウント')).toBeInTheDocument();

      // コピーライト
      expect(screen.getByText('© 2025 Couple Plan. All rights reserved.')).toBeInTheDocument();

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

    it('適切な見出し構造を持つ', () => {
      render(<Home />);

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });

      expect(h1Elements).toHaveLength(1);
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('全てのリンクが適切なhref属性を持つ', () => {
      render(<Home />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('ローディング状態でのARIAラベルが適切', () => {
      mockUseAuth.mockReturnValue({
        session: null,
        isLoading: true,
        user: null,
        signOut: jest.fn(),
      });

      render(<Home />);

      const spinner = screen.getByRole('status', { name: '読み込み中' });
      expect(spinner).toHaveAttribute('aria-label', '読み込み中');
    });
  });
});
