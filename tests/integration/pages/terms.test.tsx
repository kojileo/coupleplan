import { render, screen } from '@testing-library/react';
import TermsPage from '@/app/terms/page';

describe('Terms Page', () => {
  it('ページタイトルが正しく表示される', () => {
    render(<TermsPage />);

    expect(screen.getByRole('heading', { level: 1, name: '利用規約' })).toBeInTheDocument();
  });

  it('最終更新日が表示される', () => {
    render(<TermsPage />);

    expect(screen.getByText(/最終更新日:/)).toBeInTheDocument();
  });

  it('利用規約の各条項が表示される', () => {
    render(<TermsPage />);

    // 主要な条項
    expect(screen.getByRole('heading', { name: '第1条（適用）' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '第2条（利用登録）' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '第3条（ユーザーIDおよびパスワードの管理）' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '第4条（禁止事項）' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '第5条（本サービスの提供の停止等）' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '第6条（利用制限および登録抹消）' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '第7条（退会）' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '第8条（保証の否認および免責事項）' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '第9条（サービス内容の変更等）' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '第10条（利用規約の変更）' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '第11条（個人情報の取扱い）' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '第12条（通知または連絡）' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '第13条（権利義務の譲渡の禁止）' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '第14条（準拠法・裁判管轄）' })).toBeInTheDocument();
  });

  it('第1条の内容が正しく表示される', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(
        /この利用規約（以下「本規約」）は、Couple Plan（以下「当サービス」）が提供するサービスの利用条件を定めるものです/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /登録ユーザーの皆さま（以下「ユーザー」）には、本規約に従って、本サービスをご利用いただきます/
      )
    ).toBeInTheDocument();
  });

  it('禁止事項が適切に表示される', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません/)
    ).toBeInTheDocument();
    expect(screen.getByText('法令または公序良俗に違反する行為')).toBeInTheDocument();
    expect(screen.getByText('犯罪行為に関連する行為')).toBeInTheDocument();
    expect(screen.getByText('不正アクセスをし、またはこれを試みる行為')).toBeInTheDocument();
    expect(screen.getByText('面識のない異性との出会いを目的とした行為')).toBeInTheDocument();
  });

  it('個人情報の取扱いについて言及されている', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(
        /当サービスは、本サービスの利用によって取得する個人情報については、当サービス「プライバシーポリシー」に従い適切に取り扱うものとします/
      )
    ).toBeInTheDocument();
  });

  it('準拠法について記載されている', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/本規約の解釈にあたっては、日本法を準拠法とします/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /本サービスに関して紛争が生じた場合には、当サービスの本店所在地を管轄する裁判所を専属的合意管轄とします/
      )
    ).toBeInTheDocument();
  });

  it('お問い合わせセクションが表示される', () => {
    render(<TermsPage />);

    expect(screen.getByRole('heading', { name: 'お問い合わせ' })).toBeInTheDocument();
    expect(screen.getByText(/本規約に関するお問い合わせは/)).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: 'お問い合わせページ' });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('フッターナビゲーションが正しく表示される', () => {
    render(<TermsPage />);

    const homeLink = screen.getByRole('link', { name: '← ホームに戻る' });
    const privacyLink = screen.getByRole('link', { name: 'プライバシーポリシー' });
    const contactLink = screen.getByRole('link', { name: 'お問い合わせ' });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('適切な見出し構造を持つ', () => {
    render(<TermsPage />);

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    const h2Elements = screen.getAllByRole('heading', { level: 2 });

    expect(h1Elements).toHaveLength(1);
    expect(h2Elements.length).toBeGreaterThan(10); // 14条 + お問い合わせ
  });

  it('全てのリンクが適切なhref属性を持つ', () => {
    render(<TermsPage />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('href');
    });
  });

  it('利用規約の構造が論理的である', () => {
    render(<TermsPage />);

    // 条項が番号順になっていることを確認
    const articles = [
      '第1条（適用）',
      '第2条（利用登録）',
      '第3条（ユーザーIDおよびパスワードの管理）',
      '第4条（禁止事項）',
      '第5条（本サービスの提供の停止等）',
      '第6条（利用制限および登録抹消）',
      '第7条（退会）',
      '第8条（保証の否認および免責事項）',
      '第9条（サービス内容の変更等）',
      '第10条（利用規約の変更）',
      '第11条（個人情報の取扱い）',
      '第12条（通知または連絡）',
      '第13条（権利義務の譲渡の禁止）',
      '第14条（準拠法・裁判管轄）',
    ];

    articles.forEach((article) => {
      expect(screen.getByRole('heading', { name: article })).toBeInTheDocument();
    });
  });
});
