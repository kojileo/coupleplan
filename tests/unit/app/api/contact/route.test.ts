import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/contact/route';

// console.log をモック化
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('/api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
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

    it('有効なデータで正常にレスポンスを返す', async () => {
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

      // コンソールログが呼ばれることを確認
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'お問い合わせを受信:',
        expect.objectContaining({
          name: '山田太郎',
          email: 'test@example.com',
          subject: 'bug',
          message: 'テストメッセージです',
          timestamp: expect.any(String),
        })
      );
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
        const request = new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({ ...validContactData, email }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // 無効なメールアドレステスト
      for (const email of invalidEmails) {
        const request = new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({ ...validContactData, email }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
      }
    });

    it('日本語文字を含むデータを正しく処理する', async () => {
      const japaneseData = {
        name: 'こうじ　太郎',
        email: 'koji@example.co.jp',
        subject: 'feature',
        message: 'こんにちは！日本語のメッセージです。よろしくお願いします。🎌',
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
      expect(data.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'お問い合わせを受信:',
        expect.objectContaining(japaneseData)
      );
    });
  });

  describe('GET', () => {
    it('GETメソッドで405エラーを返す', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data).toEqual({
        error: 'このエンドポイントはPOSTメソッドのみ対応しています',
      });
    });
  });
});
