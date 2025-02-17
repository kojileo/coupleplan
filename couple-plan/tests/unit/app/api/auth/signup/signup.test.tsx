import { POST } from '@/app/api/auth/signup/route'
import { supabase } from '@/lib/supabase-auth'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

// モックの設定
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      create: jest.fn(),
    },
  },
}))

// PrismaClientKnownRequestErrorのモック
class MockPrismaError extends Error {
  code: string
  clientVersion: string

  constructor(message: string, meta: { code: string; clientVersion: string }) {
    super(message)
    this.name = 'PrismaClientKnownRequestError'
    this.code = meta.code
    this.clientVersion = meta.clientVersion
  }
}

describe('POST /api/auth/signup', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  }

  const mockProfile = {
    userId: mockUser.id,
    name: 'Test User',
    email: mockUser.email,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常にユーザー登録を完了', async () => {
    // Supabaseのモック
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    // Prismaのモック
    ;(prisma.profile.create as jest.Mock).mockResolvedValueOnce(mockProfile)

    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.data.profile).toEqual(mockProfile)
    expect(data.data.message).toBe('確認メールを送信しました。メールを確認してください。')
  })

  it('パスワードが6文字未満の場合、400エラーを返す', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '12345',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('パスワードは6文字以上で入力してください')
  })

  it('無効なメールアドレスの場合、400エラーを返す', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('有効なメールアドレスを入力してください')
  })

  it('Supabase認証エラーの場合、400エラーを返す', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Auth error' },
    })

    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Auth error')
  })

  it('メールアドレスが既に登録されている場合、400エラーを返す', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    ;(prisma.profile.create as jest.Mock).mockRejectedValueOnce(
      new MockPrismaError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '4.7.1',
      })
    )

    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('このメールアドレスは既に登録されています')
  })

  it('予期せぬエラーの場合、500エラーを返す', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockRejectedValueOnce(
      new Error('Unexpected error')
    )

    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('ユーザー登録に失敗しました。もう一度お試しください。')
  })
})
