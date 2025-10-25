'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-auth';

interface PartnerInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  connectedAt: string;
}

interface InvitationInfo {
  invitationCode: string;
  expiresAt: string;
}

interface VerifiedInvitation {
  invitationId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatar?: string;
}

export default function PartnerLinkagePage(): ReactElement {
  const { user } = useAuth();
  const router = useRouter();

  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [verifiedInvitation, setVerifiedInvitation] = useState<VerifiedInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPartnerInfo();
  }, []);

  const loadPartnerInfo = async () => {
    setIsLoading(true);
    try {
      // セッショントークンを取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return;
      }

      const response = await fetch('/api/partner', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.couple) {
        setPartner({
          id: data.couple.partnerId,
          name: data.couple.partnerName,
          email: data.couple.partnerEmail,
          avatar: data.couple.partnerAvatar,
          connectedAt: data.couple.connectedAt,
        });
      }
    } catch (error) {
      console.error('パートナー情報取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // セッショントークンを取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('認証が必要です。再度ログインしてください。');
        return;
      }

      const response = await fetch('/api/partner/invite', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '連携コードの生成に失敗しました');
      }

      setInvitation({
        invitationCode: data.invitationCode,
        expiresAt: data.expiresAt,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : '連携コードの生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (inputCode.length !== 6) {
      setError('6桁の数字を入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // セッショントークンを取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('認証が必要です。再度ログインしてください。');
        return;
      }

      const response = await fetch('/api/partner/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          invitationCode: inputCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '連携コードの検証に失敗しました');
      }

      setVerifiedInvitation({
        invitationId: data.invitationId,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        fromUserEmail: data.fromUserEmail,
        fromUserAvatar: data.fromUserAvatar,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : '連携コードの検証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!verifiedInvitation) return;

    setIsLoading(true);
    setError(null);

    try {
      // セッショントークンを取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('認証が必要です。再度ログインしてください。');
        return;
      }

      const response = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          invitationId: verifiedInvitation.invitationId,
          fromUserId: verifiedInvitation.fromUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'パートナー連携に失敗しました');
      }

      alert('パートナーとの連携が完了しました');
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'パートナー連携に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && !invitation && !verifiedInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="relative">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-rose-500 border-r-pink-500"
            role="status"
            aria-label="読み込み中"
          />
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-30" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* 既にパートナーがいる場合 */}
        {partner ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">連携済みパートナー</h2>
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={
                  partner.avatar && partner.avatar.startsWith('http')
                    ? partner.avatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=purple&color=fff`
                }
                alt={partner.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-rose-200"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{partner.name}</h3>
                <p className="text-gray-600">{partner.email}</p>
                <p className="text-sm text-gray-500">連携日: {formatDate(partner.connectedAt)}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              既にパートナーと連携されています。パートナーを変更する場合は、まず現在の連携を解除してください。
            </p>
          </div>
        ) : verifiedInvitation ? (
          /* 検証済み招待の確認 */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">パートナー連携の確認</h2>
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={
                  verifiedInvitation.fromUserAvatar &&
                  verifiedInvitation.fromUserAvatar.startsWith('http')
                    ? verifiedInvitation.fromUserAvatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(verifiedInvitation.fromUserName)}&background=purple&color=fff`
                }
                alt={verifiedInvitation.fromUserName}
                className="w-20 h-20 rounded-full object-cover border-4 border-rose-200"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {verifiedInvitation.fromUserName}
                </h3>
                <p className="text-gray-600">{verifiedInvitation.fromUserEmail}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">このユーザーとパートナー連携しますか？</p>
            <div className="flex space-x-4">
              <Button
                onClick={handleConnect}
                disabled={isLoading}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              >
                {isLoading ? '連携中...' : '連携する'}
              </Button>
              <Button
                onClick={() => {
                  setVerifiedInvitation(null);
                  setInputCode('');
                }}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* 連携コード生成 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">連携コードを生成</h2>
              <p className="text-gray-600 mb-6">
                パートナーに送る連携コードを生成します。生成されたコードをパートナーに共有してください。
              </p>

              {invitation ? (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">連携コード</p>
                    <p className="text-4xl font-mono font-bold text-rose-600 mb-4">
                      {invitation.invitationCode}
                    </p>
                    <p className="text-xs text-gray-500">
                      有効期限: {formatDate(invitation.expiresAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleGenerateCode}
                  disabled={isLoading}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                >
                  {isLoading ? '生成中...' : '連携コードを生成'}
                </Button>
              )}
            </div>

            {/* 連携コード入力 */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">連携コードで接続</h2>
              <p className="text-gray-600 mb-6">
                パートナーから受け取った連携コードを入力してください。
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    連携コード（6桁）
                  </label>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setInputCode(value);
                      setError(null);
                    }}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-3 text-2xl font-mono text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={handleVerifyCode}
                  disabled={isLoading || inputCode.length !== 6}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                >
                  {isLoading ? '検証中...' : '検証して連携'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
