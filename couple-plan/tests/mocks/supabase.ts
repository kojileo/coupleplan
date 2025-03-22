import { createClient } from '@supabase/supabase-js'
import { TEST_SUPABASE } from '../utils/test-constants'

// テスト用の環境変数設定 - 定数から取得
const SUPABASE_URL = TEST_SUPABASE.URL
const SUPABASE_ANON_KEY = TEST_SUPABASE.ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = TEST_SUPABASE.SERVICE_ROLE_KEY

// テスト用のモックSupabaseクライアント
export const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signInWithPassword: jest.fn(),
    resetPasswordForEmail: jest.fn(),
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

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 