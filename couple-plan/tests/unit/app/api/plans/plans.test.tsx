import { GET, POST } from '@/app/api/plans/route'
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
      create: jest.fn(),
    },
  },
}))

describe('plans API', () => {
  const mockToken = 'test-token'
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  }

  const mockPlan = {
    id: 'plan-1',
    title: 'Test Plan',
    description: 'Test Description',
    date: '2024-01-01T00:00:00.000Z',
    location: 'Test Location',
    budget: 1000,
    isPublic: false,
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

  describe('GET /api/plans', () => {
    it('プラン一覧を正常に取得', async () => {
      // Supabaseの認証モック
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      // Prismaのモック
      ;(prisma.plan.findMany as jest.Mock).mockResolvedValueOnce([mockPlan])

      const request = new NextRequest('http://localhost/api/plans', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.data).toEqual([mockPlan])

      // Prismaのクエリを確認
      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          profile: { select: { name: true } },
          likes: true,
          _count: { select: { likes: true } },
        },
      })
    })

    it('認証トークンがない場合、401エラーを返す', async () => {
      const request = new NextRequest('http://localhost/api/plans')

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

      const request = new NextRequest('http://localhost/api/plans', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await GET(request)
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('認証が必要です')
    })
  })

  describe('POST /api/plans', () => {
    const newPlan = {
      title: 'New Plan',
      description: 'New Description',
      date: '2024-02-01T00:00:00.000Z',
      location: 'New Location',
      budget: 2000,
      isPublic: false,
    }

    it('プランを正常に作成', async () => {
      // Supabaseの認証モック
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      // Prismaのモック
      ;(prisma.plan.create as jest.Mock).mockResolvedValueOnce({
        ...mockPlan,
        ...newPlan,
      })

      const request = new NextRequest('http://localhost/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(newPlan),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.data).toMatchObject({
        ...newPlan,
        date: newPlan.date,
      })

      // Prismaの作成処理を確認
      expect(prisma.plan.create).toHaveBeenCalledWith({
        data: {
          ...newPlan,
          userId: mockUser.id,
        },
        include: {
          profile: { select: { name: true } },
          likes: true,
          _count: { select: { likes: true } },
        },
      })
    })

    it('認証エラーの場合、401エラーを返す', async () => {
      const request = new NextRequest('http://localhost/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlan),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('認証が必要です')
    })
  })
})
