import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase-auth'

// パラメータの型定義を修正
type RouteParams = {
  params: Promise<{ userId: string }>
}

// Next.js App Routerの型定義に合わせて修正
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await params
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 指定されたユーザーIDのプロフィールを取得
    const profile = await prisma.profile.findUnique({
      where: {
        userId: userId
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('プロフィール取得エラー:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    )
  }
}