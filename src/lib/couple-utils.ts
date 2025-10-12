// カップル連携関連のユーティリティ関数

import { createClient } from '@/lib/supabase/client';

/**
 * カップル連携状態の型定義
 */
export interface CoupleStatus {
  isLinked: boolean; // カップル連携済みかどうか
  coupleId: string | null; // カップルID
  partnerName: string | null; // パートナーの名前
  partnerEmail: string | null; // パートナーのメールアドレス
}

/**
 * 現在のユーザーのカップル連携状態を取得
 * @returns カップル連携状態
 */
export async function getCoupleStatus(): Promise<CoupleStatus> {
  const supabase = createClient();

  try {
    // 現在のユーザーを取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        isLinked: false,
        coupleId: null,
        partnerName: null,
        partnerEmail: null,
      };
    }

    // カップル情報を取得
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select(
        '*, user1:profiles!couples_user1_id_fkey(name, email), user2:profiles!couples_user2_id_fkey(name, email)'
      )
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .maybeSingle();

    if (coupleError || !couple) {
      return {
        isLinked: false,
        coupleId: null,
        partnerName: null,
        partnerEmail: null,
      };
    }

    // パートナーの情報を取得
    const isUser1 = couple.user1_id === user.id;
    const partner = isUser1 ? couple.user2 : couple.user1;

    return {
      isLinked: true,
      coupleId: couple.id,
      partnerName: partner?.name || null,
      partnerEmail: partner?.email || null,
    };
  } catch (error) {
    console.error('カップル連携状態の取得エラー:', error);
    return {
      isLinked: false,
      coupleId: null,
      partnerName: null,
      partnerEmail: null,
    };
  }
}

/**
 * プランがカップルプランかどうかを判定
 * @param coupleId プランのカップルID
 * @returns カップルプランの場合true
 */
export function isCouplePlan(coupleId: string | null): boolean {
  return coupleId !== null;
}

/**
 * カップル連携が必要な機能かどうかを判定
 * @param featureName 機能名
 * @returns カップル連携が必要な場合true
 */
export function requiresCoupleLink(featureName: string): boolean {
  const coupleOnlyFeatures = [
    'collaboration', // 共同編集
    'approval', // 承認ワークフロー
    'date-canvas', // デートキャンバス（カップル向け）
    'mediation', // AI仲裁
  ];

  return coupleOnlyFeatures.includes(featureName);
}

/**
 * カップル連携促進メッセージを取得
 * @param context コンテキスト（どの場面で表示するか）
 * @returns メッセージ文言
 */
export function getCoupleInviteMessage(context: 'plan-created' | 'feature-locked' | 'dashboard'): {
  title: string;
  description: string;
  actionText: string;
} {
  switch (context) {
    case 'plan-created':
      return {
        title: 'パートナーとプランを共有しませんか？',
        description:
          'カップル連携すると、このプランをパートナーと一緒に編集したり、リアルタイムで共有できます。',
        actionText: 'パートナーを招待',
      };
    case 'feature-locked':
      return {
        title: 'この機能はカップル連携が必要です',
        description:
          'パートナーと一緒に使える特別な機能です。カップル連携することで、共同編集や承認ワークフローなどが利用できます。',
        actionText: '今すぐ連携',
      };
    case 'dashboard':
      return {
        title: 'パートナーとつながろう',
        description:
          'カップル連携すると、二人で一緒にデートプランを作成・編集できます。過去のデート履歴も共有されます。',
        actionText: 'カップル連携を始める',
      };
    default:
      return {
        title: 'カップル連携',
        description: 'パートナーと一緒にcoupleplanを楽しみましょう',
        actionText: '連携する',
      };
  }
}

/**
 * 個人プランをカップルプランに変換できるかチェック
 * @param plan プラン情報
 * @param userId 現在のユーザーID
 * @returns 変換可能な場合true
 */
export function canConvertToCouplePlan(
  plan: { couple_id: string | null; created_by: string },
  userId: string
): boolean {
  // 個人プラン かつ 自分が作成者の場合のみ変換可能
  return plan.couple_id === null && plan.created_by === userId;
}
