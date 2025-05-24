import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/contact/route';

// Resendをモック化
const mockSend = jest.fn();
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

// console.log をモック化
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// 環境変数のモック
const originalEnv = process.env;

describe('/api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockSend.mockClear();

    // 環境変数を設定
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test-api-key',
      ADMIN_EMAIL: 'admin@test.com',
      FROM_EMAIL: 'noreply@test.com',
    };

    // デフォルトで成功レスポンスを返す
    mockSend.mockResolvedValue({
      data: { id: 'test-email-id' },
      error: null,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('POST', () => {
    const validContactData = {
      name: '山田太郎',
      email: 'test@example.com',
      subject: 'bug',
      message: 'テストメッセージです',
    };

    it('有効なデータで正常にレスポンスを返し、メールを送信する', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: 'お問い合わせを受け付けました。ご回答まで少々お待ちください。',
        success: true,
      });

      // Resendが2回呼ばれる（管理者用 + 自動返信）
      expect(mockSend).toHaveBeenCalledTimes(2);

      // 管理者用メールの確認
      expect(mockSend).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          from: 'noreply@test.com',
          to: ['admin@test.com'],
          subject: '【お問い合わせ】bug',
          html: expect.stringContaining('山田太郎'),
        })
      );

      // 自動返信メールの確認
      expect(mockSend).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          from: 'noreply@test.com',
          to: ['test@example.com'],
          subject: 'お問い合わせを受け付けました - Couple Plan',
          html: expect.stringContaining('山田太郎'),
        })
      );

      // 成功ログが呼ばれることを確認
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'お問い合わせメール送信成功:',
        expect.objectContaining({
          name: '山田太郎',
          email: 'test@example.com',
          subject: 'bug',
          adminEmailId: 'test-email-id',
          autoReplyEmailId: 'test-email-id',
          timestamp: expect.any(String),
        })
      );
    });

    it('RESEND_API_KEYが設定されていない場合にエラーを返す', async () => {
      delete process.env.RESEND_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'メール送信設定に問題があります。管理者にお問い合わせください。',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('RESEND_API_KEY is not configured');
    });

    it('管理者メール送信エラーの場合にエラーを返す', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to send email' },
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'メール送信中にエラーが発生しました。時間をおいて再度お試しください。',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('管理者メール送信エラー:', {
        message: 'Failed to send email',
      });
    });

    it('自動返信メールエラーでも管理者メールが成功すれば成功レスポンスを返す', async () => {
      mockSend
        .mockResolvedValueOnce({
          data: { id: 'admin-email-id' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Auto-reply failed' },
        });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: 'お問い合わせを受け付けました。ご回答まで少々お待ちください。',
        success: true,
      });

      expect(mockConsoleError).toHaveBeenCalledWith('自動返信メール送信エラー:', {
        message: 'Auto-reply failed',
      });
    });

    it('Resend例外が発生した場合にエラーを返す', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'メール送信中にエラーが発生しました。時間をおいて再度お試しください。',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('Resend メール送信エラー:', expect.any(Error));
    });

    it('必須項目が不足している場合にエラーを返す', async () => {
      const incompleteData = {
        name: '山田太郎',
        email: 'test@example.com',
        // subject と message が不足
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: '必須項目が入力されていません',
      });
      // メール送信は行われない
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('無効なメールアドレス形式でエラーを返す', async () => {
      const invalidEmailData = {
        ...validContactData,
        email: 'invalid-email',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidEmailData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'メールアドレスの形式が正しくありません',
      });
      // メール送信は行われない
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('各必須項目が空文字列の場合にエラーを返す', async () => {
      const emptyFieldsData = {
        name: '',
        email: '',
        subject: '',
        message: '',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(emptyFieldsData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: '必須項目が入力されていません',
      });
    });

    it('JSONパースエラーが発生した場合にエラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('お問い合わせ処理エラー:', expect.any(Error));
    });

    it('様々なメールアドレス形式のバリデーション', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.jp',
        'test+label@gmail.com',
        'user123@test-domain.org',
      ];

      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test.domain.com',
        'test@domain',
        '',
      ];

      // 有効なメールアドレステスト
      for (const email of validEmails) {
        mockSend.mockClear();
        const request = new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({ ...validContactData, email }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
        expect(mockSend).toHaveBeenCalledTimes(2);
      }

      // 無効なメールアドレステスト
      for (const email of invalidEmails) {
        mockSend.mockClear();
        const request = new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({ ...validContactData, email }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
        expect(mockSend).not.toHaveBeenCalled();
      }
    });

    it('日本語文字を含むデータを正しく処理し、メールに含める', async () => {
      const japaneseData = {
        name: 'こうじ　太郎',
        email: 'koji@example.co.jp',
        subject: 'feature',
        message: '新機能のご提案です。カップル向けの機能を追加してほしいです。',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(japaneseData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: 'お問い合わせを受け付けました。ご回答まで少々お待ちください。',
        success: true,
      });

      // 日本語が適切にメールに含まれることを確認
      expect(mockSend).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          html: expect.stringContaining('こうじ　太郎'),
        })
      );
      expect(mockSend).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          html: expect.stringContaining('こうじ　太郎'),
        })
      );
    });

    it('デフォルト値を使用してメールを送信する', async () => {
      // 環境変数をクリア
      delete process.env.ADMIN_EMAIL;
      delete process.env.FROM_EMAIL;

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // デフォルト値が使用されることを確認
      expect(mockSend).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          from: 'noreply@example.com',
          to: ['admin@example.com'],
        })
      );
    });
  });

  describe('GET', () => {
    it('GETメソッドに対してエラーを返す', async () => {
      const response = GET();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data).toEqual({
        error: 'このエンドポイントはPOSTメソッドのみ対応しています',
      });
    });
  });
});
