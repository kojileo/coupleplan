import { PrismaClient } from '@prisma/client'
import { SupabaseClient } from '@supabase/supabase-js'

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient | undefined
    }
  }
}

export type Database = PrismaClient
export type Auth = SupabaseClient