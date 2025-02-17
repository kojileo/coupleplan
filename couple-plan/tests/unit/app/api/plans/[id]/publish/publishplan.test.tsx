import { POST } from '@/app/api/plans/[id]/publish/route'
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
      update: jest.fn(),
    },
  },
}))

describe('plans/[id]/publish API', () => {
  const mockToken = 'test-token'
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  }

  const mockPlan = {
    id: 'plan-1',
    title: 'Test Plan',
    isPublic: false,
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

  it('プランの公開設定を正常に更新', async () => {
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    ;(prisma.plan.update as jest.Mock).mockResolvedValueOnce({
      ...mockPlan,
      isPublic: true,
    })

    const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      },
      body: JSON.stringify({ isPublic: true }),
    })

    const response = await POST(request, mockParams)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.data.isPublic).toBe(true)

    expect(prisma.plan.update).toHaveBeenCalledWith({
      where: {
        id: mockPlan.id,
        userId: mockUser.id,
      },
      data: {
        isPublic: true,
      },
      include: {
        profile: {
          select: { name: true },
        },
      },
    })
  })

  it('不正な公開設定値の場合、400エラーを返す', async () => {
    const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      },
      body: JSON.stringify({ isPublic: 'invalid' }),
    })

    const response = await POST(request, mockParams)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('公開設定が不正です')
  })

  it('認証トークンがない場合、401エラーを返す', async () => {
    const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isPublic: true }),
    })

    const response = await POST(request, mockParams)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('認証が必要です')
  })

  it('ユーザーが見つからない場合、401エラーを返す', async () => {
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('User not found'),
    })

    const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      },
      body: JSON.stringify({ isPublic: true }),
    })

    const response = await POST(request, mockParams)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('認証が失敗しました')
  })

  it('プランの更新に失敗した場合、500エラーを返す', async () => {
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    ;(prisma.plan.update as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    )

    const request = new NextRequest(`http://localhost/api/plans/${mockPlan.id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      },
      body: JSON.stringify({ isPublic: true }),
    })

    const response = await POST(request, mockParams)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('プランの公開設定に失敗しました')
  })
})
