// Supabase クライアント（クライアントサイド用）
// 既存の supabase-auth.ts をラップして、パス互換性を提供

import { supabase } from '@/lib/supabase-auth';

export function createClient() {
  return supabase;
}
