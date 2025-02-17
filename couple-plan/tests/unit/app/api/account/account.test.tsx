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

jest.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      delete: jest.fn(),
    },
  },
}))

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

    // Prismaのモック
    ;(prisma.profile.delete as jest.Mock).mockResolvedValueOnce({
      id: 'profile-1',
      userId: mockUser.id,
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
    expect(mockAdminDeleteUser).toHaveBeenCalledWith(mockUser.id)
    expect(prisma.profile.delete).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
    })
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
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

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
    expect(data.error).toBe(mockError.message)
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
