import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/utils'

// パラメータの型定義を修正
type Context = {
  params: Promise<{ userId: string }>
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// パラメータの型を Context に変更し、awaitを追加
export async function GET(req: NextRequest, context: Context) {
  try {
    const token = await auth(req)
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { userId } = await context.params
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (error) throw error
    if (!profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('プロフィール取得エラー:', error)
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    )
  }
}
