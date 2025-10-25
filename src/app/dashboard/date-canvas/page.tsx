'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface Memory {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'location' | 'audio';
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  tags: string[];
  category: string;
  date: number;
  author: string;
  isShared: boolean;
  mediaUrl?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export default function DateCanvasPage(): ReactElement {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [categories] = useState<Category[]>([
    { id: 'date', name: 'デート', color: '#FF6B6B', icon: '💕' },
    { id: 'travel', name: '旅行', color: '#4ECDC4', icon: '✈️' },
    { id: 'food', name: 'グルメ', color: '#45B7D1', icon: '🍽️' },
    { id: 'activity', name: 'アクティビティ', color: '#96CEB4', icon: '🎯' },
    { id: 'celebration', name: 'お祝い', color: '#FFEAA7', icon: '🎉' },
    { id: 'daily', name: '日常', color: '#DDA0DD', icon: '☀️' },
  ]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isMapView, setIsMapView] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [newMemory, setNewMemory] = useState<Partial<Memory>>({
    title: '',
    content: '',
    type: 'text',
    color: '#FF6B6B',
    category: 'date',
  });
  const [draggedMemory, setDraggedMemory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);

      // 思い出データのシミュレーション
      const mockMemories: Memory[] = [
        {
          id: '1',
          title: '初デート',
          content: '渋谷で初めてのデート。緊張したけど楽しかった！',
          type: 'text',
          position: { x: 100, y: 150 },
          size: { width: 200, height: 120 },
          color: '#FF6B6B',
          tags: ['初デート', '渋谷', '緊張'],
          category: 'date',
          date: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30日前
          author: 'あなた',
          isShared: true,
        },
        {
          id: '2',
          title: '美味しいラーメン',
          content: '一緒に食べたラーメンが最高だった',
          type: 'image',
          position: { x: 350, y: 200 },
          size: { width: 180, height: 150 },
          color: '#45B7D1',
          tags: ['ラーメン', '美味しい'],
          category: 'food',
          date: Date.now() - 25 * 24 * 60 * 60 * 1000, // 25日前
          author: 'パートナー',
          isShared: true,
          mediaUrl: '/api/placeholder/300/200',
        },
        {
          id: '3',
          title: '映画鑑賞',
          content: '感動的な映画を一緒に見た',
          type: 'text',
          position: { x: 200, y: 400 },
          size: { width: 160, height: 100 },
          color: '#96CEB4',
          tags: ['映画', '感動'],
          category: 'activity',
          date: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20日前
          author: 'あなた',
          isShared: true,
        },
        {
          id: '4',
          title: '誕生日パーティー',
          content: 'サプライズで誕生日を祝ってもらった',
          type: 'image',
          position: { x: 500, y: 100 },
          size: { width: 200, height: 160 },
          color: '#FFEAA7',
          tags: ['誕生日', 'サプライズ', 'パーティー'],
          category: 'celebration',
          date: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15日前
          author: 'パートナー',
          isShared: true,
          mediaUrl: '/api/placeholder/300/200',
        },
        {
          id: '5',
          title: '散歩',
          content: '公園を散歩してリラックス',
          type: 'text',
          position: { x: 50, y: 300 },
          size: { width: 140, height: 80 },
          color: '#DDA0DD',
          tags: ['散歩', '公園', 'リラックス'],
          category: 'daily',
          date: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10日前
          author: 'あなた',
          isShared: true,
        },
      ];

      // タグの生成
      const allTags = mockMemories.flatMap((memory) => memory.tags);
      const uniqueTags = [...new Set(allTags)];
      const tagCounts = uniqueTags.map((tag) => ({
        id: tag,
        name: tag,
        color: '#6B7280',
        count: allTags.filter((t) => t === tag).length,
      }));

      setMemories(mockMemories);
      setTags(tagCounts);
      setIsLoading(false);
    };

    void loadData();
  }, []);

  const handleAddMemory = () => {
    if (!newMemory.title || !newMemory.content) return;

    const memory: Memory = {
      id: Date.now().toString(),
      title: newMemory.title,
      content: newMemory.content,
      type: newMemory.type!,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      size: { width: 200, height: 120 },
      color: newMemory.color!,
      tags: [],
      category: newMemory.category!,
      date: Date.now(),
      author: 'あなた',
      isShared: false,
    };

    setMemories((prev) => [...prev, memory]);
    setNewMemory({
      title: '',
      content: '',
      type: 'text',
      color: '#FF6B6B',
      category: 'date',
    });
    setIsAddingMemory(false);
  };

  const handleMemoryDrag = (memoryId: string, newPosition: { x: number; y: number }) => {
    setMemories((prev) =>
      prev.map((memory) => (memory.id === memoryId ? { ...memory, position: newPosition } : memory))
    );
  };

  const handleMemoryResize = (memoryId: string, newSize: { width: number; height: number }) => {
    setMemories((prev) =>
      prev.map((memory) => (memory.id === memoryId ? { ...memory, size: newSize } : memory))
    );
  };

  const handleMemoryDelete = (memoryId: string) => {
    setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
  };

  const handleMemoryEdit = (memoryId: string, updates: Partial<Memory>) => {
    setMemories((prev) =>
      prev.map((memory) => (memory.id === memoryId ? { ...memory, ...updates } : memory))
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      void navigator.share({
        title: 'Date Canvas - 思い出のキャンバス',
        text: '私たちの思い出をキャンバスに記録しました',
        url: window.location.href,
      });
    } else {
      void navigator.clipboard.writeText(window.location.href);
      alert('リンクをコピーしました');
    }
  };

  const filteredMemories = memories.filter((memory) => {
    if (selectedCategory !== 'all' && memory.category !== selectedCategory) {
      return false;
    }
    if (selectedTag !== 'all' && !memory.tags.includes(selectedTag)) {
      return false;
    }
    return true;
  });

  const getCategoryIcon = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.icon || '📝';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6B7280';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">キャンバスを読み込み中...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Date Canvas</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsMapView(!isMapView)} variant="outline" size="sm">
                {isMapView ? 'キャンバス表示' : 'マップ表示'}
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm">
                共有
              </Button>
              <Button
                onClick={() => setIsAddingMemory(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                思い出を追加
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* サイドパネル */}
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-6">
            {/* フィルター */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">フィルター</h3>

              {/* カテゴリフィルター */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">すべて</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* タグフィルター */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">すべて</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name} ({tag.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 思い出一覧 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">思い出一覧</h3>
              <div className="space-y-3">
                {filteredMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      // 思い出をクリックした時の処理
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(memory.category)}</span>
                      <h4 className="font-medium text-gray-900 truncate">{memory.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{memory.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(memory.date).toLocaleDateString()}</span>
                      <span>{memory.author}</span>
                    </div>
                    {memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {memory.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* メインキャンバスエリア */}
        <div className="flex-1 relative">
          {isMapView ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">マップ表示</h3>
                <p className="text-gray-600">地図ベースで思い出を表示します</p>
              </div>
            </div>
          ) : (
            <div
              ref={canvasRef}
              className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden"
              style={{ minHeight: '600px' }}
            >
              {/* 思い出カード */}
              {filteredMemories.map((memory) => (
                <div
                  key={memory.id}
                  className="absolute border-2 border-white rounded-lg shadow-lg cursor-move hover:shadow-xl transition-shadow"
                  style={{
                    left: memory.position.x,
                    top: memory.position.y,
                    width: memory.size.width,
                    height: memory.size.height,
                    backgroundColor: memory.color,
                    opacity: 0.9,
                  }}
                  draggable
                  onDragStart={() => setDraggedMemory(memory.id)}
                  onDragEnd={(e) => {
                    if (draggedMemory === memory.id) {
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect) {
                        const newPosition = {
                          x: e.clientX - rect.left - memory.size.width / 2,
                          y: e.clientY - rect.top - memory.size.height / 2,
                        };
                        handleMemoryDrag(memory.id, newPosition);
                      }
                      setDraggedMemory(null);
                    }
                  }}
                >
                  <div className="p-3 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{getCategoryIcon(memory.category)}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMemoryEdit(memory.id, { isShared: !memory.isShared });
                          }}
                          className="text-xs text-white hover:text-yellow-300"
                        >
                          {memory.isShared ? '🔗' : '🔒'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMemoryDelete(memory.id);
                          }}
                          className="text-xs text-white hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1 truncate">{memory.title}</h4>
                    <p className="text-white text-xs flex-1 line-clamp-3">{memory.content}</p>
                    <div className="text-xs text-white opacity-75 mt-1">
                      {new Date(memory.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* グリッド */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 思い出追加モーダル */}
      {isAddingMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">思い出を追加</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="思い出のタイトル"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <textarea
                  value={newMemory.content}
                  onChange={(e) => setNewMemory((prev) => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="思い出の詳細"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                <select
                  value={newMemory.category}
                  onChange={(e) => setNewMemory((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">色</label>
                <div className="flex space-x-2">
                  {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'].map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() => setNewMemory((prev) => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newMemory.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <Button onClick={() => setIsAddingMemory(false)} variant="outline" className="flex-1">
                キャンセル
              </Button>
              <Button
                onClick={handleAddMemory}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                追加
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
