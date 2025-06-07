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

// 緊急ヘルプコンポーネントをモック
jest.mock('@/components/features/emergency/EmergencyButton', () => ({
  EmergencyButton: () => <div data-testid="emergency-button">Emergency Help Button</div>,
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

    it('新機能アナウンスが表示される', () => {
      render(<Home />);

      expect(screen.getByText('🎉 NEW FEATURE - デート中の困ったを瞬間解決！')).toBeInTheDocument();
    });

    it('メインコンテンツが正しく表示される', () => {
      render(<Home />);

      // メインタイトル
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Couple Plan');
      expect(screen.getByText('カップルのためのデートプラン作成・共有アプリ')).toBeInTheDocument();

      // 説明文
      expect(
        screen.getByText(/行きたい場所を保存して、カップルで予定を共有。/)
      ).toBeInTheDocument();
      expect(screen.getByText(/デート中の困ったも瞬間解決！/)).toBeInTheDocument();
    });

    it('緊急ヘルプ機能ハイライトセクションが表示される', () => {
      render(<Home />);

      // セクションヘッダー
      expect(screen.getByText('🆘 デート中の「困った」を瞬間解決')).toBeInTheDocument();
      expect(
        screen.getByText(
          /お手洗い探しや会話の沈黙に困ったら即座に解決！デート中の緊急事態をサポートする機能で、せっかくのデート時間をより楽しく過ごせます。/
        )
      ).toBeInTheDocument();

      // お手洗い検索機能
      expect(screen.getByText('お手洗い検索')).toBeInTheDocument();
      expect(screen.getByText(/デート中の急なお手洗い探しに！/)).toBeInTheDocument();
      expect(screen.getByText('距離順表示')).toBeInTheDocument();
      expect(screen.getByText('無料・有料表示')).toBeInTheDocument();
      expect(screen.getByText('車椅子対応情報')).toBeInTheDocument();
      expect(screen.getByText('Googleマップ連携')).toBeInTheDocument();

      // 会話ネタ提供機能
      expect(screen.getByText('会話ネタ提供')).toBeInTheDocument();
      expect(screen.getByText(/会話が途切れた時の救世主！/)).toBeInTheDocument();
      expect(screen.getByText('カテゴリ別選択')).toBeInTheDocument();
      expect(screen.getByText('関係性を深める質問')).toBeInTheDocument();
      expect(screen.getByText('盛り上がる話題')).toBeInTheDocument();
      expect(screen.getByText('使い方のコツ付き')).toBeInTheDocument();

      // 体験案内
      const emergencyEmojis = screen.getAllByText('🆘');
      expect(emergencyEmojis.length).toBeGreaterThan(0);
      expect(screen.getByText('右下のボタンから今すぐ体験！')).toBeInTheDocument();
    });

    it('主要機能セクションが更新されている', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: '主要機能' })).toBeInTheDocument();

      // 緊急ヘルプ機能が追加されている
      expect(screen.getByText('緊急ヘルプ')).toBeInTheDocument();
      expect(screen.getByText('デート中の困った瞬間を瞬時に解決')).toBeInTheDocument();

      // 既存機能（複数の「プラン作成」要素から最初の一つを取得）
      const planCreationElements = screen.getAllByText('プラン作成');
      expect(planCreationElements.length).toBeGreaterThan(0);
      expect(screen.getByText('直感的な操作でデートプランを簡単作成')).toBeInTheDocument();

      expect(screen.getByText('予算管理')).toBeInTheDocument();
      expect(screen.getByText('デートの予算を自動計算し管理')).toBeInTheDocument();

      expect(screen.getByText('マルチデバイス')).toBeInTheDocument();
      expect(screen.getByText('どのデバイスからでもアクセス可能')).toBeInTheDocument();
    });

    it('利用の流れが更新されている', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: '利用の流れ' })).toBeInTheDocument();

      // 各ステップ
      expect(screen.getByText('アカウント作成')).toBeInTheDocument();
      expect(screen.getByText('無料でアカウントを作成')).toBeInTheDocument();

      // 複数の「プラン作成」要素から2番目の要素を確認
      const planCreationElements = screen.getAllByText('プラン作成');
      expect(planCreationElements.length).toBeGreaterThan(1);
      expect(screen.getByText('行きたい場所を追加してデートプラン作成')).toBeInTheDocument();

      expect(screen.getByText('デート実行')).toBeInTheDocument();
      expect(screen.getByText('緊急ヘルプ機能でサポートを受けながら実行')).toBeInTheDocument();

      expect(screen.getByText('共有・記録')).toBeInTheDocument();
      expect(screen.getByText('思い出を記録し、他カップルと共有')).toBeInTheDocument();
    });

    it('緊急ヘルプボタンが表示される', () => {
      render(<Home />);

      // 緊急ヘルプボタンコンポーネントが表示される
      expect(screen.getByTestId('emergency-button')).toBeInTheDocument();
    });

    it('CTAセクションが更新されている', () => {
      render(<Home />);

      expect(screen.getByText('もう困ることはありません！')).toBeInTheDocument();
      expect(
        screen.getByText('デートプランの作成から実行まで、あなたの恋愛をトータルサポート。')
      ).toBeInTheDocument();
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
      expect(screen.getByText('Google AdSenseによる広告を配信しています')).toBeInTheDocument();
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
          access_token: TEST_TOKEN,
          refresh_token: TEST_REFRESH_TOKEN,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        },
        isLoading: false,
        user: mockUser,
        signOut: jest.fn(),
      });
    });

    it('ログイン済みユーザーは自動的にプランページにリダイレクトされる', () => {
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

      // ローディングスピナーが表示される
      expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument();

      // メインコンテンツが表示されていないことを確認
      expect(screen.queryByRole('main')).not.toBeInTheDocument();
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
