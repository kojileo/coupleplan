'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface EditHistory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  type: 'insert' | 'delete' | 'replace' | 'format';
  position: number;
  content: string;
  previousContent?: string;
  timestamp: number;
  description: string;
}

interface Version {
  id: string;
  version: string;
  timestamp: number;
  userName: string;
  description: string;
  content: string;
}

export default function EditHistoryPage(): ReactElement {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'insert' | 'delete' | 'replace' | 'format'>('all');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const [editHistory] = useState<EditHistory[]>([
    {
      id: 'edit1',
      userId: 'user1',
      userName: 'あなた',
      userAvatar: '👤',
      userColor: '#3B82F6',
      type: 'insert',
      position: 0,
      content: '# ロマンチックな渋谷デートプラン',
      timestamp: Date.now() - 3600000, // 1時間前
      description: 'タイトルを追加',
    },
    {
      id: 'edit2',
      userId: 'user2',
      userName: 'パートナー',
      userAvatar: '💕',
      userColor: '#EF4444',
      type: 'insert',
      position: 50,
      content: '## 14:00-15:30 カフェタイム\n- Blue Bottle Coffee 渋谷店',
      timestamp: Date.now() - 3300000, // 55分前
      description: 'カフェタイムのセクションを追加',
    },
    {
      id: 'edit3',
      userId: 'user1',
      userName: 'あなた',
      userAvatar: '👤',
      userColor: '#3B82F6',
      type: 'replace',
      position: 100,
      content: '渋谷スカイ',
      previousContent: '東京タワー',
      timestamp: Date.now() - 3000000, // 50分前
      description: '展望台を渋谷スカイに変更',
    },
    {
      id: 'edit4',
      userId: 'user2',
      userName: 'パートナー',
      userAvatar: '💕',
      userColor: '#EF4444',
      type: 'replace',
      position: 150,
      content: '¥2,000',
      previousContent: '¥1,500',
      timestamp: Date.now() - 2700000, // 45分前
      description: '予算を¥2,000に変更',
    },
    {
      id: 'edit5',
      userId: 'user1',
      userName: 'あなた',
      userAvatar: '👤',
      userColor: '#3B82F6',
      type: 'insert',
      position: 200,
      content: '## 18:30-20:30 ディナー\n- 隠れ家イタリアン トラットリア',
      timestamp: Date.now() - 2400000, // 40分前
      description: 'ディナーセクションを追加',
    },
    {
      id: 'edit6',
      userId: 'user2',
      userName: 'パートナー',
      userAvatar: '💕',
      userColor: '#EF4444',
      type: 'replace',
      position: 250,
      content: 'フレンチ',
      previousContent: 'イタリアン',
      timestamp: Date.now() - 2100000, // 35分前
      description: 'レストランをフレンチに変更',
    },
    {
      id: 'edit7',
      userId: 'user1',
      userName: 'あなた',
      userAvatar: '👤',
      userColor: '#3B82F6',
      type: 'insert',
      position: 300,
      content: '## メモ\n- 雨の日は屋内施設を中心に調整可能',
      timestamp: Date.now() - 1800000, // 30分前
      description: 'メモセクションを追加',
    },
    {
      id: 'edit8',
      userId: 'user2',
      userName: 'パートナー',
      userAvatar: '💕',
      userColor: '#EF4444',
      type: 'format',
      position: 0,
      content: '全体のフォーマットを調整',
      timestamp: Date.now() - 1500000, // 25分前
      description: '見出しの階層を調整',
    },
  ]);

  const [versions] = useState<Version[]>([
    {
      id: 'v1',
      version: 'v1.0',
      timestamp: Date.now() - 3600000,
      userName: 'あなた',
      description: '初期バージョン',
      content: '# ロマンチックな渋谷デートプラン',
    },
    {
      id: 'v2',
      version: 'v1.1',
      timestamp: Date.now() - 2400000,
      userName: 'パートナー',
      description: 'カフェタイムとディナーを追加',
      content:
        '# ロマンチックな渋谷デートプラン\n\n## 14:00-15:30 カフェタイム\n- Blue Bottle Coffee 渋谷店\n\n## 18:30-20:30 ディナー\n- 隠れ家イタリアン トラットリア',
    },
    {
      id: 'v3',
      version: 'v1.2',
      timestamp: Date.now() - 1200000,
      userName: 'あなた',
      description: 'メモとフォーマット調整',
      content:
        '# ロマンチックな渋谷デートプラン\n\n## 14:00-15:30 カフェタイム\n- Blue Bottle Coffee 渋谷店\n- 香り高いコーヒーとおしゃれな空間でリラックスタイム\n- 予算: ¥2,000\n\n## 16:00-17:30 展望台\n- 渋谷スカイ\n- 東京の絶景を360度楽しめる展望台\n- 予算: ¥2,000\n\n## 18:30-20:30 ディナー\n- 隠れ家イタリアン トラットリア\n- 本格的なイタリア料理とワインでディナータイム\n- 予算: ¥11,000\n\n## メモ\n- 雨の日は屋内施設を中心に調整可能\n- 記念日サプライズを検討中\n- 写真撮影スポットを追加予定',
    },
  ]);

  const filteredHistory = editHistory.filter((edit) => {
    if (filter !== 'all' && edit.type !== filter) return false;

    const now = Date.now();
    switch (timeRange) {
      case 'today':
        return edit.timestamp > now - 24 * 60 * 60 * 1000;
      case 'week':
        return edit.timestamp > now - 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return edit.timestamp > now - 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  const handleRestoreVersion = (versionId: string) => {
    if (confirm('このバージョンに復元しますか？現在の編集内容は失われます。')) {
      alert('バージョンに復元しました');
      window.location.href = '/dashboard/collaboration';
    }
  };

  const handleRestoreEdit = (editId: string) => {
    if (confirm('この編集を元に戻しますか？')) {
      alert('編集を元に戻しました');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'insert':
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
      case 'delete':
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        );
      case 'replace':
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        );
      case 'format':
        return (
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'insert':
        return '追加';
      case 'delete':
        return '削除';
      case 'replace':
        return '置換';
      case 'format':
        return 'フォーマット';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">編集履歴</h1>
          <p className="text-xl text-gray-600">プランの編集履歴とバージョン管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左サイドバー: バージョン管理 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">バージョン</h3>
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedVersion === version.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVersion(version.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{version.version}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(version.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                    <p className="text-xs text-gray-500">by {version.userName}</p>
                    {selectedVersion === version.id && (
                      <Button
                        onClick={() => handleRestoreVersion(version.id)}
                        size="sm"
                        className="w-full mt-3"
                      >
                        このバージョンに復元
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* メインエリア: 編集履歴 */}
          <div className="lg:col-span-2">
            {/* フィルター */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">操作タイプ</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">すべて</option>
                    <option value="insert">追加</option>
                    <option value="delete">削除</option>
                    <option value="replace">置換</option>
                    <option value="format">フォーマット</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">期間</label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">すべて</option>
                    <option value="today">今日</option>
                    <option value="week">1週間</option>
                    <option value="month">1ヶ月</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 履歴一覧 */}
            <div className="space-y-4">
              {filteredHistory.map((edit) => (
                <div key={edit.id} className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: edit.userColor }}
                      >
                        {edit.userAvatar}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{edit.userName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(edit.timestamp).toLocaleString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(edit.type)}
                          <span className="text-sm text-gray-600">{getTypeLabel(edit.type)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{edit.description}</p>

                      {edit.previousContent && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">変更前:</p>
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-red-700 text-sm">{edit.previousContent}</p>
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">変更後:</p>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-green-700 text-sm">{edit.content}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleRestoreEdit(edit.id)}
                          variant="outline"
                          size="sm"
                        >
                          この編集を元に戻す
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500">該当する編集履歴がありません</p>
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            編集に戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
