import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'

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

    const { name } = await request.json()

    // Supabaseの認証データを更新
    const { error: authError } = await supabase.auth.updateUser({
      data: { name }
    })

    if (authError) {
      throw authError
    }

    // Prismaデータベースのプロフィールを更新
    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: { name },
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
