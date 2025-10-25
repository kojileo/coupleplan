'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-auth';
import { validateProfileForm, type ProfileFormData } from '@/lib/validation';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  preferences: {
    favoriteCategories: string[];
    budgetRange: string;
    timePreference: string;
    activityLevel: string;
  };
  stats: {
    totalPlans: number;
    completedPlans: number;
    favoriteSpots: number;
    memberSince: number;
  };
  partner?: {
    name: string;
    email: string;
    avatar?: string;
    connectedAt: number;
  };
}

export default function ProfilePage(): ReactElement {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    location: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    location?: string;
  }>({});

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Supabaseからプロフィールデータを取得
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // プロフィールデータが存在しない場合はデフォルト値を使用
      const defaultProfile: UserProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー',
        email: user.email || '',
        avatar:
          user.user_metadata?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || 'User')}&background=rose&color=fff`,
        bio: profileData?.bio || '',
        location: profileData?.location || '',
        preferences: {
          favoriteCategories: profileData?.favorite_categories || ['カフェ', 'レストラン'],
          budgetRange: profileData?.budget_range || '¥5,000-¥15,000',
          timePreference: profileData?.time_preference || '午後から夕方',
          activityLevel: profileData?.activity_level || '中程度',
        },
        stats: {
          totalPlans: profileData?.total_plans || 0,
          completedPlans: profileData?.completed_plans || 0,
          favoriteSpots: profileData?.favorite_spots || 0,
          memberSince: new Date(user.created_at).getTime(),
        },
        partner: profileData?.partner_id
          ? {
              name: profileData?.partner_name || 'パートナー',
              email: profileData?.partner_email || '',
              avatar:
                profileData?.partner_avatar ||
                'https://ui-avatars.com/api/?name=Partner&background=purple&color=fff',
              connectedAt: profileData?.connected_at || Date.now(),
            }
          : undefined,
      };

      setProfile(defaultProfile);
      setEditForm({
        name: defaultProfile.name,
        email: defaultProfile.email || '',
        location: defaultProfile.location || '',
      });
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error);
      // エラー時はデフォルトプロフィールを表示
      const fallbackProfile: UserProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー',
        email: user.email || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || 'User')}&background=rose&color=fff`,
        bio: '',
        location: '',
        preferences: {
          favoriteCategories: ['カフェ', 'レストラン'],
          budgetRange: '¥5,000-¥15,000',
          timePreference: '午後から夕方',
          activityLevel: '中程度',
        },
        stats: {
          totalPlans: 0,
          completedPlans: 0,
          favoriteSpots: 0,
          memberSince: new Date(user.created_at).getTime(),
        },
      };
      setProfile(fallbackProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    // バリデーション
    const formData: ProfileFormData = {
      name: editForm.name,
      email: editForm.email,
      location: editForm.location,
    };

    const validation = validateProfileForm(formData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    // バリデーションエラーをクリア
    setValidationErrors({});

    try {
      // 空文字列やundefinedをnullに変換
      const profileData = {
        user_id: user.id,
        name: editForm.name,
        email: editForm.email,
        location: editForm.location && editForm.location.trim() !== '' ? editForm.location : null,
        updated_at: new Date().toISOString(),
      };

      console.log('保存するデータ:', profileData);

      // まず既存のプロフィールを確認
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let data, error;

      if (checkError && checkError.code === 'PGRST116') {
        // プロフィールが存在しない場合は新規作成
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select();
        data = insertData;
        error = insertError;
      } else if (checkError) {
        // その他のエラー
        throw checkError;
      } else {
        // プロフィールが存在する場合は更新
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({
            name: profileData.name,
            email: profileData.email,
            location: profileData.location,
            updated_at: profileData.updated_at,
          })
          .eq('user_id', user.id)
          .select();
        data = updateData;
        error = updateError;
      }

      console.log('Supabaseレスポンス:', { data, error });

      if (error) throw error;

      // ローカル状態を更新
      setProfile({
        ...profile,
        name: editForm.name,
        email: editForm.email,
        location: editForm.location,
      });

      alert('プロフィールを更新しました');
      setIsEditing(false);
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email || '',
        location: profile.location || '',
      });
    }
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      alert('パスワードリセットメールを送信しました。メールをご確認ください。');
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      alert('パスワードリセットに失敗しました');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('アカウントを完全に削除しますか？この操作は取り消せません。')) {
      try {
        // セッショントークンを取得
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('認証が必要です。再度ログインしてください。');
        }

        // アカウント削除APIを呼び出し
        const response = await fetch('/api/account', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'アカウント削除に失敗しました');
        }

        // 強制的にサインアウト
        await supabase.auth.signOut();

        // ローカルストレージをクリア
        localStorage.clear();
        sessionStorage.clear();

        alert('アカウントを完全に削除しました。');
        window.location.href = '/';
      } catch (error) {
        console.error('アカウント削除エラー:', error);
        alert(
          error instanceof Error
            ? error.message
            : 'アカウント削除に失敗しました。サポートにお問い合わせください。'
        );
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">プロフィールが見つかりません</h1>
          <Button onClick={() => window.history.back()} variant="outline">
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
              <p className="text-gray-600 mt-2">アカウント情報と設定を管理</p>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline">
                  編集
                </Button>
              ) : (
                <>
                  <Button onClick={handleCancel} variant="outline">
                    キャンセル
                  </Button>
                  <Button onClick={handleSave}>保存</Button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* プロフィール情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">基本情報</h2>
            {isEditing && <div className="text-sm text-gray-500">編集モード</div>}
          </div>
          <div className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => {
                      setEditForm({ ...editForm, name: e.target.value });
                      setValidationErrors({ ...validationErrors, name: undefined });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => {
                      setEditForm({ ...editForm, email: e.target.value });
                      setValidationErrors({ ...validationErrors, email: undefined });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">居住地</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => {
                      setEditForm({ ...editForm, location: e.target.value });
                      setValidationErrors({ ...validationErrors, location: undefined });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${validationErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                  <div>📍 {profile.location}</div>
                  <div>📧 {profile.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* パートナー情報 */}
        {profile.partner && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">パートナー情報</h3>
            <div className="flex items-center space-x-4">
              <img
                src={
                  profile.partner.avatar && profile.partner.avatar.startsWith('http')
                    ? profile.partner.avatar
                    : 'https://ui-avatars.com/api/?name=Partner&background=purple&color=fff'
                }
                alt={profile.partner.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-rose-200"
              />
              <div>
                <h4 className="text-xl font-bold text-gray-900">{profile.partner.name}</h4>
                <p className="text-gray-600">{profile.partner.email}</p>
                <p className="text-sm text-gray-500">
                  連携日: {formatDate(profile.partner.connectedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">統計情報</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{profile.stats.totalPlans}</div>
              <div className="text-sm text-gray-600">作成プラン数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {profile.stats.completedPlans}
              </div>
              <div className="text-sm text-gray-600">完了プラン数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">{profile.stats.favoriteSpots}</div>
              <div className="text-sm text-gray-600">お気に入りスポット</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor((Date.now() - profile.stats.memberSince) / (365 * 24 * 60 * 60 * 1000))}
              </div>
              <div className="text-sm text-gray-600">利用年数</div>
            </div>
          </div>
        </div>

        {/* アカウント設定 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">アカウント設定</h3>
          <div className="space-y-4">
            <Button
              onClick={handleChangePassword}
              variant="outline"
              className="w-full justify-start"
            >
              🔒 パスワードを変更
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              🗑️ アカウントを削除
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
