import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { supabase } from '@/lib/supabase-auth';

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

describe('ログインAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('有効な認証情報でログインできる', async () => {
    // モックデータの設定
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { access_token: 'test-token', user: mockUser };
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    // Supabaseのモック設定
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: mockSession, user: mockUser },
      error: null
    });
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    expect(data).toEqual({ 
      data: { 
        session: mockSession, 
        user: mockUser 
      } 
    });
    
    // Supabaseが正しいパラメータで呼び出されたか検証
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: loginData.email,
      password: loginData.password
    });
  });

  it('無効な認証情報で401エラーを返す', async () => {
    // ログインデータ
    const loginData = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    };
    
    // Supabaseのモック設定
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' }
    });
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(401);
    expect(data).toEqual({ error: 'ログインに失敗しました' });
  });

  it('無効なリクエストで500エラーを返す', async () => {
    // 無効なリクエスト（JSONではない）
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid-json'
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    expect(data).toEqual({ error: 'サーバーエラーが発生しました' });
  });
}); 