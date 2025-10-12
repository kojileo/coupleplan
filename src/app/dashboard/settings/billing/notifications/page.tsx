'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface BillingNotification {
  id: string;
  type:
    | 'plan_change'
    | 'payment_success'
    | 'payment_failed'
    | 'trial_ending'
    | 'subscription_cancelled'
    | 'price_change';
  title: string;
  message: string;
  date: number;
  isRead: boolean;
  isImportant: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    oldPlan?: string;
    newPlan?: string;
    amount?: number;
    currency?: string;
    trialEndDate?: number;
  };
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  planChanges: boolean;
  paymentUpdates: boolean;
  trialReminders: boolean;
  priceChanges: boolean;
  marketing: boolean;
}

export default function BillingNotificationsPage(): ReactElement {
  const [notifications, setNotifications] = useState<BillingNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    inApp: true,
    planChanges: true,
    paymentUpdates: true,
    trialReminders: true,
    priceChanges: true,
    marketing: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);

  const filters = [
    { id: 'all', name: 'すべて', count: 0 },
    { id: 'unread', name: '未読', count: 0 },
    { id: 'important', name: '重要', count: 0 },
    { id: 'action_required', name: 'アクション必要', count: 0 },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // 通知データのシミュレーション
      const mockNotifications: BillingNotification[] = [
        {
          id: '1',
          type: 'plan_change',
          title: 'プランが変更されました',
          message: 'プレミアムプラン（月額）にアップグレードされました。次回請求日: 2024年2月15日',
          date: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2日前
          isRead: false,
          isImportant: true,
          actionRequired: false,
          metadata: {
            oldPlan: 'フリープラン',
            newPlan: 'プレミアムプラン（月額）',
            amount: 980,
            currency: 'JPY',
          },
        },
        {
          id: '2',
          type: 'payment_success',
          title: '支払いが完了しました',
          message: 'プレミアムプランの月額料金（¥980）の支払いが正常に完了しました。',
          date: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5日前
          isRead: true,
          isImportant: false,
          actionRequired: false,
          metadata: {
            amount: 980,
            currency: 'JPY',
          },
        },
        {
          id: '3',
          type: 'trial_ending',
          title: 'トライアル期間が終了します',
          message:
            '7日間の無料トライアルが3日後に終了します。継続するにはプランに登録してください。',
          date: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1日前
          isRead: false,
          isImportant: true,
          actionRequired: true,
          actionUrl: '/dashboard/settings/billing',
          actionText: 'プランを選択',
          metadata: {
            trialEndDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3日後
          },
        },
        {
          id: '4',
          type: 'price_change',
          title: '料金体系が変更されます',
          message:
            '2024年4月1日より、プレミアムプランの料金が月額¥1,080に変更されます。既存ユーザーは現在の料金で継続利用できます。',
          date: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7日前
          isRead: true,
          isImportant: true,
          actionRequired: false,
        },
        {
          id: '5',
          type: 'payment_failed',
          title: '支払いに失敗しました',
          message:
            'プレミアムプランの月額料金の支払いが失敗しました。支払い方法を確認してください。',
          date: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10日前
          isRead: true,
          isImportant: true,
          actionRequired: true,
          actionUrl: '/dashboard/settings/billing',
          actionText: '支払い方法を更新',
          metadata: {
            amount: 980,
            currency: 'JPY',
          },
        },
        {
          id: '6',
          type: 'subscription_cancelled',
          title: 'サブスクリプションがキャンセルされました',
          message:
            'プレミアムプランのサブスクリプションがキャンセルされました。現在のプランは2024年2月15日まで有効です。',
          date: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14日前
          isRead: true,
          isImportant: false,
          actionRequired: false,
          metadata: {
            oldPlan: 'プレミアムプラン（月額）',
            newPlan: 'フリープラン',
          },
        },
      ];

      // フィルターのカウントを計算
      const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
      const importantCount = mockNotifications.filter((n) => n.isImportant).length;
      const actionRequiredCount = mockNotifications.filter((n) => n.actionRequired).length;

      // フィルターの更新
      filters[0].count = mockNotifications.length;
      filters[1].count = unreadCount;
      filters[2].count = importantCount;
      filters[3].count = actionRequiredCount;

      // データ読み込みのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNotifications(mockNotifications);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
  };

  const handleSettingsChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    // 設定保存のシミュレーション
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('通知設定を保存しました');
    setShowSettings(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'plan_change':
        return '🔄';
      case 'payment_success':
        return '✅';
      case 'payment_failed':
        return '❌';
      case 'trial_ending':
        return '⏰';
      case 'subscription_cancelled':
        return '🚫';
      case 'price_change':
        return '💰';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'plan_change':
        return 'bg-blue-100 text-blue-800';
      case 'payment_success':
        return 'bg-green-100 text-green-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      case 'trial_ending':
        return 'bg-yellow-100 text-yellow-800';
      case 'subscription_cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'price_change':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'plan_change':
        return 'プラン変更';
      case 'payment_success':
        return '支払い成功';
      case 'payment_failed':
        return '支払い失敗';
      case 'trial_ending':
        return 'トライアル終了';
      case 'subscription_cancelled':
        return 'キャンセル';
      case 'price_change':
        return '料金変更';
      default:
        return type;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (selectedFilter) {
      case 'unread':
        return !notification.isRead;
      case 'important':
        return notification.isImportant;
      case 'action_required':
        return notification.actionRequired;
      default:
        return true;
    }
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">通知を読み込み中...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">課金通知</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowSettings(true)} variant="outline" size="sm">
                設定
              </Button>
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                すべて既読
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルター */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">フィルター</h2>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.name}
                {filter.count > 0 && (
                  <span className="ml-2 bg-white text-blue-500 text-xs px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 通知一覧 */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">通知がありません</h3>
              <p className="text-gray-600">
                {selectedFilter === 'all'
                  ? 'まだ通知はありません'
                  : 'この条件に一致する通知はありません'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-xl p-6 transition-all ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getNotificationColor(notification.type)}`}
                        >
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        {notification.isImportant && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            重要
                          </span>
                        )}
                        {notification.actionRequired && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            アクション必要
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.date)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{notification.message}</p>

                    {/* メタデータ表示 */}
                    {notification.metadata && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        {notification.metadata.oldPlan && notification.metadata.newPlan && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">変更:</span>{' '}
                            {notification.metadata.oldPlan} → {notification.metadata.newPlan}
                          </div>
                        )}
                        {notification.metadata.amount && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">金額:</span> ¥
                            {notification.metadata.amount.toLocaleString()}
                          </div>
                        )}
                        {notification.metadata.trialEndDate && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">終了日:</span>{' '}
                            {new Date(notification.metadata.trialEndDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      {!notification.isRead && (
                        <Button
                          onClick={() => handleMarkAsRead(notification.id)}
                          variant="outline"
                          size="sm"
                        >
                          既読にする
                        </Button>
                      )}

                      {notification.actionRequired && notification.actionUrl && (
                        <Button
                          onClick={() => (window.location.href = notification.actionUrl!)}
                          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                          size="sm"
                        >
                          {notification.actionText || 'アクション'}
                        </Button>
                      )}

                      <Button
                        onClick={() => handleDeleteNotification(notification.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-4 w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">通知設定</h3>

            <div className="space-y-6">
              {/* 通知方法 */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">通知方法</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.email}
                      onChange={(e) => handleSettingsChange('email', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">メール通知</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.push}
                      onChange={(e) => handleSettingsChange('push', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">プッシュ通知</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.inApp}
                      onChange={(e) => handleSettingsChange('inApp', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">アプリ内通知</span>
                  </label>
                </div>
              </div>

              {/* 通知カテゴリ */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">通知カテゴリ</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.planChanges}
                      onChange={(e) => handleSettingsChange('planChanges', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">プラン変更</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.paymentUpdates}
                      onChange={(e) => handleSettingsChange('paymentUpdates', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">支払い更新</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.trialReminders}
                      onChange={(e) => handleSettingsChange('trialReminders', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">トライアルリマインダー</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.priceChanges}
                      onChange={(e) => handleSettingsChange('priceChanges', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">料金変更</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.marketing}
                      onChange={(e) => handleSettingsChange('marketing', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">マーケティング通知</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <Button onClick={() => setShowSettings(false)} variant="outline" className="flex-1">
                キャンセル
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
