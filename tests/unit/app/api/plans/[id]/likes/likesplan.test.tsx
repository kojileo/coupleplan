import { POST, DELETE } from '@/app/api/plans/[id]/likes/route'
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
      findUnique: jest.fn(),
    },
    like: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe('plans/[id]/likes API', () => {
  const mockToken = 'test-token'
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  }

  const mockPlan = {
    id: 'plan-1',
    userId: 'other-user',
  }

  const mockLike = {
    id: 'like-1',
    planId: mockPlan.id,
    userId: mockUser.id,
    profile: {
      name: 'Test User',
    },
  }

  const mockParams = {
    params: Promise.resolve({ id: mockPlan.id }),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/plans/[id]/likes', () => {
    it('いいねを正常に作成', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      ;(prisma.plan.findUnique as jest.Mock).mockResolvedValueOnce(mockPlan)
      ;(prisma.like.create as jest.Mock).mockResolvedValueOnce(mockLike)

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/likes`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await POST(request, mockParams)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.data).toEqual(mockLike)

      expect(prisma.like.create).toHaveBeenCalledWith({
        data: {
          planId: mockPlan.id,
          userId: mockUser.id,
        },
        include: {
          profile: {
            select: { name: true },
          },
        },
      })
    })

    it('プランが存在しない場合、404エラーを返す', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      ;(prisma.plan.findUnique as jest.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/likes`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await POST(request, mockParams)
      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.error).toBe('プランが見つかりません')
    })

    it('既にいいね済みの場合、400エラーを返す', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      ;(prisma.plan.findUnique as jest.Mock).mockResolvedValueOnce(mockPlan)
      ;(prisma.like.create as jest.Mock).mockRejectedValueOnce(
        new Error('Unique constraint failed on the fields: (`planId`,`userId`)')
      )

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/likes`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await POST(request, mockParams)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('既にいいね済みです')
    })
  })

  describe('DELETE /api/plans/[id]/likes', () => {
    it('いいねを正常に削除', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      ;(prisma.like.delete as jest.Mock).mockResolvedValueOnce(mockLike)

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/likes`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await DELETE(request, mockParams)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.data).toBeNull()

      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: {
          planId_userId: {
            planId: mockPlan.id,
            userId: mockUser.id,
          },
        },
      })
    })

    it('いいねが存在しない場合、404エラーを返す', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      ;(prisma.like.delete as jest.Mock).mockRejectedValueOnce(
        new Error('Record to delete does not exist')
      )

      const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/likes`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await DELETE(request, mockParams)
      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.error).toBe('いいねが見つかりません')
    })
  })

  // 共通のエラーケース
  describe('共通のエラー処理', () => {
    const testCases = ['POST', 'DELETE'] as const
    type Method = typeof testCases[number]
    
    const handlers: Record<Method, typeof POST | typeof DELETE> = {
      POST,
      DELETE,
    }

    testCases.forEach(method => {
      it(`${method}: 認証トークンがない場合、401エラーを返す`, async () => {
        const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/likes`, {
          method,
        })

        const response = await handlers[method](request, mockParams)
        expect(response.status).toBe(401)

        const data = await response.json()
        expect(data.error).toBe('認証が必要です')
      })

      it(`${method}: ユーザーが見つからない場合、401エラーを返す`, async () => {
        ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
          data: { user: null },
          error: new Error('User not found'),
        })

        const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/likes`, {
          method,
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })

        const response = await handlers[method](request, mockParams)
        expect(response.status).toBe(401)

        const data = await response.json()
        expect(data.error).toBe('認証が必要です')
      })
    })
  })
})
