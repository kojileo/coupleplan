import { POST } from '@/app/api/auth/login/route';
import { supabase } from '@/lib/supabase-auth';
import { NextRequest } from 'next/server';
import { TEST_USER, createMockSession } from '@tests/utils/test-constants';

// supabase のモック設定
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('ログインAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('有効な認証情報でログインできる', async () => {
    // モックデータの設定
    const mockUser = { id: TEST_USER.ID, email: TEST_USER.EMAIL };
    // 安全なモックセッションを生成
    const mockSession = createMockSession(mockUser.id);
    mockSession.user = mockUser; // ユーザー情報を上書き
    
    const loginData = {
      email: TEST_USER.EMAIL,
      // パスワードを直接テストコードに含めず、プレースホルダ文字列を使用
      password: '********'
    };
    
    // Supabaseのモック設定
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: mockSession, user: mockUser },
      error: null
    });
    
    // リクエストの作成 - 実際のパスワードは使用しない
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER.EMAIL,
        password: '********' // 実際のパスワードは使用しない
      })
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
    
    // Supabaseが呼び出されたことを検証するが、パスワード内容は検証しない
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        email: TEST_USER.EMAIL
      })
    );
  });

  it('無効な認証情報で401エラーを返す', async () => {
    // ログインデータ - 実際のパスワードは使用しない
    const loginData = {
      email: 'invalid@example.com',
      password: '********'
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
