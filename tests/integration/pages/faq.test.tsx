import { render, screen } from '@testing-library/react';
import FAQPage from '@/app/faq/page';

describe('FAQ Page', () => {
  it('ページタイトルが正しく表示される', () => {
    render(<FAQPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'よくある質問' })).toBeInTheDocument();
  });

  it('説明文が表示される', () => {
    render(<FAQPage />);

    expect(
      screen.getByText(/Couple Planについてよく寄せられる質問をまとめました/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/こちらで解決しない場合は、お気軽にお問い合わせください/)
    ).toBeInTheDocument();
  });

  it('カテゴリセクションが表示される', () => {
    render(<FAQPage />);

    // カテゴリバッジ
    expect(screen.getByText('アカウント・登録')).toBeInTheDocument();
    expect(screen.getByText('デートプラン')).toBeInTheDocument();
    expect(screen.getByText('プライバシー・セキュリティ')).toBeInTheDocument();
    expect(screen.getByText('技術的な問題')).toBeInTheDocument();
    expect(screen.getByText('機能・使い方')).toBeInTheDocument();
    expect(screen.getByText('天気・服装提案機能')).toBeInTheDocument();
  });

  it('FAQ項目が正しく表示される', () => {
    render(<FAQPage />);

    // アカウント・登録関連
    expect(screen.getByText('アカウント作成は無料ですか？')).toBeInTheDocument();
    expect(screen.getByText(/Couple Planのアカウント作成・利用は完全無料です/)).toBeInTheDocument();

    // パスワード関連
    expect(screen.getByText('パスワードを忘れてしまいました')).toBeInTheDocument();
    expect(
      screen.getByText(/ログインページの「パスワードを忘れた方」リンクから/)
    ).toBeInTheDocument();

    // デートプラン関連
    expect(screen.getByText('作成したプランを削除することはできますか？')).toBeInTheDocument();
    expect(
      screen.getByText(/プラン詳細ページの設定メニューから「プランを削除」を選択/)
    ).toBeInTheDocument();

    // プライバシー・セキュリティ関連
    expect(
      screen.getByText('アカウントを完全に削除したい場合はどうすればよいですか？')
    ).toBeInTheDocument();
    expect(screen.getByText(/プロフィール設定から「アカウント削除」を選択/)).toBeInTheDocument();

    expect(
      screen.getByText('他のユーザーに自分の情報が見られることはありますか？')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/プラン内容のみが表示され、ユーザー名や個人を特定できる情報は公開されません/)
    ).toBeInTheDocument();

    // 技術的な問題
    expect(screen.getByText('アプリが正常に動作しません')).toBeInTheDocument();
    expect(screen.getByText(/まずブラウザの再読み込みをお試しください/)).toBeInTheDocument();

    expect(screen.getByText('スマートフォンでも利用できますか？')).toBeInTheDocument();
    expect(
      screen.getByText(
        /レスポンシブWebアプリケーションなので、スマートフォン、タブレット、PCのいずれでも快適にご利用いただけます/
      )
    ).toBeInTheDocument();

    // 機能・使い方
    expect(screen.getByText('プランを他のカップルと共有したい')).toBeInTheDocument();
    expect(screen.getByText(/プラン作成時に「公開設定」を有効にすることで/)).toBeInTheDocument();

    // 天気・服装提案機能
    expect(screen.getByText('天気・服装提案機能はどのように使いますか？')).toBeInTheDocument();
    expect(
      screen.getByText(/ホームページの天気・服装提案カードから現在地の天気情報を確認/)
    ).toBeInTheDocument();

    expect(screen.getByText('天気情報はどれくらい正確ですか？')).toBeInTheDocument();
    expect(screen.getByText(/信頼性の高い気象データAPIを使用しており/)).toBeInTheDocument();

    expect(screen.getByText('服装提案は男性・女性両方に対応していますか？')).toBeInTheDocument();
    expect(screen.getByText(/気温や天候に応じた一般的な服装アドバイスを提供/)).toBeInTheDocument();
  });

  it('問題解決しない場合のセクションが表示される', () => {
    render(<FAQPage />);

    expect(
      screen.getByRole('heading', { name: '問題が解決しませんでしたか？' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/上記のFAQで解決しない場合は、お気軽にお問い合わせください/)
    ).toBeInTheDocument();
    expect(screen.getByText(/通常1-3営業日以内にご回答いたします/)).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: '📧 お問い合わせする' });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('フッターナビゲーションが正しく表示される', () => {
    render(<FAQPage />);

    const homeLink = screen.getByRole('link', { name: '🏠 ホームに戻る' });
    const aboutLink = screen.getByRole('link', { name: 'サービスについて' });
    const privacyLink = screen.getByRole('link', { name: 'プライバシーポリシー' });
    const termsLink = screen.getByRole('link', { name: '利用規約' });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('適切な見出し構造を持つ', () => {
    render(<FAQPage />);

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h3Elements = screen.getAllByRole('heading', { level: 3 });

    expect(h1Elements).toHaveLength(1);
    expect(h2Elements.length).toBeGreaterThan(0);
    expect(h3Elements.length).toBeGreaterThan(0);
  });

  it('全てのリンクが適切なhref属性を持つ', () => {
    render(<FAQPage />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('href');
    });
  });

  it('Q&A形式で質問と回答が適切に構造化されている', () => {
    render(<FAQPage />);

    // 新しいデザインではQ/Aはボタン内のテキストとして表示される
    const qButtons = screen.getAllByText('Q');
    const aButtons = screen.getAllByText('A');

    expect(qButtons.length).toBeGreaterThan(0);
    expect(aButtons.length).toBeGreaterThan(0);
    expect(qButtons.length).toEqual(aButtons.length);
  });
});
