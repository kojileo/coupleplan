import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) {
      return NextResponse.json(
        { error: 'パスワードリセットメールの送信に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: 'パスワードリセットメールを送信しました'
    })
  } catch (error) {
    console.error('パスワードリセットエラー:', error)
    return NextResponse.json(
      { error: 'パスワードリセットに失敗しました' },
      { status: 500 }
    )
  }
}