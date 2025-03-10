import { createClient } from '@supabase/supabase-js'

// createClientのモック
const mockCreateClient = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => {
    mockCreateClient(...args)
    return { /* モックのSupabaseクライアント */ }
  },
}))

describe('supabase-auth', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules() // モジュールキャッシュをリセット
    jest.clearAllMocks()
    // 環境変数をモック
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
    }
  })

  afterEach(() => {
    // 環境変数を元に戻す
    process.env = originalEnv
  })

  it('環境変数が設定されている場合、Supabaseクライアントを作成', () => {
    // isolateModulesを使用して、モジュールを隔離して実行
    jest.isolateModules(() => {
      require('@/lib/supabase-auth')
    })

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-key'
    )
  })

  it('環境変数が設定されていない場合、エラーを投げる', () => {
    // 環境変数を削除
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    expect(() => {
      jest.isolateModules(() => {
        require('@/lib/supabase-auth')
      })
    }).toThrow('Supabase環境変数が設定されていません')
  })
})
