import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params
    
    // リクエストボディを取得
    const body = await request.json()
    const { isPublic } = body

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: '公開設定が不正です' },
        { status: 400 }
      )
    }

    // 認証チェック
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: '認証が失敗しました' }, { status: 401 })
    }

    // プランの更新
    const plan = await prisma.plan.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        isPublic,
      },
      include: {
        profile: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ data: plan })

  } catch (error) {
    console.error('公開設定更新エラー:', error)
    return NextResponse.json(
      { error: 'プランの公開設定に失敗しました' },
      { status: 500 }
    )
  }
}