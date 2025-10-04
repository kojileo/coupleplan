'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-auth';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  birthday?: string;
  anniversary?: string;
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
    bio: '',
    location: '',
    birthday: '',
    anniversary: '',
  });

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
        .eq('id', user.id)
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
        birthday: profileData?.birthday || '',
        anniversary: profileData?.anniversary || '',
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
        bio: defaultProfile.bio || '',
        location: defaultProfile.location || '',
        birthday: defaultProfile.birthday || '',
        anniversary: defaultProfile.anniversary || '',
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
        birthday: '',
        anniversary: '',
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

    try {
      // Supabaseにプロフィールデータを保存
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        birthday: editForm.birthday,
        anniversary: editForm.anniversary,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // ローカル状態を更新
      setProfile({
        ...profile,
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        birthday: editForm.birthday,
        anniversary: editForm.anniversary,
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
        bio: profile.bio || '',
        location: profile.location || '',
        birthday: profile.birthday || '',
        anniversary: profile.anniversary || '',
      });
    }
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
    if (confirm('アカウントを削除しますか？この操作は取り消せません。')) {
      try {
        // プロフィールデータを削除
        await supabase.from('profiles').delete().eq('id', user?.id);

        // アカウントを削除
        const { error } = await supabase.auth.admin.deleteUser(user?.id || '');

        if (error) throw error;

        alert('アカウントを削除しました');
        window.location.href = '/';
      } catch (error) {
        console.error('アカウント削除エラー:', error);
        alert('アカウント削除に失敗しました');
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
      {/* ヘッダー */}
      <div className="bg-white shadow-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={() => window.history.back()} variant="outline" size="sm">
                ← 戻る
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  編集
                </Button>
              ) : (
                <>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    キャンセル
                  </Button>
                  <Button onClick={handleSave} size="sm">
                    保存
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* プロフィール情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <img
                src={
                  profile.avatar && profile.avatar.startsWith('http')
                    ? profile.avatar
                    : 'https://ui-avatars.com/api/?name=User&background=rose&color=fff'
                }
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-rose-200"
              />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">自己紹介</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">居住地</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">誕生日</label>
                      <input
                        type="date"
                        value={editForm.birthday}
                        onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">記念日</label>
                    <input
                      type="date"
                      value={editForm.anniversary}
                      onChange={(e) => setEditForm({ ...editForm, anniversary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                  <p className="text-gray-600 mb-4">{profile.bio}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>📍 {profile.location}</div>
                    <div>📧 {profile.email}</div>
                    {profile.birthday && <div>🎂 {profile.birthday}</div>}
                    {profile.anniversary && <div>💕 {profile.anniversary}</div>}
                  </div>
                </div>
              )}
            </div>
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

        {/* 好み設定 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">好み設定</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">好きなカテゴリ</h4>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.favoriteCategories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-rose-100 text-rose-800 text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">予算範囲</h4>
              <p className="text-gray-600">{profile.preferences.budgetRange}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">時間の好み</h4>
              <p className="text-gray-600">{profile.preferences.timePreference}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">アクティビティレベル</h4>
              <p className="text-gray-600">{profile.preferences.activityLevel}</p>
            </div>
          </div>
        </div>

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
