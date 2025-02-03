import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'
import { createClient } from '@supabase/supabase-js'

// 管理者用のSupabaseクライアントを作成（service role key を利用）
// ※ 注意：このクライアントはサーバー側でのみ使用してください。
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // リクエストボディから名前とメールアドレスを取得
    const { name, email } = await request.json()

    const updateData: { name: string; email?: string } = { name }
    // メールアドレスが変更されている場合、管理者用クライアントで更新
    if (email && email !== user.email) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email })
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
      updateData.email = email
    }

    // Prisma側のプロフィール情報も更新
    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: updateData,
      select: {
        name: true,
        email: true,
      },
    })

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    return NextResponse.json(
      { error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    )
  }
}
