/**
 * パートナー連携ユーティリティ
 * 連携コード生成、検証、カップル関係の確立を管理
 */

import { createClient } from '@supabase/supabase-js';

/**
 * 6桁の連携コードを生成
 */
export function generateLinkageCode(): string {
  // 6桁のランダムな数字を生成
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 認証トークン付きSupabaseクライアントを作成
 */
function createAuthenticatedSupabaseClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase環境変数が設定されていません');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * 連携招待を作成
 */
export interface CreateInvitationResult {
  success: boolean;
  invitationCode?: string;
  invitationId?: string;
  expiresAt?: string;
  error?: string;
}

export async function createPartnerInvitation(
  userId: string,
  accessToken: string
): Promise<CreateInvitationResult> {
  try {
    const supabase = createAuthenticatedSupabaseClient(accessToken);

    // 既存の有効な招待があるか確認
    const { data: existingInvitations, error: fetchError } = await supabase
      .from('couple_invitations')
      .select('*')
      .eq('from_user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('既存招待の確認エラー:', fetchError);
    }

    // 既存の招待がある場合は無効化
    if (existingInvitations && existingInvitations.length > 0) {
      await supabase
        .from('couple_invitations')
        .update({ status: 'expired' })
        .eq('from_user_id', userId)
        .eq('status', 'active');
    }

    // 新しい連携コードを生成
    const invitationCode = generateLinkageCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24時間有効

    // 招待を作成
    const { data, error } = await supabase
      .from('couple_invitations')
      .insert({
        from_user_id: userId,
        invitation_code: invitationCode,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('招待作成エラー:', error);
      return {
        success: false,
        error: '招待の作成に失敗しました',
      };
    }

    return {
      success: true,
      invitationCode,
      invitationId: data.id,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error('招待作成処理エラー:', error);
    return {
      success: false,
      error: '招待の作成中にエラーが発生しました',
    };
  }
}

/**
 * 連携コードを検証
 */
export interface VerifyInvitationResult {
  success: boolean;
  invitationId?: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserEmail?: string;
  fromUserAvatar?: string;
  error?: string;
}

export async function verifyPartnerInvitation(
  invitationCode: string,
  currentUserId: string,
  accessToken: string
): Promise<VerifyInvitationResult> {
  try {
    const supabase = createAuthenticatedSupabaseClient(accessToken);

    // 連携コードで招待を検索
    const { data: invitation, error: invitationError } = await supabase
      .from('couple_invitations')
      .select('*')
      .eq('invitation_code', invitationCode)
      .eq('status', 'active')
      .single();

    if (invitationError || !invitation) {
      return {
        success: false,
        error: '無効な連携コードです',
      };
    }

    // 有効期限チェック
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      // 期限切れの招待を無効化
      await supabase
        .from('couple_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return {
        success: false,
        error: '連携コードの有効期限が切れています',
      };
    }

    // 自分自身の招待ではないか確認
    if (invitation.from_user_id === currentUserId) {
      return {
        success: false,
        error: '自分の連携コードは使用できません',
      };
    }

    // 招待者のプロフィール情報を取得
    const { data: fromUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('name, email, avatar_url')
      .eq('id', invitation.from_user_id)
      .single();

    if (profileError) {
      console.error('プロフィール取得エラー:', profileError);
      return {
        success: false,
        error: '招待者の情報を取得できませんでした',
      };
    }

    return {
      success: true,
      invitationId: invitation.id,
      fromUserId: invitation.from_user_id,
      fromUserName: fromUserProfile?.name || '不明',
      fromUserEmail: fromUserProfile?.email || '',
      fromUserAvatar: fromUserProfile?.avatar_url || undefined,
    };
  } catch (error) {
    console.error('招待検証処理エラー:', error);
    return {
      success: false,
      error: '検証中にエラーが発生しました',
    };
  }
}

/**
 * カップル関係を確立
 */
export interface CreateCoupleResult {
  success: boolean;
  coupleId?: string;
  error?: string;
}

export async function createCouple(
  invitationId: string,
  fromUserId: string,
  toUserId: string,
  accessToken: string
): Promise<CreateCoupleResult> {
  try {
    const supabase = createAuthenticatedSupabaseClient(accessToken);

    // 既にカップル関係があるかチェック
    const { data: existingCouple, error: fetchError } = await supabase
      .from('couples')
      .select('*')
      .or(
        `and(user1_id.eq.${fromUserId},user2_id.eq.${toUserId}),and(user1_id.eq.${toUserId},user2_id.eq.${fromUserId})`
      )
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('既存カップル確認エラー:', fetchError);
    }

    if (existingCouple) {
      return {
        success: false,
        error: 'すでにパートナーとして連携されています',
      };
    }

    // カップル関係を作成
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({
        user1_id: fromUserId,
        user2_id: toUserId,
        status: 'accepted',
      })
      .select()
      .single();

    if (coupleError) {
      console.error('カップル作成エラー:', coupleError);
      return {
        success: false,
        error: 'カップル関係の確立に失敗しました',
      };
    }

    // 招待を使用済みに更新
    await supabase.from('couple_invitations').update({ status: 'used' }).eq('id', invitationId);

    return {
      success: true,
      coupleId: couple.id,
    };
  } catch (error) {
    console.error('カップル作成処理エラー:', error);
    return {
      success: false,
      error: 'カップル関係の確立中にエラーが発生しました',
    };
  }
}

/**
 * カップル情報を取得
 */
export interface GetCoupleResult {
  success: boolean;
  couple?: {
    id: string;
    partnerId: string;
    partnerName: string;
    partnerEmail: string;
    partnerAvatar?: string;
    connectedAt: string;
  };
  error?: string;
}

export async function getCouple(userId: string, accessToken: string): Promise<GetCoupleResult> {
  try {
    const supabase = createAuthenticatedSupabaseClient(accessToken);

    // カップル関係を検索
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'accepted')
      .single();

    if (coupleError) {
      if (coupleError.code === 'PGRST116') {
        return {
          success: true,
          couple: undefined,
        };
      }
      console.error('カップル取得エラー:', coupleError);
      return {
        success: false,
        error: 'カップル情報の取得に失敗しました',
      };
    }

    // パートナーのIDを特定
    const partnerId = couple.user1_id === userId ? couple.user2_id : couple.user1_id;

    // パートナーのプロフィールを取得
    const { data: partnerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('name, email, avatar_url')
      .eq('id', partnerId)
      .single();

    if (profileError) {
      console.error('パートナープロフィール取得エラー:', profileError);
      return {
        success: false,
        error: 'パートナー情報の取得に失敗しました',
      };
    }

    return {
      success: true,
      couple: {
        id: couple.id,
        partnerId,
        partnerName: partnerProfile?.name || '不明',
        partnerEmail: partnerProfile?.email || '',
        partnerAvatar: partnerProfile?.avatar_url || undefined,
        connectedAt: couple.created_at,
      },
    };
  } catch (error) {
    console.error('カップル取得処理エラー:', error);
    return {
      success: false,
      error: 'カップル情報の取得中にエラーが発生しました',
    };
  }
}
