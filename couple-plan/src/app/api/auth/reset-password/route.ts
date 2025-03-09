import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスは必須です' },
        { status: 400 }
      )
    }

    // アプリケーションURLが設定されているか確認
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      console.error('環境変数 NEXT_PUBLIC_APP_URL が設定されていません')
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      )
    }

    // パスワードリセットメールを送信
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    })

    if (error) {
      console.error('Supabaseパスワードリセットエラー:', error)
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