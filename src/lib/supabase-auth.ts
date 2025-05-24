import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません');
}

// Supabase URLの検証（本番環境のみ）
if (process.env.NODE_ENV === 'production') {
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error('無効なSupabase URLです');
  }

  // Supabase Anon Keyの基本的な検証（本番環境のみ）
  if (supabaseAnonKey.length < 100 || !supabaseAnonKey.startsWith('eyJ')) {
    throw new Error('無効なSupabase Anon Keyです');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
