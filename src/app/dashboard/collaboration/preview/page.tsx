'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface PlanPreview {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  modifiedBy: string;
  version: string;
  status: 'draft' | 'review' | 'approved';
}

export default function PlanPreviewPage(): ReactElement {
  const [plan] = useState<PlanPreview>({
    id: 'plan1',
    title: 'ロマンチックな渋谷デートプラン',
    content: `# ロマンチックな渋谷デートプラン

## 14:00-15:30 カフェタイム
- **場所**: Blue Bottle Coffee 渋谷店
- **内容**: 香り高いコーヒーとおしゃれな空間でリラックスタイム
- **予算**: ¥2,000
- **所要時間**: 1時間30分

## 16:00-17:30 展望台
- **場所**: 渋谷スカイ
- **内容**: 東京の絶景を360度楽しめる展望台
- **予算**: ¥2,000
- **所要時間**: 1時間30分

## 18:30-20:30 ディナー
- **場所**: 隠れ家イタリアン トラットリア
- **内容**: 本格的なイタリア料理とワインでディナータイム
- **予算**: ¥11,000
- **所要時間**: 2時間

## メモ
- 雨の日は屋内施設を中心に調整可能
- 記念日サプライズを検討中
- 写真撮影スポットを追加予定

## 総予算
**¥15,000**

## 総時間
**6時間**`,
    lastModified: Date.now() - 300000, // 5分前
    modifiedBy: 'パートナー',
    version: 'v1.2',
    status: 'draft',
  });

  const [viewMode, setViewMode] = useState<'preview' | 'markdown' | 'print'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleEdit = () => {
    window.location.href = '/dashboard/collaboration';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: plan.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('リンクをコピーしました');
    }
  };

  const handleExport = () => {
    const blob = new Blob([plan.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = () => {
    if (confirm('このプランを承認しますか？')) {
      alert('プランを承認しました');
    }
  };

  const handleRequestChanges = () => {
    const changes = prompt('変更点を入力してください:');
    if (changes) {
      alert('変更依頼を送信しました');
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'markdown':
        return (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded-lg">
            {plan.content}
          </pre>
        );
      case 'print':
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: plan.content.replace(/\n/g, '<br>') }} />
          </div>
        );
      default:
        return (
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: plan.content
                  .replace(
                    /^# (.*$)/gim,
                    '<h1 class="text-3xl font-bold text-gray-900 mb-4">$1</h1>'
                  )
                  .replace(
                    /^## (.*$)/gim,
                    '<h2 class="text-2xl font-bold text-gray-800 mb-3 mt-6">$1</h2>'
                  )
                  .replace(
                    /^### (.*$)/gim,
                    '<h3 class="text-xl font-bold text-gray-700 mb-2 mt-4">$1</h3>'
                  )
                  .replace(
                    /^- \*\*(.*?)\*\*: (.*$)/gim,
                    '<li class="mb-2"><strong class="text-gray-700">$1</strong>: <span class="text-gray-600">$2</span></li>'
                  )
                  .replace(/^- (.*$)/gim, '<li class="mb-1 text-gray-600">$1</li>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
                  .replace(/\n/g, '<br>'),
              }}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* ヘッダー */}
      <div className="bg-white shadow-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">プレビュー</h1>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {plan.version}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    plan.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : plan.status === 'review'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {plan.status === 'draft'
                    ? '下書き'
                    : plan.status === 'review'
                      ? 'レビュー中'
                      : '承認済み'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 表示モード切り替え */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  プレビュー
                </button>
                <button
                  onClick={() => setViewMode('markdown')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'markdown' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setViewMode('print')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'print' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  印刷用
                </button>
              </div>

              <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="outline" size="sm">
                {isFullscreen ? '縮小' : '全画面'}
              </Button>
              <Button onClick={handleEdit} variant="outline" size="sm">
                編集
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm">
                共有
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                エクスポート
              </Button>
              <Button onClick={handlePrint} size="sm">
                印刷
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* プラン情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-900">{plan.title}</h2>
            <div className="text-sm text-gray-500">
              最終更新: {new Date(plan.lastModified).toLocaleString()} by {plan.modifiedBy}
            </div>
          </div>

          {/* ステータスアクション */}
          {plan.status === 'draft' && (
            <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
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
              <span className="text-yellow-800">このプランは下書きです。承認が必要です。</span>
              <div className="flex space-x-2">
                <Button
                  onClick={handleApprove}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  承認
                </Button>
                <Button onClick={handleRequestChanges} variant="outline" size="sm">
                  変更依頼
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* プレビューコンテンツ */}
        <div className="bg-white rounded-2xl shadow-xl p-8">{renderContent()}</div>

        {/* アクションボタン */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            編集に戻る
          </Button>
          <Button
            onClick={handleEdit}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            編集を続行
          </Button>
        </div>
      </div>
    </div>
  );
}
