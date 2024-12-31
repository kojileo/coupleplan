import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'
import type { ShareInvitationRequest } from '@/types/api'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { email }: ShareInvitationRequest = await request.json()

    // 自分自身への共有を防ぐ
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })
    if (profile?.email === email) {
      return NextResponse.json(
        { error: '自分自身には共有できません' },
        { status: 400 }
      )
    }

    // プランの所有者確認
    const plan = await prisma.plan.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })
    if (!plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      )
    }

    // 共有招待の作成（既存の招待がある場合は上書き）
    const invitation = await prisma.shareInvitation.upsert({
      where: {
        planId_email: {
          planId: params.id,
          email: email,
        },
      },
      update: {
        status: 'PENDING',
      },
      create: {
        planId: params.id,
        email: email,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ data: invitation })
  } catch (error) {
    console.error('共有招待エラー:', error)
    return NextResponse.json(
      { error: '共有招待の作成に失敗しました' },
      { status: 500 }
    )
  }
}

// 共有招待の一覧取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const invitations = await prisma.shareInvitation.findMany({
      where: {
        planId: params.id,
      },
      include: {
        recipient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ data: invitations })
  } catch (error) {
    console.error('共有招待一覧取得エラー:', error)
    return NextResponse.json(
      { error: '共有招待の取得に失敗しました' },
      { status: 500 }
    )
  }
}