import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

import NotFound from '@/app/not-found';

// Next.js Link コンポーネントのモック
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: ReactElement; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('NotFound コンポーネント', () => {
  beforeEach(() => {
    render(<NotFound />);
  });

  describe('基本要素の表示', () => {
    it('404のタイトルが表示される', () => {
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('ページが見つかりませんというメッセージが表示される', () => {
      expect(screen.getByText('ページが見つかりません')).toBeInTheDocument();
    });

    it('説明文が表示される', () => {
      expect(
        screen.getByText(/お探しのページは存在しないか、移動された可能性があります。/)
      ).toBeInTheDocument();
    });
  });

  describe('ナビゲーションリンク', () => {
    it('ホームに戻るリンクが表示される', () => {
      const homeLink = screen.getByRole('link', { name: /ホームに戻る/ });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('公開プランを見るリンクが表示される', () => {
      const plansLink = screen.getByRole('link', { name: /公開プランを見る/ });
      expect(plansLink).toBeInTheDocument();
      expect(plansLink).toHaveAttribute('href', '/plans/public');
    });
  });

  describe('人気のページセクション', () => {
    it('人気のページというタイトルが表示される', () => {
      expect(screen.getByText('人気のページ')).toBeInTheDocument();
    });

    it('緊急ヘルプ機能へのリンクが表示される', () => {
      const featuresLink = screen.getByRole('link', { name: /緊急ヘルプ機能/ });
      expect(featuresLink).toBeInTheDocument();
      expect(featuresLink).toHaveAttribute('href', '/features');
    });

    it('Couple Planとはページへのリンクが表示される', () => {
      const aboutLink = screen.getByRole('link', { name: /Couple Planとは/ });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('よくある質問へのリンクが表示される', () => {
      const faqLink = screen.getByRole('link', { name: /よくある質問/ });
      expect(faqLink).toBeInTheDocument();
      expect(faqLink).toHaveAttribute('href', '/faq');
    });

    it('お問い合わせへのリンクが表示される', () => {
      const contactLinks = screen.getAllByRole('link', { name: /お問い合わせ/ });
      expect(contactLinks.length).toBeGreaterThan(0);
      // 人気のページセクション内のお問い合わせリンクを検証
      const popularPagesContactLink = contactLinks.find((link) =>
        link.textContent?.includes('📞 お問い合わせ')
      );
      expect(popularPagesContactLink).toBeInTheDocument();
      expect(popularPagesContactLink).toHaveAttribute('href', '/contact');
    });
  });

  describe('サポート情報', () => {
    it('お問い合わせページへのリンクが表示される', () => {
      const supportLinks = screen.getAllByRole('link', { name: /お問い合わせページ/ });
      expect(supportLinks.length).toBeGreaterThan(0);
      supportLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '/contact');
      });
    });
  });

  describe('スタイリング', () => {
    it('背景グラデーションのクラスが適用されている', () => {
      const container = screen.getByText('404').closest('.min-h-screen');
      expect(container).toHaveClass('bg-gradient-to-b', 'from-pink-50', 'to-white');
    });

    it('レスポンシブ対応のクラスが適用されている', () => {
      const buttonContainer = screen.getByText('ホームに戻る').closest('.space-y-4');
      expect(buttonContainer).toHaveClass(
        'sm:space-y-0',
        'sm:space-x-4',
        'sm:flex',
        'sm:justify-center'
      );
    });
  });

  describe('アクセシビリティ', () => {
    it('適切な見出し構造を持つ', () => {
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('ページが見つかりません');

      const subHeading = screen.getByRole('heading', { level: 2 });
      expect(subHeading).toHaveTextContent('人気のページ');
    });

    it('すべてのリンクが適切なアクセシブルな名前を持つ', () => {
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
