import { createClient } from '@supabase/supabase-js'

// テスト用の環境変数設定
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase-url.com'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

// テスト用のモックSupabaseクライアント
export const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
    getSession: jest.fn().mockReturnValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockReturnValue({ data: { user: null }, error: null }),
    admin: {
      deleteUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
      listUsers: jest.fn().mockResolvedValue({ data: [], error: null }),
      getUserById: jest.fn().mockResolvedValue({ data: {}, error: null }),
      updateUserById: jest.fn().mockResolvedValue({ data: {}, error: null }),
      createUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
    }
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => callback({ data: [], error: null })),
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com' } }),
    }),
  },
}

// テスト用のモックSupabaseクライアント作成関数
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockImplementation(() => mockSupabase),
}))

export const supabase = createClient('https://test-supabase-url.com', 'test-anon-key') 