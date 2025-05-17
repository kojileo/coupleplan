import { NextRequest } from 'next/server';
import { DELETE } from '@/app/api/account/route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase-auth';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    $transaction: jest.fn(async (callback) => {
      return await callback({
        plan: {
          deleteMany: jest.fn().mockResolvedValue({ count: 2 })
        },
        like: {
          deleteMany: jest.fn().mockResolvedValue({ count: 3 })
        },
        profile: {
          delete: jest.fn().mockResolvedValue({ id: 'profile-1', userId: 'user-123' })
        }
      });
    })
  },
}));

// Supabaseのモックは既に tests/mocks/supabase.ts で設定済み

// @supabase/supabase-jsのモック
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn().mockImplementation(() => ({
      auth: {
        admin: {
          deleteUser: jest.fn().mockResolvedValue({ error: null })
        }
      }
    }))
  };
});

describe('アカウント管理API統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE /api/account', () => {
    it('認証ヘッダーがない場合は401エラーを返す', async () => {
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/account', {
        method: 'DELETE'
      });
      
      // APIエンドポイントの呼び出し
      const res = await DELETE(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('認証が無効な場合は401エラーを返す', async () => {
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('無効なトークン')
      });
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await DELETE(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(401);
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('ユーザーが見つからない場合は404エラーを返す', async () => {
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await DELETE(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'ユーザーが見つかりません' });
    });

    it('データベースエラーの場合は400エラーを返す', async () => {
      // モックデータの設定
      const mockUser = { id: 'user-123' };
      
      // Supabaseのモック設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Prismaのトランザクションをエラーに設定
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('データベースエラー'));
      
      // リクエストの作成
      const req = new NextRequest('http://localhost:3000/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token'
        }
      });
      
      // APIエンドポイントの呼び出し
      const res = await DELETE(req);
      const data = await res.json();
      
      // レスポンスの検証
      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'データベースエラー: データベースエラー' });
    });
  });
}); 