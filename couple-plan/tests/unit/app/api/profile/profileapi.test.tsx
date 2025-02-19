import { NextRequest } from 'next/server'
import { PUT } from '@/app/api/profile/route'
import { createClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile'
import * as utils from '@/lib/utils'

// authのモック
jest.mock('@/lib/utils', () => ({
  auth: jest.fn(),
}))

// Supabaseクライアントのモック
const mockUpsert = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      upsert: mockUpsert,
    })),
  })),
}))

describe('PUT /api/profile', () => {
  const mockDate = new Date('2025-02-19T12:07:49.103Z')
  const mockProfile: Profile = {
    userId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // デフォルトで認証成功を返す
    ;(utils.auth as jest.Mock).mockResolvedValue('valid-token')
  })

  it('認証されていない場合、401エラーを返す', async () => {
    ;(utils.auth as jest.Mock).mockResolvedValueOnce(null)  // 認証失敗を設定

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

  it('プロフィール更新に成功した場合、更新されたプロフィールを返す', async () => {
    ;(utils.auth as jest.Mock).mockResolvedValueOnce('valid-token')  // 認証成功を設定
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
    }
    const updatedProfile = { ...mockProfile, ...updateData }

    mockUpsert.mockResolvedValueOnce({
      data: [updatedProfile],
      error: null,
    })

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
    expect(data).toEqual({
      data: {
        ...updatedProfile,
        createdAt: updatedProfile.createdAt.toISOString(),
        updatedAt: updatedProfile.updatedAt.toISOString(),
      },
    })
  })

  it('プロフィール更新に失敗した場合、500エラーを返す', async () => {
    ;(utils.auth as jest.Mock).mockResolvedValueOnce('valid-token')  // 認証成功を設定
    mockUpsert.mockResolvedValueOnce({
      data: null,  // nullを返すように変更
      error: new Error('Database error'),
    })

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
