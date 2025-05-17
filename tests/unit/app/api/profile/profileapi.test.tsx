import { NextRequest } from 'next/server'
import { PUT, GET } from '@/app/api/profile/route'
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
      upsert: jest.fn(),
    },
  },
}))

describe('PUT /api/profile', () => {
  const mockUserId = 'test-user-id'
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
      data: { user: { id: mockUserId } },
      error: null,
    })
  })

  it('認証されていない場合、401エラーを返す', async () => {
    // 認証ヘッダーなしのリクエスト
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Name',
        email: 'updated@example.com',
      }),
    })

    const res = await PUT(req)
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

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer invalid-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Name',
        email: 'updated@example.com',
      }),
    })

    const res = await PUT(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data).toEqual({
      error: '認証が必要です',
    })
  })

  it('プロフィール更新に成功した場合、更新されたプロフィールを返す', async () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
    }
    const updatedProfile = { ...mockProfile, ...updateData }

    // Prismaのupsertをモック
    ;(prisma.profile.upsert as jest.Mock).mockResolvedValueOnce(updatedProfile)

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    const res = await PUT(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    
    // Date オブジェクトが JSON シリアライズされることを考慮
    expect(data).toEqual({
      data: {
        ...updatedProfile,
        createdAt: updatedProfile.createdAt.toISOString(),
        updatedAt: updatedProfile.updatedAt.toISOString(),
      },
    })

    // Prismaが正しく呼び出されたか確認
    expect(prisma.profile.upsert).toHaveBeenCalledWith({
      where: { userId: mockUserId },
      update: {
        name: updateData.name,
        email: updateData.email,
      },
      create: {
        userId: mockUserId,
        name: updateData.name,
        email: updateData.email,
      }
    })
  })

  it('プロフィール更新に失敗した場合、500エラーを返す', async () => {
    // Prismaのエラーをモック
    ;(prisma.profile.upsert as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Name',
        email: 'updated@example.com',
      }),
    })

    const res = await PUT(req)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data).toEqual({
      error: 'プロフィールの更新に失敗しました',
    })
  })
})

describe('GET /api/profile', () => {
  const mockUserId = 'test-user-id'
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
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    })
    // デフォルトでプロフィール情報を返す
    ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockProfile)
  })

  it('認証ヘッダーがない場合、401エラーを返す', async () => {
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'GET',
    })

    const res = await GET(req)
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

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'GET',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    })

    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data).toEqual({
      error: '認証が必要です',
    })
  })

  it('プロフィールが見つからない場合、404エラーを返す', async () => {
    // プロフィールが見つからないケース
    ;(prisma.profile.findUnique as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data).toEqual({
      error: 'プロフィールが見つかりません',
    })
  })

  it('プロフィール取得に成功した場合、プロフィール情報を返す', async () => {
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    // Date オブジェクトが JSON シリアライズされることを考慮
    expect(data).toEqual({
      data: {
        ...mockProfile,
        createdAt: mockProfile.createdAt.toISOString(),
        updatedAt: mockProfile.updatedAt.toISOString(),
      },
    })

    // Prismaが正しく呼び出されたか確認
    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: mockUserId },
    })
  })

  it('データベースエラーが発生した場合、500エラーを返す', async () => {
    // データベースエラーをモック
    ;(prisma.profile.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data).toEqual({
      error: 'プロフィールの取得に失敗しました',
    })
  })
})
