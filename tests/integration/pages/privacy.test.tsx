import { render, screen } from '@testing-library/react';

import PrivacyPolicy from '@/app/privacy/page';

// Next.js リンクをモック
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Privacy Policy Page', () => {
  beforeEach(() => {
    // 現在の日付をモック（テストの安定性のため）
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ページタイトルが正しく表示される', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('プライバシーポリシー');
  });

  it('最終更新日が表示される', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText('最終更新日: 2025/1/1')).toBeInTheDocument();
  });

  describe('プライバシーポリシーの各セクション', () => {
    it('個人情報の取り扱いについてのセクションが表示される', () => {
      render(<PrivacyPolicy />);

      expect(
        screen.getByRole('heading', { level: 2, name: '個人情報の取り扱いについて' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Couple Plan（以下「本サービス」）は、ユーザーのプライバシーを尊重し/)
      ).toBeInTheDocument();
    });

    it('広告についてのセクションが表示される', () => {
      render(<PrivacyPolicy />);

      expect(
        screen.getByRole('heading', { level: 2, name: '当サイトに掲載されている広告について' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /当サイトでは、第三者配信の広告サービス（Googleアドセンス）を利用しています/
        )
      ).toBeInTheDocument();
    });

    it('アクセス解析ツールについてのセクションが表示される', () => {
      render(<PrivacyPolicy />);

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: '当サイトが使用しているアクセス解析ツールについて',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています/
        )
      ).toBeInTheDocument();
    });

    it('お問い合わせについてのセクションが表示される', () => {
      render(<PrivacyPolicy />);

      expect(
        screen.getByRole('heading', { level: 2, name: '当サイトへのお問い合わせについて' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /当サイトでは、スパム・荒らしへの対応として、お問い合わせの際に使用されたIPアドレスを記録しています/
        )
      ).toBeInTheDocument();
    });

    it('お問い合わせセクションが表示される', () => {
      render(<PrivacyPolicy />);

      expect(screen.getByRole('heading', { level: 2, name: 'お問い合わせ' })).toBeInTheDocument();
      expect(
        screen.getByText(/本プライバシーポリシーに関するご質問やご意見は、/)
      ).toBeInTheDocument();
    });
  });

  describe('外部リンク', () => {
    it('Google広告ポリシーへのリンクが正しく設定されている', () => {
      render(<PrivacyPolicy />);

      const googleAdsLinks = screen.getAllByRole('link', { name: 'こちらをご確認ください' });
      const googleAdsLink = googleAdsLinks[0]; // 1番目のリンク（広告関連）

      expect(googleAdsLink).toHaveAttribute(
        'href',
        'https://policies.google.com/technologies/ads?gl=jp'
      );
      expect(googleAdsLink).toHaveAttribute('target', '_blank');
      expect(googleAdsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('Google Analyticsの利用規約へのリンクが正しく設定されている', () => {
      render(<PrivacyPolicy />);

      const analyticsLinks = screen.getAllByRole('link', { name: 'こちらをご確認ください' });
      const analyticsLink = analyticsLinks[1]; // 2番目のリンク

      expect(analyticsLink).toHaveAttribute(
        'href',
        'https://marketingplatform.google.com/about/analytics/terms/jp/'
      );
      expect(analyticsLink).toHaveAttribute('target', '_blank');
      expect(analyticsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('内部リンク', () => {
    it('お問い合わせページへのリンクが正しく設定されている', () => {
      render(<PrivacyPolicy />);

      const contactLinks = screen.getAllByRole('link', { name: 'お問い合わせページ' });
      expect(contactLinks[0]).toHaveAttribute('href', '/contact');
    });

    it('フッターの内部リンクが正しく設定されている', () => {
      render(<PrivacyPolicy />);

      const homeLink = screen.getByRole('link', { name: '← ホームに戻る' });
      const contactButton = screen.getByRole('link', { name: 'お問い合わせ' });

      expect(homeLink).toHaveAttribute('href', '/');
      expect(contactButton).toHaveAttribute('href', '/contact');
    });
  });

  describe('禁止事項リスト', () => {
    it('お問い合わせの禁止事項が全て表示される', () => {
      render(<PrivacyPolicy />);

      expect(screen.getByText('特定の自然人または法人を誹謗し、中傷するもの')).toBeInTheDocument();
      expect(screen.getByText('極度にわいせつな内容を含むもの')).toBeInTheDocument();
      expect(
        screen.getByText(/禁制品の取引に関するものや、他者を害する行為の依頼など/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /その他、公序良俗に反し、または管理人によって対応すべきでないと認められるもの/
        )
      ).toBeInTheDocument();
    });
  });

  describe('スタイリング', () => {
    it('適切なCSSクラスが適用されている', () => {
      const { container } = render(<PrivacyPolicy />);

      // メインコンテナのスタイル
      expect(container.firstChild).toHaveClass('min-h-screen', 'bg-gray-50');

      // 白い背景のカード
      const whiteCard = container.querySelector('.bg-white');
      expect(whiteCard).toHaveClass('shadow-sm', 'rounded-lg', 'p-8');
    });

    it('レスポンシブクラスが適用されている', () => {
      const { container } = render(<PrivacyPolicy />);

      const maxWidthContainer = container.querySelector('.max-w-4xl');
      expect(maxWidthContainer).toHaveClass('mx-auto', 'py-12', 'px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('アクセシビリティ', () => {
    it('適切な見出し構造を持つ', () => {
      render(<PrivacyPolicy />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2s).toHaveLength(5); // 5つのメインセクション
    });

    it('全てのリンクにアクセス可能なテキストがある', () => {
      render(<PrivacyPolicy />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });

    it('リストが適切にマークアップされている', () => {
      render(<PrivacyPolicy />);

      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);

      lists.forEach((list) => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('文章の内容検証', () => {
    it('Google AdSenseに関する適切な記載がある', () => {
      render(<PrivacyPolicy />);

      expect(
        screen.getByText(/当サイトや他サイトへのアクセスに関する情報『Cookie』/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/氏名、住所、メールアドレス、電話番号は含まれません/)
      ).toBeInTheDocument();
    });

    it('Google Analyticsに関する適切な記載がある', () => {
      render(<PrivacyPolicy />);

      expect(
        screen.getByText(
          /このトラフィックデータは匿名で収集されており、個人を特定するものではありません/
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/この機能はCookieを無効にすることで収集を拒否することが出来ます/)
      ).toBeInTheDocument();
    });

    it('個人情報保護に関する基本方針が記載されている', () => {
      render(<PrivacyPolicy />);

      expect(
        screen.getByText(
          /サービスの提供・運営、ユーザーサポート、サービスの改善のために必要最小限の個人情報を収集・利用いたします/
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /収集した個人情報は、法令に基づく場合や緊急時を除き、第三者に提供することはありません/
        )
      ).toBeInTheDocument();
    });
  });
});
