import { POST } from '@/app/api/auth/login/route';
import { supabase } from '@/lib/supabase-auth';
import { NextRequest } from 'next/server';

// supabase のモック設定
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正しい認証情報の場合、200 とユーザーデータを返す', async () => {
    const mockUserData = { user: { id: 'user1', email: 'test@example.com' } };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: mockUserData,
      error: null,
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data).toEqual(mockUserData);
  });

  it('認証失敗の場合、401 とエラーメッセージを返す', async () => {
    // 認証失敗時のモック設定
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    const payload = { email: 'wrong@example.com', password: 'wrongpassword' };
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();
    
    expect(response.status).toBe(401);
    expect(json.error).toBe('ログインに失敗しました');
  });

  it('例外発生時に 500 エラーを返す', async () => {
    // supabase 呼び出しで例外が発生するケース
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValueOnce(new Error('Unexpected error'));

    const payload = { email: 'test@example.com', password: 'password123' };
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('サーバーエラーが発生しました');
  });
});
