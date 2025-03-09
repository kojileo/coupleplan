import { DELETE } from '@/app/api/account/route'
import { supabase } from '@/lib/supabase-auth'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

// モックの設定
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}))

// Prismaのモックを単純化
jest.mock('@/lib/db', () => {
  // モックオブジェクト
  const mockPrisma = {
    profile: {
      delete: jest.fn().mockResolvedValue({ id: 'profile-1', userId: 'user-1' }),
    },
    plan: {
      deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    like: {
      deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return await callback(mockPrisma);
      }
      return Promise.all(callback);
    }),
  };

  return {
    prisma: mockPrisma,
  };
})

// Supabaseのモックを単純化
jest.mock('@supabase/supabase-js', () => {
  const mockAdminDeleteUser = jest.fn()
  const mockSupabaseAdmin = {
    auth: {
      admin: {
        deleteUser: mockAdminDeleteUser,
      },
    },
  }
  return {
    createClient: jest.fn(() => mockSupabaseAdmin),
  }
})

describe('DELETE /api/account', () => {
  const mockToken = 'test-token'
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  }

  let mockAdminDeleteUser: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
    
    // モック関数の参照を取得
    const mockClient = (createClient as jest.Mock)()
    mockAdminDeleteUser = mockClient.auth.admin.deleteUser
  })

  it('アカウントを正常に削除', async () => {
    // Supabaseの認証モック
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    // Supabase管理者APIモック
    mockAdminDeleteUser.mockResolvedValueOnce({
      error: null,
    })

    const request = new NextRequest('http://localhost/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })

    const response = await DELETE(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.data).toBe('アカウントを削除しました')

    // 各APIが正しく呼び出されたか確認
    expect(supabase.auth.getUser).toHaveBeenCalledWith(mockToken)
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.plan.deleteMany).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
    })
    expect(prisma.like.deleteMany).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
    })
    expect(prisma.profile.delete).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
    })
    expect(mockAdminDeleteUser).toHaveBeenCalledWith(mockUser.id)
  })

  it('認証トークンがない場合、401エラーを返す', async () => {
    const request = new NextRequest('http://localhost/api/account', {
      method: 'DELETE',
    })

    const response = await DELETE(request)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('認証が必要です')
  })

  it('ユーザーが見つからない場合、401エラーを返す', async () => {
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('User not found'),
    })

    const request = new NextRequest('http://localhost/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })

    const response = await DELETE(request)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('認証が必要です')
  })

  it('Supabase削除エラーの場合、400エラーを返す', async () => {
    // Supabaseの認証モック
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    // データベース操作は成功するがSupabase削除でエラー
    const mockError = new Error('Delete failed')
    mockAdminDeleteUser.mockResolvedValueOnce({
      error: mockError,
    })

    const request = new NextRequest('http://localhost/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })

    const response = await DELETE(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe(`Supabaseユーザー削除エラー: ${mockError.message}`)
  })

  it('データベース操作でエラーが発生した場合、400エラーを返す', async () => {
    // Supabaseの認証モック
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    // データベース操作でエラー
    const dbError = new Error('Database error')
    ;(prisma.$transaction as jest.Mock).mockRejectedValueOnce(dbError)

    const request = new NextRequest('http://localhost/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })

    const response = await DELETE(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe(`データベースエラー: ${dbError.message}`)
  })

  it('予期せぬエラーの場合、500エラーを返す', async () => {
    ;(supabase.auth.getUser as jest.Mock).mockRejectedValueOnce(
      new Error('Unexpected error')
    )

    const request = new NextRequest('http://localhost/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })

    const response = await DELETE(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('アカウント削除に失敗しました')
  })
})
