import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';

import Home from '@/app/page';
import { useAuth } from '@/contexts/AuthContext';

// Mockをモジュールレベルで設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/contexts/AuthContext');
jest.mock('@/components/features/emergency/EmergencyButton', () => ({
  EmergencyButton: () => <div data-testid="emergency-button">Emergency Button</div>,
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

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

describe('Home Page', () => {
  describe('ユーザーが未ログイン状態の場合', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        session: null,
        isLoading: false,
        user: null,
        signOut: jest.fn(),
      });
    });

    it('ページタイトルと基本要素が正しく表示される', () => {
      render(<Home />);

      // ナビゲーション内のCoupl Planロゴテキストを検索
      const navCoupleText = screen.getAllByText('Couple Plan');
      expect(navCoupleText.length).toBeGreaterThan(0);

      // バッジテキストも存在することを確認
      const supportText = screen.getAllByText(/カップルのための究極のデートサポートアプリ/);
      expect(supportText.length).toBeGreaterThan(0);

      // ナビゲーション
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('ナビゲーションメニューが正しく表示される', () => {
      render(<Home />);

      // 複数存在する場合は最初の要素を確認（ヘッダー内）
      const serviceLinks = screen.getAllByRole('link', { name: 'サービスについて' });
      expect(serviceLinks[0]).toBeInTheDocument();
      expect(serviceLinks[0]).toHaveAttribute('href', '/about');

      const publicPlanLinks = screen.getAllByRole('link', { name: '公開プラン' });
      expect(publicPlanLinks[0]).toBeInTheDocument();

      const faqLinks = screen.getAllByRole('link', { name: 'よくある質問' });
      expect(faqLinks[0]).toBeInTheDocument();

      const contactLinks = screen.getAllByRole('link', { name: 'お問い合わせ' });
      expect(contactLinks[0]).toBeInTheDocument();

      // 認証ボタン - 複数存在する場合はhrefで識別
      const loginLinks = screen.getAllByRole('link', { name: 'ログイン' });
      const headerLoginLink = loginLinks.find((link) => link.getAttribute('href') === '/login');
      expect(headerLoginLink).toBeInTheDocument();

      const signupLinks = screen.getAllByRole('link', { name: '新規登録' });
      const headerSignupLink = signupLinks.find((link) => link.getAttribute('href') === '/signup');
      expect(headerSignupLink).toBeInTheDocument();
    });

    it('ヒーローセクションが正しく表示される', () => {
      render(<Home />);

      // バッジ - 複数存在するので最初の要素を使用
      const badgeTexts = screen.getAllByText(/カップルのための究極のデートサポートアプリ/);
      expect(badgeTexts.length).toBeGreaterThan(0);

      // メインタイトル
      expect(screen.getByText('デート前・中・後の全てをサポート')).toBeInTheDocument();

      // 説明文
      expect(
        screen.getByText('行きたい場所を保存して、カップルで予定を共有。')
      ).toBeInTheDocument();
      expect(screen.getByText(/デート中の困ったも瞬間解決！/)).toBeInTheDocument();
    });

    it('緊急ヘルプ機能ハイライトセクションが表示される', () => {
      render(<Home />);

      // セクションヘッダー
      expect(screen.getByText('緊急時サポート機能')).toBeInTheDocument();
      expect(screen.getByText(/デート中の「困った」を/)).toBeInTheDocument();
      expect(screen.getByText('瞬間解決')).toBeInTheDocument();
      expect(
        screen.getByText(/お手洗い探しや会話の沈黙に困ったら即座に解決！/)
      ).toBeInTheDocument();

      // お手洗い検索機能
      expect(screen.getByText('お手洗い検索')).toBeInTheDocument();
      expect(screen.getByText(/デート中の急なお手洗い探しに！/)).toBeInTheDocument();
      expect(screen.getByText('距離順表示')).toBeInTheDocument();
      expect(screen.getByText('Googleマップ連携')).toBeInTheDocument();
      expect(screen.getByText('リアルタイム位置情報')).toBeInTheDocument();
      expect(screen.getByText('ワンタップ検索')).toBeInTheDocument();

      // 会話ネタ提供機能
      expect(screen.getByText('会話ネタ提供')).toBeInTheDocument();
      expect(screen.getByText(/会話が途切れた時の救世主！/)).toBeInTheDocument();
      expect(screen.getByText('カテゴリ別選択')).toBeInTheDocument();
      expect(screen.getByText('関係性を深める質問')).toBeInTheDocument();
      expect(screen.getByText('盛り上がる話題')).toBeInTheDocument();
      expect(screen.getByText('使い方のコツ付き')).toBeInTheDocument();

      // 体験案内
      expect(screen.getByText('右下のボタンから今すぐ体験できます！')).toBeInTheDocument();
    });

    it('天気・服装提案機能セクションが表示される', () => {
      render(<Home />);

      // セクションヘッダー - 複数存在する場合があるので最初の要素を検証
      const smartOutfitTexts = screen.getAllByText(/スマート服装提案/);
      expect(smartOutfitTexts.length).toBeGreaterThan(0);

      // 複数存在するテキストは最初の要素を使用
      const weatherTexts = screen.getAllByText(/今日の天気に合わせた/);
      expect(weatherTexts.length).toBeGreaterThan(0);

      expect(screen.getByText('完璧な服装提案')).toBeInTheDocument();

      // リアルタイム天気情報
      expect(screen.getByText('リアルタイム天気情報')).toBeInTheDocument();
      expect(screen.getByText('現在地の詳細な天気情報')).toBeInTheDocument();
      expect(screen.getByText('気温・体感温度・湿度・風速')).toBeInTheDocument();
      expect(screen.getByText('時間別天気予報')).toBeInTheDocument();

      // スマート服装提案
      expect(screen.getByText('気温に応じた基本コーディネート')).toBeInTheDocument();
      expect(screen.getByText('雨・雪・風など天候別アドバイス')).toBeInTheDocument();
      expect(screen.getByText('湿度を考慮した素材選び')).toBeInTheDocument();
      expect(screen.getByText('具体的なアイテム提案')).toBeInTheDocument();
    });

    it('主要機能セクションが更新されている', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: '主要機能' })).toBeInTheDocument();
      expect(
        screen.getByText('カップルのデートを完全サポートする充実した機能群')
      ).toBeInTheDocument();

      // 緊急ヘルプ機能
      expect(screen.getByText('緊急ヘルプ')).toBeInTheDocument();
      expect(
        screen.getByText('デート中の困った瞬間を瞬時に解決する救世主機能')
      ).toBeInTheDocument();

      // プラン作成機能
      const planCreationElements = screen.getAllByText('プラン作成');
      expect(planCreationElements.length).toBeGreaterThan(0);
      expect(screen.getByText('直感的な操作でデートプランを簡単作成・共有')).toBeInTheDocument();

      // 天気・服装提案機能
      expect(screen.getByText('天気・服装提案')).toBeInTheDocument();
      expect(screen.getByText('今日の天気に合わせた完璧な服装を提案')).toBeInTheDocument();
    });

    it('緊急ヘルプボタンが表示される', () => {
      render(<Home />);

      // 緊急ヘルプボタンコンポーネントが表示される
      expect(screen.getByTestId('emergency-button')).toBeInTheDocument();
    });

    it('拡張されたフッターが正しく表示される', () => {
      render(<Home />);

      // サービスセクション - 複数存在するが存在することを確認
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

    it('キーボードナビゲーションが可能', () => {
      render(<Home />);

      const links = screen.getAllByRole('link');
      const buttons = screen.getAllByRole('button');

      // リンクとボタンが存在することを確認
      expect(links.length).toBeGreaterThan(0);
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('適切なARIAラベルが設定されている', () => {
      render(<Home />);

      // ナビゲーション要素にroleが設定されている
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // メインコンテンツ領域が存在する
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
