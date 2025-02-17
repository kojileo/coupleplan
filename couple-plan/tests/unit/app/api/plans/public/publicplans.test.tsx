import { GET } from '@/app/api/plans/public/route'
import { supabase } from '@/lib/supabase-auth'
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
    plan: {
      findMany: jest.fn(),
    },
  },
}))

describe('GET /api/plans/public', () => {
  const mockToken = 'test-token'
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  }

  const mockPublicPlan = {
    id: 'plan-1',
    title: 'Public Plan',
    description: 'Public Description',
    date: '2024-01-01T00:00:00.000Z',
    location: 'Public Location',
    budget: 1000,
    isPublic: true,
    userId: mockUser.id,
    createdAt: '2024-02-17T12:14:23.310Z',
    updatedAt: '2024-02-17T12:14:23.310Z',
    profile: { name: 'Test User' },
    likes: [],
    _count: { likes: 0 },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('公開プラン一覧を正常に取得', async () => {
    // Supabaseの認証モック
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    // Prismaのモック
    ;(prisma.plan.findMany as jest.Mock).mockResolvedValueOnce([mockPublicPlan])

    const request = new NextRequest('http://localhost/api/plans/public', {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })

    const response = await GET(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.data).toEqual([mockPublicPlan])

    // Prismaのクエリを確認
    expect(prisma.plan.findMany).toHaveBeenCalledWith({
      where: { isPublic: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        profile: { select: { name: true } },
        likes: true,
        _count: { select: { likes: true } },
      },
    })
  })

  it('認証トークンがない場合、401エラーを返す', async () => {
    const request = new NextRequest('http://localhost/api/plans/public')

    const response = await GET(request)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('認証が必要です')
  })

  it('ユーザーが見つからない場合、401エラーを返す', async () => {
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('User not found'),
    })

    const request = new NextRequest('http://localhost/api/plans/public', {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })

    const response = await GET(request)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('認証が必要です')
  })

  it('予期せぬエラーの場合、500エラーを返す', async () => {
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    ;(prisma.plan.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    )

    const request = new NextRequest('http://localhost/api/plans/public', {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })

    const response = await GET(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('公開プランの取得に失敗しました')
  })
})
