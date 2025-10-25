'use client';

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export default function AIGeneratingPage(): ReactElement {
  const [steps, setSteps] = useState<GenerationStep[]>([
    {
      id: 'analyze',
      title: 'プロフィール分析中',
      description: 'あなたの好みと過去の履歴を分析しています',
      completed: false,
      current: true,
    },
    {
      id: 'search',
      title: 'スポット検索中',
      description: '最適なデートスポットを検索しています',
      completed: false,
      current: false,
    },
    {
      id: 'optimize',
      title: 'ルート最適化中',
      description: '効率的な移動ルートを計算しています',
      completed: false,
      current: false,
    },
    {
      id: 'generate',
      title: 'プラン生成中',
      description: 'パーソナライズされたデートプランを作成しています',
      completed: false,
      current: false,
    },
  ]);

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsCompleted(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // ステップの進行をシミュレート
    const stepTimer = setTimeout(() => {
      setSteps((prev) => {
        const newSteps = [...prev];
        const currentIndex = newSteps.findIndex((step) => step.current);

        if (currentIndex >= 0) {
          newSteps[currentIndex].completed = true;
          newSteps[currentIndex].current = false;

          if (currentIndex + 1 < newSteps.length) {
            newSteps[currentIndex + 1].current = true;
          }
        }

        return newSteps;
      });
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(stepTimer);
    };
  }, []);

  const handleCancel = () => {
    if (confirm('AI生成をキャンセルしますか？')) {
      window.location.href = '/dashboard/ai-plan';
    }
  };

  const handleViewResults = () => {
    window.location.href = '/dashboard/ai-plan/results';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">AIが最適なプランを生成中</h1>
          <p className="text-xl text-gray-600 mb-2">
            あなただけの特別なデートプランを作成しています
          </p>
        </div>

        {/* プログレスバー */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">生成進捗</span>
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-rose-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* ステップ表示 */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.current
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      step.completed
                        ? 'text-green-700'
                        : step.current
                          ? 'text-rose-700'
                          : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      step.completed
                        ? 'text-green-600'
                        : step.current
                          ? 'text-rose-600'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                {step.current && (
                  <div className="animate-spin">
                    <svg
                      className="w-5 h-5 text-rose-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isCompleted ? (
            <Button
              onClick={handleViewResults}
              className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600"
            >
              生成されたプランを確認
            </Button>
          ) : (
            <Button onClick={handleCancel} variant="outline" className="w-full sm:w-auto">
              キャンセル
            </Button>
          )}
        </div>

        {/* ヒント */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-500 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
