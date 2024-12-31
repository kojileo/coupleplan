import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'
import type { PlanRequest } from '@/types/api'

// プラン一覧の取得
export async function GET(request: Request) {
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

    const plans = await prisma.plan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: plans })
  } catch (error) {
    console.error('プラン取得エラー:', error)
    return NextResponse.json(
      { error: 'プランの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// プランの作成
export async function POST(request: Request) {
  try {
    // 1. 認証チェック
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 2. プロフィール取得
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりません' },
        { status: 404 }
      )
    }

    // 3. リクエストデータの取得と変換
    const data: PlanRequest = await request.json()
    
    // 4. プラン作成
    const plan = await prisma.plan.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : null,
        budget: data.budget,
        location: data.location,
        userId: profile.userId,  // profile.userIdを使用
      },
    })

    return NextResponse.json({ data: plan })
  } catch (error) {
    // 5. エラーハンドリングの修正
    console.error('プラン作成エラー:', error)
    return NextResponse.json(
      { error: 'プランの作成に失敗しました' },
      { status: 500 }
    )
  }
}