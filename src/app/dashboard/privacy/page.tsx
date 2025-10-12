'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-auth';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  adPersonalization: boolean;
  locationSharing: boolean;
  analyticsData: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
}

export default function PrivacyPage(): ReactElement {
  const { user } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    dataSharing: false,
    adPersonalization: false,
    locationSharing: false,
    analyticsData: false,
    marketingEmails: false,
    pushNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('プライバシー設定取得エラー:', error);
      } else if (data && data.preferences) {
        const prefs = data.preferences as any;
        if (prefs.privacy) {
          setSettings(prefs.privacy);
        }
      }
    } catch (error) {
      console.error('プライバシー設定読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // 現在のpreferencesを取得
      const { data: currentData, error: fetchError } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // preferencesを更新
      const updatedPreferences = {
        ...(currentData?.preferences || {}),
        privacy: settings,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('プライバシー設定を更新しました');
    } catch (error) {
      console.error('プライバシー設定更新エラー:', error);
      alert('更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.back()} variant="outline" size="sm">
                ← 戻る
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">プライバシー設定</h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* プロフィール公開設定 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">プロフィール公開設定</h2>
          <p className="text-gray-600 mb-6 text-sm">
            あなたのプロフィール情報を誰が見ることができるかを設定します
          </p>

          <div className="space-y-3">
            {[
              { value: 'public', label: '公開', desc: 'すべてのユーザーが閲覧可能' },
              { value: 'private', label: '非公開', desc: '他のユーザーには表示されません' },
              { value: 'friends', label: '友達のみ', desc: '友達のみが閲覧可能' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="profileVisibility"
                  value={option.value}
                  checked={settings.profileVisibility === option.value}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profileVisibility: e.target.value as 'public' | 'private' | 'friends',
                    })
                  }
                  className="mt-1 mr-3 text-rose-500 focus:ring-rose-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* データ共有設定 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">データ共有設定</h2>

          <div className="space-y-4">
            {[
              {
                key: 'dataSharing' as keyof PrivacySettings,
                label: 'データ共有',
                desc: 'サービス改善のための匿名データ共有',
              },
              {
                key: 'adPersonalization' as keyof PrivacySettings,
                label: '広告パーソナライゼーション',
                desc: 'あなたの興味に基づいたパーソナライズ広告',
              },
              {
                key: 'locationSharing' as keyof PrivacySettings,
                label: '位置情報共有',
                desc: '位置情報を基にしたサービス提供',
              },
              {
                key: 'analyticsData' as keyof PrivacySettings,
                label: '分析データ',
                desc: 'サービス利用状況の分析',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key] as boolean}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 通知設定 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">通知設定</h2>

          <div className="space-y-4">
            {[
              {
                key: 'marketingEmails' as keyof PrivacySettings,
                label: 'マーケティングメール',
                desc: '新機能やキャンペーンのお知らせ',
              },
              {
                key: 'pushNotifications' as keyof PrivacySettings,
                label: 'プッシュ通知',
                desc: '重要なお知らせの通知',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key] as boolean}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
