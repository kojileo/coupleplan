import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';

import Contact from '@/app/contact/page';

// Next.js リンクをモック
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// fetch をモック
fetchMock.enableMocks();

describe('Contact Page', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('基本レンダリング', () => {
    it('ページタイトルが正しく表示される', () => {
      render(<Contact />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('お問い合わせ');
      expect(
        screen.getByRole('heading', { level: 2, name: 'お問い合わせフォーム' })
      ).toBeInTheDocument();
    });

    it('フォームの全ての入力フィールドが表示される', () => {
      render(<Contact />);

      expect(screen.getByLabelText(/お名前/)).toBeInTheDocument();
      expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
      expect(screen.getByLabelText(/お問い合わせ種別/)).toBeInTheDocument();
      expect(screen.getByLabelText(/お問い合わせ内容/)).toBeInTheDocument();
    });

    it('必須マークが正しく表示される', () => {
      render(<Contact />);

      const requiredFields = screen.getAllByText('*');
      expect(requiredFields).toHaveLength(4); // 全フィールドが必須
    });

    it('送信ボタンが表示される', () => {
      render(<Contact />);

      expect(screen.getByRole('button', { name: '📧 送信する' })).toBeInTheDocument();
    });

    it('回答についての案内が表示される', () => {
      render(<Contact />);

      // より具体的なテキストで検索
      expect(screen.getByText(/緊急の場合は優先対応/)).toBeInTheDocument();
      expect(screen.getByText(/土日祝日は翌営業日対応/)).toBeInTheDocument();
      // ヒーローセクションの特定のテキストを検索
      expect(
        screen.getByText(/ご質問やご要望がございましたら、お気軽にお問い合わせください/)
      ).toBeInTheDocument();
    });
  });

  describe('お問い合わせ種別の選択肢', () => {
    it('お問い合わせ種別が表示される', () => {
      render(<Contact />);

      const selectElement = screen.getByLabelText(/お問い合わせ種別/);
      fireEvent.click(selectElement);

      expect(screen.getByRole('option', { name: '一般的なお問い合わせ' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '技術的な問題' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'バグ報告' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '機能リクエスト' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '緊急ヘルプ機能について' })).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: '天気・服装提案機能について' })
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'プライバシーについて' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'アカウントについて' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'その他' })).toBeInTheDocument();
    });
  });

  describe('よくあるご質問', () => {
    it('FAQセクションが表示される', () => {
      render(<Contact />);

      expect(screen.getByRole('heading', { level: 2, name: 'よくあるご質問' })).toBeInTheDocument();

      // FAQ項目（新しいデザインに合わせて更新）
      expect(screen.getByText('緊急ヘルプ機能が見つからない')).toBeInTheDocument();
      expect(screen.getByText('天気・服装提案機能の使い方')).toBeInTheDocument();
      expect(screen.getByText('アカウントを削除したい')).toBeInTheDocument();
      expect(screen.getByText('パスワードを忘れました')).toBeInTheDocument();
      expect(screen.getByText('広告について')).toBeInTheDocument();
    });

    it('プライバシーポリシーへのリンクが設定されている', () => {
      render(<Contact />);

      // 複数のプライバシーポリシーリンクがあるため、最初のものを取得
      const privacyLinks = screen.getAllByRole('link', { name: 'プライバシーポリシー' });
      expect(privacyLinks[0]).toHaveAttribute('href', '/privacy');
    });

    it('FAQページへのリンクが設定されている', () => {
      render(<Contact />);

      const faqLink = screen.getByRole('link', { name: '📚 すべてのFAQを見る' });
      expect(faqLink).toHaveAttribute('href', '/faq');
    });
  });

  describe('フォーム送信', () => {
    const user = userEvent.setup();

    const validFormData = {
      name: '山田太郎',
      email: 'test@example.com',
      subject: 'general',
      message: 'テスト用のお問い合わせメッセージです。',
    };

    it('有効なデータで正常に送信できる', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          message: 'お問い合わせを受け付けました。ご回答まで少々お待ちください。',
          success: true,
        })
      );

      render(<Contact />);

      // フォームに入力
      await user.type(screen.getByLabelText(/お名前/), validFormData.name);
      await user.type(screen.getByLabelText(/メールアドレス/), validFormData.email);
      await user.selectOptions(screen.getByLabelText(/お問い合わせ種別/), validFormData.subject);
      await user.type(screen.getByLabelText(/お問い合わせ内容/), validFormData.message);

      // 送信
      await user.click(screen.getByRole('button', { name: '📧 送信する' }));

      // 成功メッセージが表示される
      await waitFor(() => {
        expect(
          screen.getByText('お問い合わせを受け付けました。回答まで少々お待ちください。')
        ).toBeInTheDocument();
      });

      // APIが正しく呼ばれている
      expect(fetchMock).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validFormData),
      });

      // フォームがリセットされている
      expect(screen.getByLabelText(/お名前/)).toHaveValue('');
      expect(screen.getByLabelText(/メールアドレス/)).toHaveValue('');
      expect(screen.getByLabelText(/お問い合わせ種別/)).toHaveValue('');
      expect(screen.getByLabelText(/お問い合わせ内容/)).toHaveValue('');
    });

    it('必須フィールドが未入力の場合にHTML5バリデーションが働く', async () => {
      render(<Contact />);

      const submitButton = screen.getByRole('button', { name: '📧 送信する' });
      await user.click(submitButton);

      // HTML5のrequired属性により送信が阻止される
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('API エラー時にエラーメッセージが表示される', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          error: 'メールアドレスの形式が正しくありません',
        }),
        { status: 400 }
      );

      render(<Contact />);

      // フォームに入力（有効な形式だがサーバー側でエラーとなるメールアドレス）
      await user.type(screen.getByLabelText(/お名前/), validFormData.name);
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@blocked-domain.com');
      await user.selectOptions(screen.getByLabelText(/お問い合わせ種別/), validFormData.subject);
      await user.type(screen.getByLabelText(/お問い合わせ内容/), validFormData.message);

      await user.click(screen.getByRole('button', { name: '📧 送信する' }));

      // エラーメッセージが表示される
      await waitFor(
        () => {
          expect(screen.getByText('メールアドレスの形式が正しくありません')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('ネットワークエラー時にエラーメッセージが表示される', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      render(<Contact />);

      // フォームに入力
      await user.type(screen.getByLabelText(/お名前/), validFormData.name);
      await user.type(screen.getByLabelText(/メールアドレス/), validFormData.email);
      await user.selectOptions(screen.getByLabelText(/お問い合わせ種別/), validFormData.subject);
      await user.type(screen.getByLabelText(/お問い合わせ内容/), validFormData.message);

      await user.click(screen.getByRole('button', { name: '📧 送信する' }));

      // ネットワークエラーメッセージが表示される
      await waitFor(() => {
        expect(
          screen.getByText('ネットワークエラーが発生しました。時間をおいて再度お試しください。')
        ).toBeInTheDocument();
      });
    });

    it('送信中にボタンが無効化される', async () => {
      // 長時間のリクエストをシミュレート
      fetchMock.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(new Response(JSON.stringify({ success: true }))), 1000)
          )
      );

      render(<Contact />);

      // フォームに入力
      await user.type(screen.getByLabelText(/お名前/), validFormData.name);
      await user.type(screen.getByLabelText(/メールアドレス/), validFormData.email);
      await user.selectOptions(screen.getByLabelText(/お問い合わせ種別/), validFormData.subject);
      await user.type(screen.getByLabelText(/お問い合わせ内容/), validFormData.message);

      const submitButton = screen.getByRole('button', { name: '📧 送信する' });
      await user.click(submitButton);

      // 送信中状態
      expect(screen.getByText('送信中...')).toBeInTheDocument();
    });

    it('各お問い合わせ種別で正しく送信される', async () => {
      const subjects = [
        'general',
        'technical',
        'bug',
        'feature',
        'emergency',
        'weather',
        'privacy',
        'account',
        'other',
      ];

      for (const subject of subjects) {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        const { unmount } = render(<Contact />);

        await user.type(screen.getByLabelText(/お名前/), validFormData.name);
        await user.type(screen.getByLabelText(/メールアドレス/), validFormData.email);
        await user.selectOptions(screen.getByLabelText(/お問い合わせ種別/), subject);
        await user.type(screen.getByLabelText(/お問い合わせ内容/), validFormData.message);

        await user.click(screen.getByRole('button', { name: '📧 送信する' }));

        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledWith('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...validFormData,
              subject,
            }),
          });
        });

        // クリーンアップ
        unmount();
        fetchMock.resetMocks();
      }
    });
  });

  describe('フォームの状態管理', () => {
    const user = userEvent.setup();

    it('入力値が正しく状態に反映される', async () => {
      render(<Contact />);

      const nameInput = screen.getByLabelText(/お名前/) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/メールアドレス/) as HTMLInputElement;
      const messageTextarea = screen.getByLabelText(/お問い合わせ内容/) as HTMLTextAreaElement;

      await user.type(nameInput, '田中花子');
      await user.type(emailInput, 'hanako@example.com');
      await user.type(messageTextarea, 'テストメッセージ');

      expect(nameInput.value).toBe('田中花子');
      expect(emailInput.value).toBe('hanako@example.com');
      expect(messageTextarea.value).toBe('テストメッセージ');
    });

    it('エラー発生後に入力すると エラーメッセージが消える', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'テストエラー' }), { status: 400 });

      render(<Contact />);

      // 必須フィールドを全て入力してエラーを発生させる
      const nameInput = screen.getByLabelText(/お名前/);
      const emailInput = screen.getByLabelText(/メールアドレス/);
      const subjectSelect = screen.getByLabelText(/お問い合わせ種別/);
      const messageTextarea = screen.getByLabelText(/お問い合わせ内容/);

      await user.type(nameInput, 'テスト');
      await user.type(emailInput, 'test@example.com');
      await user.selectOptions(subjectSelect, 'general');
      await user.type(messageTextarea, 'テストメッセージ');

      await user.click(screen.getByRole('button', { name: '📧 送信する' }));

      await waitFor(
        () => {
          expect(screen.getByText('テストエラー')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // 入力するとエラーが消える
      await user.type(nameInput, '追加入力');

      expect(screen.queryByText('テストエラー')).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切な見出し構造を持つ', () => {
      render(<Contact />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThanOrEqual(2);
      expect(h3s.length).toBeGreaterThanOrEqual(1);
    });

    it('フォームラベルが適切に関連付けられている', () => {
      render(<Contact />);

      expect(screen.getByLabelText(/お名前/)).toHaveAttribute('id');
      expect(screen.getByLabelText(/メールアドレス/)).toHaveAttribute('id');
      expect(screen.getByLabelText(/お問い合わせ種別/)).toHaveAttribute('id');
      expect(screen.getByLabelText(/お問い合わせ内容/)).toHaveAttribute('id');
    });

    it('フォーカス管理が適切である', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const nameInput = screen.getByLabelText(/お名前/);
      const emailInput = screen.getByLabelText(/メールアドレス/);

      // Tabキーでフォーカス移動
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();
    });
  });
});
