'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface Conflict {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  position: number;
  originalContent: string;
  conflictingContent: string;
  timestamp: number;
  type: 'insert' | 'delete' | 'replace';
}

export default function ConflictResolutionPage(): ReactElement {
  const [conflicts] = useState<Conflict[]>([
    {
      id: 'conflict1',
      userId: 'user2',
      userName: 'パートナー',
      userAvatar: '💕',
      userColor: '#EF4444',
      position: 45,
      originalContent: '渋谷スカイ',
      conflictingContent: '東京タワー',
      timestamp: Date.now() - 300000, // 5分前
      type: 'replace',
    },
    {
      id: 'conflict2',
      userId: 'user2',
      userName: 'パートナー',
      userAvatar: '💕',
      userColor: '#EF4444',
      position: 120,
      originalContent: '¥2,000',
      conflictingContent: '¥1,500',
      timestamp: Date.now() - 180000, // 3分前
      type: 'replace',
    },
    {
      id: 'conflict3',
      userId: 'user2',
      userName: 'パートナー',
      userAvatar: '💕',
      userColor: '#EF4444',
      position: 200,
      originalContent: 'イタリアン',
      conflictingContent: 'フレンチ',
      timestamp: Date.now() - 60000, // 1分前
      type: 'replace',
    },
  ]);

  const [resolvedConflicts, setResolvedConflicts] = useState<Set<string>>(new Set());
  const [selectedResolution, setSelectedResolution] = useState<
    Record<string, 'original' | 'conflicting' | 'custom'>
  >({});
  const [customContent, setCustomContent] = useState<Record<string, string>>({});

  const handleResolutionSelect = (
    conflictId: string,
    resolution: 'original' | 'conflicting' | 'custom'
  ) => {
    setSelectedResolution((prev) => ({
      ...prev,
      [conflictId]: resolution,
    }));
  };

  const handleCustomContentChange = (conflictId: string, content: string) => {
    setCustomContent((prev) => ({
      ...prev,
      [conflictId]: content,
    }));
  };

  const handleResolveConflict = (conflictId: string) => {
    setResolvedConflicts((prev) => new Set([...prev, conflictId]));
  };

  const handleResolveAll = () => {
    const allConflictIds = conflicts.map((conflict) => conflict.id);
    setResolvedConflicts(new Set(allConflictIds));
  };

  const handleAcceptAllChanges = () => {
    const allConflictIds = conflicts.map((conflict) => conflict.id);
    const resolution: Record<string, 'conflicting'> = {};
    allConflictIds.forEach((id) => {
      resolution[id] = 'conflicting';
    });
    setSelectedResolution(resolution);
    setResolvedConflicts(new Set(allConflictIds));
  };

  const handleRejectAllChanges = () => {
    const allConflictIds = conflicts.map((conflict) => conflict.id);
    const resolution: Record<string, 'original'> = {};
    allConflictIds.forEach((id) => {
      resolution[id] = 'original';
    });
    setSelectedResolution(resolution);
    setResolvedConflicts(new Set(allConflictIds));
  };

  const getResolutionContent = (conflict: Conflict) => {
    const resolution = selectedResolution[conflict.id];
    switch (resolution) {
      case 'original':
        return conflict.originalContent;
      case 'conflicting':
        return conflict.conflictingContent;
      case 'custom':
        return customContent[conflict.id] || conflict.originalContent;
      default:
        return conflict.originalContent;
    }
  };

  const unresolvedConflicts = conflicts.filter((conflict) => !resolvedConflicts.has(conflict.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">編集競合の解決</h1>
          <p className="text-xl text-gray-600">
            同時編集による競合を解決して、最適なプランを作成しましょう
          </p>
        </div>

        {/* 一括操作 */}
        {unresolvedConflicts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">一括操作</h3>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleAcceptAllChanges}
                variant="outline"
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                すべての変更を承認
              </Button>
              <Button
                onClick={handleRejectAllChanges}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                すべての変更を拒否
              </Button>
              <Button
                onClick={handleResolveAll}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                すべて解決済みにする
              </Button>
            </div>
          </div>
        )}

        {/* 競合一覧 */}
        <div className="space-y-6">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className={`bg-white rounded-2xl shadow-xl p-6 ${
                resolvedConflicts.has(conflict.id) ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: conflict.userColor }}
                  >
                    {conflict.userAvatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{conflict.userName} の変更</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(conflict.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {resolvedConflicts.has(conflict.id) && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm font-medium">解決済み</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 元の内容 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">元の内容</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{conflict.originalContent}</p>
                  </div>
                </div>

                {/* 変更内容 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">変更内容</h4>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700">{conflict.conflictingContent}</p>
                  </div>
                </div>
              </div>

              {/* 解決オプション */}
              {!resolvedConflicts.has(conflict.id) && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">解決方法を選択</h4>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`resolution-${conflict.id}`}
                        value="original"
                        checked={selectedResolution[conflict.id] === 'original'}
                        onChange={() => handleResolutionSelect(conflict.id, 'original')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">元の内容を保持</span>
                        <p className="text-sm text-gray-500">{conflict.originalContent}</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`resolution-${conflict.id}`}
                        value="conflicting"
                        checked={selectedResolution[conflict.id] === 'conflicting'}
                        onChange={() => handleResolutionSelect(conflict.id, 'conflicting')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">変更内容を採用</span>
                        <p className="text-sm text-gray-500">{conflict.conflictingContent}</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`resolution-${conflict.id}`}
                        value="custom"
                        checked={selectedResolution[conflict.id] === 'custom'}
                        onChange={() => handleResolutionSelect(conflict.id, 'custom')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">カスタム内容</span>
                        <input
                          type="text"
                          value={customContent[conflict.id] || ''}
                          onChange={(e) => handleCustomContentChange(conflict.id, e.target.value)}
                          placeholder="新しい内容を入力"
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </label>
                  </div>

                  {/* プレビュー */}
                  {selectedResolution[conflict.id] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2">解決後の内容</h5>
                      <p className="text-blue-700">{getResolutionContent(conflict)}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleResolveConflict(conflict.id)}
                      disabled={!selectedResolution[conflict.id]}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      この競合を解決
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            編集に戻る
          </Button>
          <Button
            onClick={() => (window.location.href = '/dashboard/collaboration')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            disabled={unresolvedConflicts.length > 0}
          >
            すべて解決して編集を続行
          </Button>
        </div>
      </div>
    </div>
  );
}
