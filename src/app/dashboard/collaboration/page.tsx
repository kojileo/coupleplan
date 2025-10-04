'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  cursorPosition?: number;
}

interface EditOperation {
  id: string;
  userId: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  timestamp: number;
}

interface Conflict {
  id: string;
  userId: string;
  position: number;
  content: string;
  timestamp: number;
}

export default function CollaborationPage(): ReactElement {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user1',
      name: 'あなた',
      avatar: '👤',
      color: '#3B82F6',
      isOnline: true,
    },
    {
      id: 'user2',
      name: 'パートナー',
      avatar: '💕',
      color: '#EF4444',
      isOnline: true,
    },
  ]);
  const [content, setContent] = useState(`# ロマンチックな渋谷デートプラン

## 14:00-15:30 カフェタイム
- Blue Bottle Coffee 渋谷店
- 香り高いコーヒーとおしゃれな空間でリラックスタイム
- 予算: ¥2,000

## 16:00-17:30 展望台
- 渋谷スカイ
- 東京の絶景を360度楽しめる展望台
- 予算: ¥2,000

## 18:30-20:30 ディナー
- 隠れ家イタリアン トラットリア
- 本格的なイタリア料理とワインでディナータイム
- 予算: ¥11,000

## メモ
- 雨の日は屋内施設を中心に調整可能
- 記念日サプライズを検討中
- 写真撮影スポットを追加予定`);

  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editHistory, setEditHistory] = useState<EditOperation[]>([]);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set(['user1']));

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket接続のシミュレーション
    const connectWebSocket = () => {
      setIsConnected(true);
      // 実際の実装ではWebSocketを使用
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // 編集操作を記録
    const operation: EditOperation = {
      id: Date.now().toString(),
      userId: 'user1',
      type: 'replace',
      position: 0,
      content: newContent,
      timestamp: Date.now(),
    };

    setEditHistory((prev) => [...prev, operation]);

    // 競合検出のシミュレーション
    if (Math.random() < 0.1) {
      // 10%の確率で競合発生
      const conflict: Conflict = {
        id: Date.now().toString(),
        userId: 'user2',
        position: Math.floor(Math.random() * newContent.length),
        content: '競合が検出されました',
        timestamp: Date.now(),
      };
      setConflicts((prev) => [...prev, conflict]);
    }
  };

  const handleResolveConflict = (conflictId: string) => {
    setConflicts((prev) => prev.filter((conflict) => conflict.id !== conflictId));
  };

  const handleSave = () => {
    // 保存処理
    alert('プランを保存しました');
    // プラン一覧画面に遷移
    setTimeout(() => {
      window.location.href = '/dashboard/plans';
    }, 1000);
  };

  const handleInvitePartner = () => {
    // パートナー招待処理
    alert('パートナーに招待を送信しました');
  };

  const handleViewHistory = () => {
    window.location.href = '/dashboard/collaboration/history';
  };

  const handlePreview = () => {
    window.location.href = '/dashboard/collaboration/preview';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">共同編集</h1>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-sm text-gray-600">{isConnected ? '接続中' : '接続なし'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={handleViewHistory} variant="outline" size="sm">
                履歴
              </Button>
              <Button onClick={handlePreview} variant="outline" size="sm">
                プレビュー
              </Button>
              <Button onClick={handleSave} size="sm">
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左サイドバー: ユーザー一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">参加者</h3>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      activeUsers.has(user.id) ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.avatar}
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {activeUsers.has(user.id) ? '編集中' : '待機中'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button onClick={handleInvitePartner} variant="outline" className="w-full">
                  <svg
                    className="w-4 h-4 mr-2"
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
                  パートナーを招待
                </Button>
              </div>
            </div>
          </div>

          {/* メインエリア: エディター */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* エディターヘッダー */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">デートプラン編集</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{content.length} 文字</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-500">自動保存</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* エディター */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onFocus={() => setIsEditing(true)}
                  onBlur={() => setIsEditing(false)}
                  className="w-full h-96 p-6 border-0 resize-none focus:outline-none text-gray-900 leading-relaxed"
                  placeholder="デートプランの詳細を編集してください..."
                />

                {/* カーソル位置表示 */}
                {isEditing && (
                  <div className="absolute top-6 left-6 w-1 h-6 bg-blue-500 animate-pulse"></div>
                )}
              </div>

              {/* 競合通知 */}
              {conflicts.length > 0 && (
                <div className="bg-yellow-50 border-t border-yellow-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-yellow-600"
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
                    <span className="font-medium text-yellow-800">編集競合が検出されました</span>
                  </div>
                  <div className="space-y-2">
                    {conflicts.map((conflict) => (
                      <div
                        key={conflict.id}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-200"
                      >
                        <div>
                          <p className="text-sm text-gray-700">{conflict.content}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(conflict.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleResolveConflict(conflict.id)}
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          解決
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 編集履歴 */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">最近の編集</h3>
              <div className="space-y-3">
                {editHistory.slice(-5).map((operation) => (
                  <div
                    key={operation.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
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
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {operation.type === 'insert'
                          ? 'テキストを追加'
                          : operation.type === 'delete'
                            ? 'テキストを削除'
                            : 'テキストを置換'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(operation.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
