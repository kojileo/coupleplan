import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'
import { createClient } from '@supabase/supabase-js'

// サーバー側専用の管理者用Supabaseクライアントを作成（service role key を利用）
// ※ クライアント側に公開しないように注意してください。
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    try {
      // Supabase Authからユーザーを削除
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteAuthError) {
        return NextResponse.json(
          { error: deleteAuthError.message },
          { status: 400 }
        )
      }

      // Prismaのデータベースからユーザープロフィールを削除
      await prisma.profile.delete({
        where: { userId: user.id }
      })

      return NextResponse.json({ data: 'アカウントを削除しました' })
    } catch (error) {
      // Supabase/Prismaの操作エラー
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      throw error // 予期せぬエラーは外側のcatchで処理
    }
  } catch (error) {
    console.error('アカウント削除エラー:', error)
    return NextResponse.json(
      { error: 'アカウント削除に失敗しました' },
      { status: 500 }
    )
  }
}
