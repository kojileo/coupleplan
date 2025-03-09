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
    // 認証ヘッダーの確認
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.error('認証ヘッダーがありません')
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error('認証エラー:', authError)
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    if (!user) {
      console.error('ユーザーが見つかりません')
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    const userId = user.id
    console.log(`ユーザーID: ${userId} のアカウント削除を開始します`)

    try {
      // トランザクションを使用して、関連データを削除
      console.log('データベースからユーザー関連データを削除します')
      await prisma.$transaction(async (prisma) => {
        // ユーザーが作成したプランを削除
        const deletedPlans = await prisma.plan.deleteMany({
          where: { userId }
        })
        console.log(`削除されたプラン数: ${deletedPlans.count}`)

        // ユーザーのいいねを削除
        const deletedLikes = await prisma.like.deleteMany({
          where: { userId }
        })
        console.log(`削除されたいいね数: ${deletedLikes.count}`)

        // ユーザーのプロフィールを削除
        const profile = await prisma.profile.delete({
          where: { userId }
        })
        console.log(`プロフィールを削除しました: ${profile.id}`)
      })

      // Supabase Authからユーザーを削除
      console.log('Supabaseからユーザーを削除します')
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (deleteAuthError) {
        console.error('Supabaseユーザー削除エラー:', deleteAuthError)
        return NextResponse.json(
          { error: `Supabaseユーザー削除エラー: ${deleteAuthError.message}` },
          { status: 400 }
        )
      }

      console.log(`ユーザーID: ${userId} のアカウント削除が完了しました`)
      return NextResponse.json({ data: 'アカウントを削除しました' })
    } catch (error) {
      // Supabase/Prismaの操作エラー
      console.error('データベース操作エラー:', error)
      if (error instanceof Error) {
        return NextResponse.json(
          { error: `データベースエラー: ${error.message}` },
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
