import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // パスワードの検証
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上である必要があります' },
        { status: 400 }
      )
    }

    // Supabaseを使用してパスワードを更新
    // 注: このエンドポイントはクライアント側で直接supabase.auth.updateUserを呼び出すため、
    // 実際にはあまり使用されませんが、将来的な拡張のために用意しています
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return NextResponse.json(
        { error: 'パスワードの更新に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: 'パスワードが正常に更新されました'
    })
  } catch (error) {
    console.error('パスワード更新エラー:', error)
    return NextResponse.json(
      { error: 'パスワードの更新に失敗しました' },
      { status: 500 }
    )
  }
} 