import { DELETE } from '@/app/api/account/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// モックの設定
jest.mock('@/lib/db', () => ({
  prisma: {
    $transaction: jest.fn(),
    plan: {
      deleteMany: jest.fn(),
    },
    like: {
      deleteMany: jest.fn(),
    },
    profile: {
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// コンソールエラーをモック化
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('DELETE /api/account', () => {
  const mockToken = 'test-token';
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常にアカウントを削除できる', async () => {
    // Supabaseのモック設定
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: mockUserId } },
      error: null,
    });

    // Prismaのモック設定
    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
      await callback(prisma);
    });
    (prisma.plan.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 2 });
    (prisma.like.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 5 });
    (prisma.profile.delete as jest.Mock).mockResolvedValueOnce({ id: 'profile-123' });

    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });

    // APIエンドポイントの呼び出し
    const res = await DELETE(req);
    const data = await res.json();

    // レスポンスの検証
    expect(res.status).toBe(200);
    expect(data).toEqual({ data: 'アカウントを削除しました' });

    // モックの呼び出しを検証
    expect(supabase.auth.getUser).toHaveBeenCalledWith(mockToken);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.plan.deleteMany).toHaveBeenCalledWith({
      where: { userId: mockUserId },
    });
    expect(prisma.like.deleteMany).toHaveBeenCalledWith({
      where: { userId: mockUserId },
    });
    expect(prisma.profile.delete).toHaveBeenCalledWith({
      where: { userId: mockUserId },
    });
  });

  it('認証ヘッダーがない場合は401エラーを返す', async () => {
    const req = new NextRequest('http://localhost:3000/api/account', {
      method: 'DELETE',
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: '認証が必要です' });
  });

  it('認証エラーの場合は401エラーを返す', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('認証エラー'),
    });

    const req = new NextRequest('http://localhost:3000/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: '認証が必要です' });
  });

  it('ユーザーが見つからない場合は404エラーを返す', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const req = new NextRequest('http://localhost:3000/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: 'ユーザーが見つかりません' });
  });

  it('データベースエラーの場合は400エラーを返す', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: mockUserId } },
      error: null,
    });

    (prisma.$transaction as jest.Mock).mockRejectedValueOnce(new Error('データベースエラー'));

    const req = new NextRequest('http://localhost:3000/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'データベースエラー: データベースエラー' });
  });

  it('予期せぬエラーの場合は500エラーを返す', async () => {
    (supabase.auth.getUser as jest.Mock).mockRejectedValueOnce(new Error('予期せぬエラー'));

    const req = new NextRequest('http://localhost:3000/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: 'アカウント削除に失敗しました' });
  });
}); 