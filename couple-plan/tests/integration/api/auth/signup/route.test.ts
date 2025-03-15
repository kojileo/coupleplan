import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/signup/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      create: jest.fn(),
    },
  },
}));

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

describe('サインアップAPI統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('有効なデータでユーザー登録できる', async () => {
    // モックデータの設定
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const signupData = {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'password123'
    };
    const mockProfile = {
      id: 'profile-123',
      userId: mockUser.id,
      name: signupData.name,
      email: signupData.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Supabaseのモック設定
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    
    // Prismaのモック設定
    (prisma.profile.create as jest.Mock).mockResolvedValue(mockProfile);
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    expect(data).toEqual({ 
      data: { 
        profile: mockProfile,
        message: '確認メールを送信しました。メールを確認してください。'
      } 
    });
    
    // Supabaseが正しいパラメータで呼び出されたか検証
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          name: signupData.name,
        },
      },
    });
    
    // Prismaが正しいパラメータで呼び出されたか検証
    expect(prisma.profile.create).toHaveBeenCalledWith({
      data: {
        userId: mockUser.id,
        name: signupData.name,
        email: signupData.email,
      },
    });
  });

  it('短いパスワードで400エラーを返す', async () => {
    // 無効なデータ（短いパスワード）
    const signupData = {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: '12345' // 6文字未満
    };
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'パスワードは6文字以上で入力してください' });
    
    // Supabaseが呼び出されていないことを確認
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('無効なメールアドレスで400エラーを返す', async () => {
    // 無効なデータ（無効なメールアドレス）
    const signupData = {
      name: 'テストユーザー',
      email: 'invalid-email', // @がない
      password: 'password123'
    };
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    expect(data).toEqual({ error: '有効なメールアドレスを入力してください' });
    
    // Supabaseが呼び出されていないことを確認
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('Supabaseエラーで400エラーを返す', async () => {
    // 有効なデータ
    const signupData = {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'password123'
    };
    
    // Supabaseのモック設定（エラーを返す）
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'Email already registered' }
    });
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'Email already registered' });
    
    // Prismaが呼び出されていないことを確認
    expect(prisma.profile.create).not.toHaveBeenCalled();
  });

  it('Prisma一意制約エラーで400エラーを返す', async () => {
    // モックデータの設定
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const signupData = {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'password123'
    };
    
    // Supabaseのモック設定
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    
    // Prismaのモック設定（一意制約エラーを返す）
    (prisma.profile.create as jest.Mock).mockRejectedValue({
      code: 'P2002',
      meta: { target: ['email'] }
    });
    
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });
    
    // APIエンドポイントの呼び出し
    const res = await POST(req);
    const data = await res.json();
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'このメールアドレスは既に登録されています' });
  });
});