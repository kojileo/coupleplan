import { POST } from '@/app/api/auth/reset-password/route'
import { supabase } from '@/lib/supabase-auth'
import { NextRequest } from 'next/server'

// supabase のモック設定
jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}))

describe('POST /api/auth/reset-password', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    // 環境変数をモック
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    }
  })

  afterEach(() => {
    // 環境変数を元に戻す
    process.env = originalEnv
  })

  it('パスワードリセットメールを正常に送信', async () => {
    ;(supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      data: {},
      error: null,
    })

    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.message).toBe('パスワードリセットメールを送信しました')

    // Supabaseの関数が正しく呼び出されたか確認
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      {
        redirectTo: 'http://localhost:3000/reset-password',
      }
    )
  })

  it('Supabaseからエラーが返された場合、400エラーを返す', async () => {
    ;(supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: new Error('Invalid email'),
    })

    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@example.com',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('パスワードリセットメールの送信に失敗しました')
  })

  it('予期せぬエラーが発生した場合、500エラーを返す', async () => {
    ;(supabase.auth.resetPasswordForEmail as jest.Mock).mockRejectedValueOnce(
      new Error('Unexpected error')
    )

    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('パスワードリセットに失敗しました')
  })

  it('メールアドレスが提供されていない場合、400エラーを返す', async () => {
    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // emailフィールドを意図的に省略
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('メールアドレスは必須です')
  })

  it('NEXT_PUBLIC_APP_URLが設定されていない場合、500エラーを返す', async () => {
    // 環境変数をクリア
    delete process.env.NEXT_PUBLIC_APP_URL

    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('サーバー設定エラー')
  })
})
