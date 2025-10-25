'use client';

import { useState, useEffect } from 'react';

import { authCircuitBreaker } from '@/lib/circuit-breaker';
import { getAuthSystemStatus, emergencyStop, resetAuthSystem } from '@/lib/emergency-stop';

export default function AuthDebugPage() {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStatus = () => {
    setStatus(getAuthSystemStatus());
  };

  const handleEmergencyStop = async () => {
    if (confirm('認証システムを緊急停止しますか？この操作は元に戻せません。')) {
      setIsLoading(true);
      await emergencyStop();
      refreshStatus();
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('認証システムをリセットしますか？')) {
      setIsLoading(true);
      await resetAuthSystem();
      refreshStatus();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">認証システム デバッグ画面</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* システム状態 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">システム状態</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>サーキットブレーカー:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    status?.circuitBreakerOpen
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {status?.circuitBreakerOpen ? 'オープン' : 'クローズ'}
                </span>
              </div>
              <div className="text-sm text-gray-600">最終更新: {status?.timestamp}</div>
            </div>
          </div>

          {/* サーキットブレーカー詳細 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">サーキットブレーカー詳細</h2>
            <div className="space-y-2 text-sm">
              <div>失敗回数: {status?.circuitBreakerState?.failureCount || 0}</div>
              <div>成功回数: {status?.circuitBreakerState?.successCount || 0}</div>
              <div>
                最終失敗時刻:{' '}
                {status?.circuitBreakerState?.lastFailureTime
                  ? new Date(status.circuitBreakerState.lastFailureTime).toLocaleString()
                  : 'なし'}
              </div>
            </div>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          <div className="flex gap-4">
            <button
              onClick={refreshStatus}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              状態を更新
            </button>

            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'リセット中...' : 'システムリセット'}
            </button>

            <button
              onClick={handleEmergencyStop}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isLoading ? '停止中...' : '緊急停止'}
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 注意事項</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 緊急停止は認証システムを完全に無効化します</li>
            <li>• システムリセットは認証状態をクリアします</li>
            <li>• これらの操作は本番環境では使用しないでください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
