import { NextRequest } from 'next/server'
import { GET } from '@/app/api/profile/[userId]/route'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-auth'
import { prisma } from '@/lib/db'
import type { Profile } from '@/types/profile'
import * as utils from '@/lib/utils'

// authのモック
jest.mock('@/lib/utils', () => ({
  auth: jest.fn(),
}))

// Supabaseのモック
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}))

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      findUnique: jest.fn(),
    },
  },
}))

describe('GET /api/profile/[userId]', () => {
  const mockUserId = 'test-user'
  const mockDate = new Date('2025-02-19T12:07:49.103Z')
  const mockProfile: Profile = {
    userId: mockUserId,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // デフォルトで認証成功を返す
    ;(utils.auth as jest.Mock).mockResolvedValue('valid-token')
    // デフォルトでユーザー情報を返す
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'current-user-id' } },
      error: null,
    })
    // デフォルトでプロフィール情報を返す
    ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockProfile)
  })

  it('認証されていない場合、401エラーを返す', async () => {
    // 認証ヘッダーなしのリクエスト
    const req = new NextRequest('http://localhost/api/profile/test-user')

    const res = await GET(req, {
      params: { userId: mockUserId }
    })
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data).toEqual({
      error: '認証が必要です',
    })
  })

  it('ユーザー認証に失敗した場合、401エラーを返す', async () => {
    // 認証エラーを設定
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('認証エラー'),
    })

    const req = new NextRequest('http://localhost/api/profile/test-user', {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    })

    const res = await GET(req, {
      params: { userId: mockUserId }
    })
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data).toEqual({
      error: '認証が必要です',
    })
  })

  it('プロフィール取得に成功した場合、プロフィールデータを返す', async () => {
    const req = new NextRequest('http://localhost/api/profile/test-user', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const res = await GET(req, {
      params: { userId: mockUserId }
    })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual({
      data: {
        ...mockProfile,
        createdAt: mockProfile.createdAt.toISOString(),
        updatedAt: mockProfile.updatedAt.toISOString(),
      },
    })

    // Prismaが正しく呼び出されたか確認
    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: mockUserId }
    })
  })

  it('プロフィールが見つからない場合、404エラーを返す', async () => {
    // プロフィールが見つからない場合をモック
    ;(prisma.profile.findUnique as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost/api/profile/test-user', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const res = await GET(req, {
      params: { userId: mockUserId }
    })
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data).toEqual({
      error: 'プロフィールが見つかりません',
    })
  })
})
