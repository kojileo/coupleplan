import { NextRequest } from 'next/server'
import { GET } from '@/app/api/profile/[userId]/route'
import { createClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile'
import * as utils from '@/lib/utils'

// authのモック
jest.mock('@/lib/utils', () => ({
  auth: jest.fn(),
}))

// Supabaseクライアントのモック
const mockSingle = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: mockSingle
        }))
      }))
    }))
  }))
}))

describe('GET /api/profile/[userId]', () => {
  const mockDate = new Date('2025-02-19T12:07:49.103Z')
  const mockProfile: Profile = {
    userId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: mockDate,  // Date型を直接使用
    updatedAt: mockDate,  // Date型を直接使用
  }

  let mockSupabase: ReturnType<typeof createClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = createClient('', '')
    // デフォルトで認証成功を返す
    ;(utils.auth as jest.Mock).mockResolvedValue('valid-token')
  })

  it('認証されていない場合、401エラーを返す', async () => {
    ;(utils.auth as jest.Mock).mockResolvedValueOnce(null)
    const req = new NextRequest('http://localhost/api/profile/test-user')

    const res = await GET(req, {
      params: Promise.resolve({ userId: 'test-user' })
    })
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data).toEqual({
      error: '認証が必要です',
    })
  })

  it('プロフィール取得に成功した場合、プロフィールデータを返す', async () => {
    mockSingle.mockResolvedValueOnce({
      data: mockProfile,
      error: null,
    })

    const req = new NextRequest('http://localhost/api/profile/test-user', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const res = await GET(req, {
      params: Promise.resolve({ userId: 'test-user' })
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
  })

  it('プロフィールが見つからない場合、404エラーを返す', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    const req = new NextRequest('http://localhost/api/profile/test-user', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const res = await GET(req, {
      params: Promise.resolve({ userId: 'test-user' })
    })
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data).toEqual({
      error: 'プロフィールが見つかりません',
    })
  })
})
