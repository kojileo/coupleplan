import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/about/page';

describe('About Page', () => {
  it('ページタイトルが正しく表示される', () => {
    render(<AboutPage />);

    expect(screen.getByText('Couple Plan')).toBeInTheDocument();
    expect(screen.getByText('カップルのための究極のデートサポートアプリ')).toBeInTheDocument();
  });

  it('サービス説明セクションが表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: /カップルのデートを/ })).toBeInTheDocument();
    expect(screen.getByText('完全サポート')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Couple Planは、カップルが一緒にデートプランを作成・共有・管理できるWebアプリケーション/
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/今度どこに行こうか/)).toBeInTheDocument();
  });

  it('基本機能セクションが正しく表示される', () => {
    render(<AboutPage />);

    // 基本的な機能説明
    expect(screen.getByText('二人で一緒に計画')).toBeInTheDocument();
    expect(
      screen.getByText('行きたい場所を共有し、一緒にデートプランを作り上げる楽しさを体験')
    ).toBeInTheDocument();

    expect(screen.getByText('新しい発見')).toBeInTheDocument();
    expect(
      screen.getByText('他のカップルが公開しているプランを参考に、新しいデートスポットを発見')
    ).toBeInTheDocument();

    expect(screen.getByText('デート中もサポート')).toBeInTheDocument();
    expect(screen.getByText('天気も考慮')).toBeInTheDocument();
  });

  it('充実の機能セクションが正しく表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: '充実の機能' })).toBeInTheDocument();

    // デートプラン作成機能
    expect(screen.getByText('デートプラン作成')).toBeInTheDocument();
    // 実際のコンテンツに存在するテキストのみをテスト
    expect(screen.getByText('行きたい場所の追加・管理')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ分け機能')).toBeInTheDocument();

    // 緊急ヘルプ機能
    expect(screen.getByText('緊急ヘルプ機能')).toBeInTheDocument();
    expect(screen.getByText('お手洗い検索')).toBeInTheDocument();
    expect(screen.getByText('会話ネタ提供')).toBeInTheDocument();

    // 公開プラン閲覧機能
    expect(screen.getByText('公開プラン閲覧')).toBeInTheDocument();
    expect(screen.getByText('他のカップルのプランを参考')).toBeInTheDocument();
    expect(screen.getByText('地域・カテゴリ別検索')).toBeInTheDocument();
  });

  it('天気・服装提案セクションが表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: /天気に合わせた/ })).toBeInTheDocument();
    expect(screen.getByText('服装提案')).toBeInTheDocument();

    expect(screen.getByText('リアルタイム天気情報')).toBeInTheDocument();
    // 実際のページに存在するコンテンツに合わせる
    expect(screen.getByText('現在地の詳細な天気情報')).toBeInTheDocument();

    expect(screen.getByText('パーソナライズド提案')).toBeInTheDocument();
    // 実際のページに存在するコンテンツに合わせる
    expect(screen.getByText('気温に応じたコーディネート')).toBeInTheDocument();
  });

  it('推奨カップルセクションが表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'こんなカップルにおすすめ' })).toBeInTheDocument();

    expect(screen.getByText('プラン作りが好き')).toBeInTheDocument();
    expect(screen.getByText('新しい場所を開拓')).toBeInTheDocument();
    expect(screen.getByText('デート中も安心')).toBeInTheDocument();
    expect(screen.getByText('おしゃれにこだわり')).toBeInTheDocument();
  });

  it('安全性とプライバシーセクションが表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: /安全性と/ })).toBeInTheDocument();
    expect(screen.getByText('プライバシー保護')).toBeInTheDocument();

    expect(screen.getByText('データ暗号化')).toBeInTheDocument();
    expect(screen.getByText('匿名性の確保')).toBeInTheDocument();
    expect(screen.getByText('HTTPS通信')).toBeInTheDocument();
  });

  it('行動促進セクションが表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: '今すぐ始めよう' })).toBeInTheDocument();
    expect(screen.getByText(/Couple Planは完全無料/)).toBeInTheDocument();

    // 絵文字を含むテキストを処理
    const signupLinks = screen.getAllByRole('link');
    const signupLink = signupLinks.find((link) => link.getAttribute('href') === '/signup');
    const publicPlansLink = signupLinks.find(
      (link) => link.getAttribute('href') === '/plans/public'
    );

    expect(signupLink).toBeInTheDocument();
    expect(publicPlansLink).toBeInTheDocument();
  });

  it('フッターナビゲーションが正しく表示される', () => {
    render(<AboutPage />);

    const homeLink = screen.getByRole('link', { name: '← ホームに戻る' });
    const contactLink = screen.getByRole('link', { name: 'お問い合わせ' });
    const privacyLink = screen.getByRole('link', { name: 'プライバシーポリシー' });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(contactLink).toHaveAttribute('href', '/contact');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('適切な見出し構造を持つ', () => {
    render(<AboutPage />);

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h3Elements = screen.getAllByRole('heading', { level: 3 });

    expect(h1Elements).toHaveLength(1);
    expect(h2Elements.length).toBeGreaterThan(0);
    expect(h3Elements.length).toBeGreaterThan(0);
  });

  it('全てのリンクが適切なhref属性を持つ', () => {
    render(<AboutPage />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('href');
    });
  });
});
