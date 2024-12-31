import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'
import type { PlanRequest } from '@/types/api'

type Props = {
  params: {
    id: string
  }
}

// プラン詳細の取得
export async function GET(
  request: Request,
  { params }: Props
) {
  try {
    const { id: planId } = params
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // プランの取得（所有者または公開プラン）
    const plan = await prisma.plan.findFirst({
      where: {
        id: planId,
        OR: [
          { userId: user.id },
          { isPublic: true }
        ]
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: plan })
  } catch (error) {
    console.error('プラン取得エラー:', error)
    return NextResponse.json(
      { error: 'プランの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { isPublic } = await request.json()

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

// 以下のPUTとDELETEメソッドは変更なし