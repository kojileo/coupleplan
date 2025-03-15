import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';

// ESLintルールを無効化
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
/* eslint-disable no-var */

declare global {
  interface Global {
    prisma: PrismaClient | undefined;
  }
}

export type Database = PrismaClient;
export type Auth = SupabaseClient;
