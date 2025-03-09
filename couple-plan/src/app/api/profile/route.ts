import { createClient, PostgrestError } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/utils'
import type { Profile } from '@/types/profile'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function PUT(req: NextRequest) {
  try {
    const token = await auth(req)
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await req.json()
    const result = await supabase
      .from('profiles')
      .upsert(body) as { 
        data: Profile[] | null, 
        error: PostgrestError | null 
      }

    if (result.error) throw result.error
    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'プロフィールの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: result.data[0] })
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    return NextResponse.json(
      { error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    )
  }
}
