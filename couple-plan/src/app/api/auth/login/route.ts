import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'
import type { LoginRequest } from '@/types/api'

export async function POST(request: Request) {
  try {
    const { email, password }: LoginRequest = await request.json()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'ログインに失敗しました' },
        { status: 401 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('ログインエラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}