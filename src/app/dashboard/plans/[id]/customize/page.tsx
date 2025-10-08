'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatePlanDetail, PlanItem, PlanItemType } from '@/types/date-plan';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function PlanCustomizePage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const supabase = createClient();

  const [plan, setPlan] = useState<DatePlanDetail | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プラン基本情報の編集状態
  const [editingPlan, setEditingPlan] = useState({
    title: '',
    description: '',
    budget: 0,
    duration: 0,
    location_prefecture: '',
    location_city: '',
    location_station: '',
    special_requests: '',
  });

  // アイテム編集モーダルの状態
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // 新規アイテムの初期状態
  const [newItem, setNewItem] = useState({
    type: 'activity' as PlanItemType,
    name: '',
    description: '',
    location: '',
    start_time: '',
    duration: 60,
    cost: 0,
    notes: '',
  });

  useEffect(() => {
    if (planId) {
      fetchPlan();
      fetchItems();
    }
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('ログインが必要です');
        return;
      }

      const response = await fetch(`/api/plans/${planId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('プランの取得に失敗しました');
      }

      const data = await response.json();
      setPlan(data);
      setEditingPlan({
        title: data.title || '',
        description: data.description || '',
        budget: data.budget || 0,
        duration: data.duration || 0,
        location_prefecture: data.location_prefecture || '',
        location_city: data.location_city || '',
        location_station: data.location_station || '',
        special_requests: data.special_requests || '',
      });
    } catch (err: any) {
      console.error('プラン取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`/api/plans/${planId}/items`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (err: any) {
      console.error('アイテム取得エラー:', err);
    }
  };

  const handleSavePlan = async () => {
    try {
      setSaving(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editingPlan),
      });

      if (!response.ok) {
        throw new Error('プランの保存に失敗しました');
      }

      alert('プランを保存しました');
      fetchPlan();
    } catch (err: any) {
      console.error('保存エラー:', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`/api/plans/${planId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error('アイテムの追加に失敗しました');
      }

      setShowAddModal(false);
      setNewItem({
        type: 'activity',
        name: '',
        description: '',
        location: '',
        start_time: '',
        duration: 60,
        cost: 0,
        notes: '',
      });
      fetchItems();
    } catch (err: any) {
      console.error('アイテム追加エラー:', err);
      alert(err.message);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`/api/plans/${planId}/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: editingItem.type,
          name: editingItem.name,
          description: editingItem.description,
          location: editingItem.location,
          start_time: editingItem.start_time,
          duration: editingItem.duration,
          cost: editingItem.cost,
          notes: editingItem.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('アイテムの更新に失敗しました');
      }

      setShowItemModal(false);
      setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      console.error('アイテム更新エラー:', err);
      alert(err.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('このアイテムを削除してもよろしいですか？')) {
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`/api/plans/${planId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('アイテムの削除に失敗しました');
      }

      fetchItems();
    } catch (err: any) {
      console.error('アイテム削除エラー:', err);
      alert(err.message);
    }
  };

  const handleCompletePlan = async () => {
    if (!confirm('このプランを確定しますか？')) {
      return;
    }

    try {
      setSaving(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...editingPlan,
          status: 'completed',
        }),
      });

      if (!response.ok) {
        throw new Error('プランの確定に失敗しました');
      }

      alert('プランを確定しました！');
      router.push(`/dashboard/plans/${planId}`);
    } catch (err: any) {
      console.error('確定エラー:', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 予算・時間の自動計算
  const calculateTotals = () => {
    const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
    const totalDuration = items.reduce((sum, item) => sum + (item.duration || 0), 0);
    return { totalCost, totalDuration };
  };

  const { totalCost, totalDuration } = calculateTotals();

  const getItemTypeLabel = (type: PlanItemType): string => {
    const labels: Record<PlanItemType, string> = {
      restaurant: 'レストラン',
      activity: 'アクティビティ',
      cafe: 'カフェ',
      transport: '移動',
      shopping: 'ショッピング',
      other: 'その他',
    };
    return labels[type] || type;
  };

  const getItemTypeIcon = (type: PlanItemType): string => {
    const icons: Record<PlanItemType, string> = {
      restaurant: '🍽️',
      activity: '🎯',
      cafe: '☕',
      transport: '🚗',
      shopping: '🛍️',
      other: '📍',
    };
    return icons[type] || '📍';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'プランが見つかりません'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 mb-2 flex items-center"
            >
              ← 戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-900">プランをカスタマイズ</h1>
            <p className="text-gray-600 mt-2">プランの詳細を編集して、理想のデートを作りましょう</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSavePlan} disabled={saving} variant="secondary">
              {saving ? '保存中...' : '下書き保存'}
            </Button>
            <Button onClick={handleCompletePlan} disabled={saving}>
              プランを確定
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: プラン基本情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報セクション */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">基本情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                  <Input
                    value={editingPlan.title}
                    onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                    placeholder="デートプランのタイトル"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                  <Textarea
                    value={editingPlan.description || ''}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, description: e.target.value })
                    }
                    placeholder="プランの説明"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">予算</label>
                    <Input
                      type="number"
                      value={editingPlan.budget}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, budget: Number(e.target.value) })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      時間（分）
                    </label>
                    <Input
                      type="number"
                      value={editingPlan.duration}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, duration: Number(e.target.value) })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">場所</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={editingPlan.location_prefecture || ''}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, location_prefecture: e.target.value })
                      }
                      placeholder="都道府県"
                    />
                    <Input
                      value={editingPlan.location_city || ''}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, location_city: e.target.value })
                      }
                      placeholder="市区町村"
                    />
                    <Input
                      value={editingPlan.location_station || ''}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, location_station: e.target.value })
                      }
                      placeholder="駅"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">特別な要望</label>
                  <Textarea
                    value={editingPlan.special_requests || ''}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, special_requests: e.target.value })
                    }
                    placeholder="特別な要望やメモ"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* アイテム一覧セクション */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">プランアイテム</h2>
                <Button onClick={() => setShowAddModal(true)} variant="secondary">
                  + アイテム追加
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">まだアイテムがありません</p>
                  <p className="text-sm">「アイテム追加」ボタンから追加してください</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getItemTypeIcon(item.type)}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-500">{getItemTypeLabel(item.type)}</p>
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {item.location && (
                              <span className="flex items-center gap-1">📍 {item.location}</span>
                            )}
                            {item.start_time && (
                              <span className="flex items-center gap-1">🕐 {item.start_time}</span>
                            )}
                            {item.duration && (
                              <span className="flex items-center gap-1">⏱️ {item.duration}分</span>
                            )}
                            {item.cost !== null && item.cost !== undefined && (
                              <span className="flex items-center gap-1">
                                💰 {item.cost.toLocaleString()}円
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowItemModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側: サマリー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">サマリー</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">アイテム数</span>
                    <span className="font-semibold">{items.length}個</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">予算（計算値）</span>
                    <span className="font-semibold">{totalCost.toLocaleString()}円</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">予算（設定値）</span>
                    <span className="font-semibold">{editingPlan.budget.toLocaleString()}円</span>
                  </div>
                  {totalCost > editingPlan.budget && (
                    <p className="text-red-600 text-xs mt-2">⚠️ 予算を超過しています</p>
                  )}
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">合計時間</span>
                    <span className="font-semibold">
                      {Math.floor(totalDuration / 60)}時間{totalDuration % 60}分
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ステータス</p>
                  <p className="font-semibold text-yellow-600">
                    {plan.status === 'draft' ? '下書き' : plan.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* アイテム追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">アイテムを追加</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイプ</label>
                <Select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as PlanItemType })}
                >
                  <option value="restaurant">レストラン</option>
                  <option value="activity">アクティビティ</option>
                  <option value="cafe">カフェ</option>
                  <option value="transport">移動</option>
                  <option value="shopping">ショッピング</option>
                  <option value="other">その他</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="アイテム名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <Textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="説明"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">場所</label>
                <Input
                  value={newItem.location || ''}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  placeholder="場所"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
                  <Input
                    type="time"
                    value={newItem.start_time || ''}
                    onChange={(e) => setNewItem({ ...newItem, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所要時間（分）
                  </label>
                  <Input
                    type="number"
                    value={newItem.duration}
                    onChange={(e) => setNewItem({ ...newItem, duration: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">費用（円）</label>
                <Input
                  type="number"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                <Textarea
                  value={newItem.notes || ''}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="メモ"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleAddItem} className="flex-1">
                追加
              </Button>
              <Button onClick={() => setShowAddModal(false)} variant="secondary" className="flex-1">
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* アイテム編集モーダル */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">アイテムを編集</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイプ</label>
                <Select
                  value={editingItem.type}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, type: e.target.value as PlanItemType })
                  }
                >
                  <option value="restaurant">レストラン</option>
                  <option value="activity">アクティビティ</option>
                  <option value="cafe">カフェ</option>
                  <option value="transport">移動</option>
                  <option value="shopping">ショッピング</option>
                  <option value="other">その他</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="アイテム名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <Textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="説明"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">場所</label>
                <Input
                  value={editingItem.location || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  placeholder="場所"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
                  <Input
                    type="time"
                    value={editingItem.start_time || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所要時間（分）
                  </label>
                  <Input
                    type="number"
                    value={editingItem.duration || 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, duration: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">費用（円）</label>
                <Input
                  type="number"
                  value={editingItem.cost || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, cost: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                <Textarea
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  placeholder="メモ"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleUpdateItem} className="flex-1">
                更新
              </Button>
              <Button
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                }}
                variant="secondary"
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
