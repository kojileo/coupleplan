import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/about/page';

describe('About Page', () => {
  it('ページタイトルが正しく表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Couple Planとは' })).toBeInTheDocument();
  });

  it('サービス説明セクションが表示される', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', { name: 'カップルのためのデートプラン管理アプリ' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/カップルが一緒にデートプランを作成・共有・管理できるWebアプリケーション/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/新しいデートスポットの発見や、記念日の特別なプランのヒントも見つかります/)
    ).toBeInTheDocument();
  });

  it('主な機能セクションが正しく表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: '主な機能' })).toBeInTheDocument();

    // デートプラン作成機能
    expect(screen.getByText('デートプラン作成')).toBeInTheDocument();
    expect(screen.getByText(/行きたい場所の追加・管理/)).toBeInTheDocument();
    expect(
      screen.getByText(/カテゴリ分け（観光、グルメ、アクティビティなど）/)
    ).toBeInTheDocument();

    // カップル共有機能
    expect(screen.getByText('カップル共有')).toBeInTheDocument();
    expect(screen.getByText(/プラン共有機能/)).toBeInTheDocument();

    // 公開プラン閲覧機能
    expect(screen.getByText('公開プラン閲覧')).toBeInTheDocument();
    expect(screen.getByText(/他のカップルのプランを参考/)).toBeInTheDocument();
    expect(screen.getByText(/地域・カテゴリ別検索/)).toBeInTheDocument();
    expect(screen.getByText(/いいね機能/)).toBeInTheDocument();
  });

  it('推奨カップルセクションが表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'こんなカップルにおすすめ' })).toBeInTheDocument();

    expect(screen.getByText('デートプラン作りが好き')).toBeInTheDocument();
    expect(screen.getByText('新しい場所を開拓したい')).toBeInTheDocument();
  });

  it('安全性とプライバシーセクションが表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: '安全性とプライバシー' })).toBeInTheDocument();
    expect(
      screen.getByText(/ユーザーの個人情報とプライバシーの保護を最優先に考えています/)
    ).toBeInTheDocument();
    expect(screen.getByText(/公開プランは個人を特定できない形で共有/)).toBeInTheDocument();
    expect(screen.getByText(/適切なデータ管理とプライバシー保護/)).toBeInTheDocument();
    expect(screen.getByText(/HTTPS通信による暗号化/)).toBeInTheDocument();
  });

  it('行動促進セクションが表示される', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: '今すぐ始めよう' })).toBeInTheDocument();
    expect(screen.getByText(/Couple Planは完全無料でご利用いただけます/)).toBeInTheDocument();

    const signupLink = screen.getByRole('link', { name: '無料で始める' });
    const publicPlansLink = screen.getByRole('link', { name: '公開プランを見る' });

    expect(signupLink).toHaveAttribute('href', '/signup');
    expect(publicPlansLink).toHaveAttribute('href', '/plans/public');
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
