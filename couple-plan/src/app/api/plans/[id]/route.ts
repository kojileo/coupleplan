import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'
import type { PlanRequest } from '@/types/api'

type Props = {
  params: Promise<{
    id: string
  }>
}

// プラン詳細の取得
export async function GET(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params
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
        id,
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

// プランの更新
export async function PUT(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const planData: PlanRequest = await request.json()
    const plan = await prisma.plan.update({
      where: {
        id,
        userId: user.id,
      },
      data: planData,
    })

    return NextResponse.json({ data: plan })
  } catch (error) {
    console.error('プラン更新エラー:', error)
    return NextResponse.json(
      { error: 'プランの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// プランの削除
export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    await prisma.plan.delete({
      where: {
        id,
        userId: user.id,
      },
    })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('プラン削除エラー:', error)
    return NextResponse.json(
      { error: 'プランの削除に失敗しました' },
      { status: 500 }
    )
  }
}