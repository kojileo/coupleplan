import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/reset-password/route';
import { supabase } from '@/lib/supabase-auth';

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

// 環境変数のモック
const originalEnv = process.env;

describe('パスワードリセットAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 環境変数のモック
    process.env = { ...originalEnv, NEXT_PUBLIC_APP_URL: 'http://localhost:3000' };
  });

  afterEach(() => {
    // 環境変数を元に戻す
    process.env = originalEnv;
  });

  it('有効なメールアドレスでパスワードリセットメールを送信できる', async () => {
    // リクエストデータ
    const resetData = {
      email: 'test@example.com'
    };
    
    // Supabaseのモック設定
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: {},
      error: null
    });
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resetData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    expect(data).toEqual({ message: 'パスワードリセットメールを送信しました' });
    
    // Supabaseが正しいパラメータで呼び出されたか検証
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      resetData.email,
      {
        redirectTo: 'http://localhost:3000/reset-password',
      }
    );
  });

  it('メールアドレスがない場合は400エラーを返す', async () => {
    // 無効なリクエストデータ（メールアドレスなし）
    const resetData = {
      email: ''
    };
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resetData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'メールアドレスは必須です' });
    
    // Supabaseが呼び出されていないことを確認
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('環境変数が設定されていない場合は500エラーを返す', async () => {
    // 環境変数を削除
    delete process.env.NEXT_PUBLIC_APP_URL;
    
    // リクエストデータ
    const resetData = {
      email: 'test@example.com'
    };
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resetData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    expect(data).toEqual({ error: 'サーバー設定エラー' });
    
    // Supabaseが呼び出されていないことを確認
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('Supabaseエラーで400エラーを返す', async () => {
    // リクエストデータ
    const resetData = {
      email: 'test@example.com'
    };
    
    // Supabaseのモック設定（エラーを返す）
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'User not found' }
    });
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resetData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'パスワードリセットメールの送信に失敗しました' });
  });

  it('無効なリクエストで500エラーを返す', async () => {
    // 無効なリクエスト（JSONではない）
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
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
    expect(data).toEqual({ error: 'パスワードリセットに失敗しました' });
  });
}); 