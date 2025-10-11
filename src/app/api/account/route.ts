import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase-auth';

/**
 * サーバー側専用の管理者用Supabaseクライアント
 *
 * 🚨 SECURITY WARNING:
 * - SERVICE_ROLE_KEYはRLS（Row Level Security）をバイパスする
 * - 全てのデータベース操作に無制限アクセス可能
 * - 絶対にクライアントサイド（フロントエンド）で使用しないこと
 * - NEXT_PUBLIC_プレフィックスを付けないこと
 * - ユーザー削除などの管理者操作でのみ使用
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      // Admin権限でのオートリフレッシュを無効化
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 認証ヘッダーの確認
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.error('認証ヘッダーがありません');
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      console.error('認証エラー:', authError);
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    if (!user) {
      console.error('ユーザーが見つかりません');
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const userId = user.id;
    console.log(`ユーザーID: ${userId} のアカウント削除を開始します`);

    try {
      // Supabaseクライアントを使用して関連データを削除
      console.log('データベースからユーザー関連データを削除します');

      // プロフィールを削除
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('プロフィール削除エラー:', profileError);
      } else {
        console.log('プロフィールを削除しました');
      }

      // カップル招待を削除
      const { error: invitationError } = await supabaseAdmin
        .from('couple_invitations')
        .delete()
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

      if (invitationError) {
        console.error('招待削除エラー:', invitationError);
      } else {
        console.log('カップル招待を削除しました');
      }

      // カップル関係を削除
      const { error: coupleError } = await supabaseAdmin
        .from('couples')
        .delete()
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (coupleError) {
        console.error('カップル関係削除エラー:', coupleError);
      } else {
        console.log('カップル関係を削除しました');
      }

      // Supabase Authからユーザーを削除
      console.log('Supabaseからユーザーを削除します');
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error('Supabaseユーザー削除エラー:', deleteAuthError);
        return NextResponse.json(
          { error: `Supabaseユーザー削除エラー: ${deleteAuthError.message}` },
          { status: 400 }
        );
      }

      console.log(`ユーザーID: ${userId} のアカウント削除が完了しました`);

      // レスポンスヘッダーにサインアウト指示を追加
      const response = NextResponse.json({ data: 'アカウントを削除しました' });
      response.headers.set('Clear-Site-Data', '"cookies", "storage"');
      return response;
    } catch (error) {
      // Supabaseの操作エラー
      console.error('データベース操作エラー:', error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: `データベースエラー: ${error.message}` },
          { status: 400 }
        );
      }
      throw error; // 予期せぬエラーは外側のcatchで処理
    }
  } catch (error) {
    console.error('アカウント削除エラー:', error);
    return NextResponse.json({ error: 'アカウント削除に失敗しました' }, { status: 500 });
  }
}
