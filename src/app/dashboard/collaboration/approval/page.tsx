'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface ApprovalStep {
  id: string;
  name: string;
  user: string;
  userAvatar: string;
  userColor: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  timestamp?: number;
  comment?: string;
  isCurrent: boolean;
}

interface ApprovalRequest {
  id: string;
  title: string;
  content: string;
  requester: string;
  requesterAvatar: string;
  requesterColor: string;
  createdAt: number;
  deadline: number;
  priority: 'low' | 'medium' | 'high';
  steps: ApprovalStep[];
}

export default function ApprovalWorkflowPage(): ReactElement {
  const [approvalRequest] = useState<ApprovalRequest>({
    id: 'approval1',
    title: 'ロマンチックな渋谷デートプラン',
    content: 'デートプランの詳細内容...',
    requester: 'パートナー',
    requesterAvatar: '💕',
    requesterColor: '#EF4444',
    createdAt: Date.now() - 3600000, // 1時間前
    deadline: Date.now() + 86400000, // 24時間後
    priority: 'high',
    steps: [
      {
        id: 'step1',
        name: '初回レビュー',
        user: 'あなた',
        userAvatar: '👤',
        userColor: '#3B82F6',
        status: 'approved',
        timestamp: Date.now() - 1800000, // 30分前
        comment: '内容を確認しました。良いプランだと思います。',
        isCurrent: false,
      },
      {
        id: 'step2',
        name: '最終承認',
        user: 'パートナー',
        userAvatar: '💕',
        userColor: '#EF4444',
        status: 'pending',
        isCurrent: true,
      },
    ],
  });

  const [newComment, setNewComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'request_changes'>(
    'approve'
  );

  const handleApprove = () => {
    if (confirm('このプランを承認しますか？')) {
      alert('プランを承認しました');
      // 実際の実装ではAPIを呼び出して承認処理を行う
    }
  };

  const handleReject = () => {
    if (confirm('このプランを却下しますか？')) {
      alert('プランを却下しました');
      // 実際の実装ではAPIを呼び出して却下処理を行う
    }
  };

  const handleRequestChanges = () => {
    if (!newComment.trim()) {
      alert('変更点を入力してください');
      return;
    }
    if (confirm('変更依頼を送信しますか？')) {
      alert('変更依頼を送信しました');
      // 実際の実装ではAPIを呼び出して変更依頼処理を行う
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'changes_requested':
        return (
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      case 'pending':
        return (
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      case 'changes_requested':
        return '変更依頼';
      case 'pending':
        return '待機中';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentStep = approvalRequest.steps.find((step) => step.isCurrent);
  const isOverdue = Date.now() > approvalRequest.deadline;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">承認ワークフロー</h1>
          <p className="text-xl text-gray-600">プランの承認プロセスを管理します</p>
        </div>

        {/* 承認リクエスト情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{approvalRequest.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>依頼者: {approvalRequest.requester}</span>
                <span>作成日: {new Date(approvalRequest.createdAt).toLocaleDateString()}</span>
                <span>期限: {new Date(approvalRequest.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(approvalRequest.priority)}`}
              >
                {approvalRequest.priority === 'high'
                  ? '高'
                  : approvalRequest.priority === 'medium'
                    ? '中'
                    : '低'}
                優先度
              </span>
              {isOverdue && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  期限超過
                </span>
              )}
            </div>
          </div>

          {/* プラン内容プレビュー */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">プラン内容</h3>
            <p className="text-gray-600 text-sm line-clamp-3">{approvalRequest.content}</p>
            <Button
              onClick={() => (window.location.href = '/dashboard/collaboration/preview')}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              詳細を表示
            </Button>
          </div>
        </div>

        {/* 承認ステップ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">承認ステップ</h3>
          <div className="space-y-6">
            {approvalRequest.steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step.status === 'approved'
                        ? 'bg-green-100'
                        : step.status === 'rejected'
                          ? 'bg-red-100'
                          : step.status === 'changes_requested'
                            ? 'bg-yellow-100'
                            : step.isCurrent
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                    }`}
                  >
                    {getStatusIcon(step.status)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        step.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : step.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : step.status === 'changes_requested'
                              ? 'bg-yellow-100 text-yellow-800'
                              : step.isCurrent
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getStatusLabel(step.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: step.userColor }}
                    >
                      {step.userAvatar}
                    </div>
                    <span className="text-sm text-gray-600">{step.user}</span>
                    {step.timestamp && (
                      <span className="text-sm text-gray-500">
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {step.comment && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{step.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 現在のステップでのアクション */}
        {currentStep && currentStep.status === 'pending' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">承認アクション</h3>

            <div className="space-y-6">
              {/* アクション選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  アクションを選択
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="action"
                      value="approve"
                      checked={selectedAction === 'approve'}
                      onChange={(e) => setSelectedAction(e.target.value as any)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <div className="flex items-center space-x-2">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="font-medium text-gray-900">承認</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="action"
                      value="request_changes"
                      checked={selectedAction === 'request_changes'}
                      onChange={(e) => setSelectedAction(e.target.value as any)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                    />
                    <div className="flex items-center space-x-2">
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span className="font-medium text-gray-900">変更依頼</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="action"
                      value="reject"
                      checked={selectedAction === 'reject'}
                      onChange={(e) => setSelectedAction(e.target.value as any)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <div className="flex items-center space-x-2">
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="font-medium text-gray-900">却下</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* コメント入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  コメント（任意）
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="コメントを入力してください..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-4">
                {selectedAction === 'approve' && (
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                    承認する
                  </Button>
                )}
                {selectedAction === 'request_changes' && (
                  <Button
                    onClick={handleRequestChanges}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    変更依頼を送信
                  </Button>
                )}
                {selectedAction === 'reject' && (
                  <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                    却下する
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-8 flex justify-center">
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
