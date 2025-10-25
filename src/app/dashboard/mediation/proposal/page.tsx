'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface MediationProposal {
  id: string;
  coupleId: string;
  proposalDate: number;
  approach: string;
  steps: MediationStep[];
  expectedOutcome: string;
  timeFrame: string;
  successRate: number;
  alternatives: AlternativeApproach[];
}

interface MediationStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  duration: string;
  activities: Activity[];
  expectedResult: string;
  isCompleted: boolean;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'couple' | 'guided';
  resources?: string[];
}

interface AlternativeApproach {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  timeFrame: string;
}

export default function MediationProposalPage(): ReactElement {
  const [proposal, setProposal] = useState<MediationProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    const loadProposal = async () => {
      setIsLoading(true);

      // 仲裁提案のシミュレーション
      const mockProposal: MediationProposal = {
        id: 'proposal123',
        coupleId: 'couple123',
        proposalDate: Date.now(),
        approach: '段階的関係修復アプローチ',
        steps: [
          {
            id: '1',
            stepNumber: 1,
            title: '感情の整理と理解',
            description: 'お互いの感情を整理し、相手の立場を理解する段階です。',
            duration: '1-2週間',
            activities: [
              {
                id: '1-1',
                name: '感情日記の記録',
                description: '毎日の感情を記録し、パターンを理解する',
                type: 'individual',
                resources: ['感情日記テンプレート', '感情チャート'],
              },
              {
                id: '1-2',
                name: '相手の立場を考える練習',
                description: '相手の視点から状況を見直す練習',
                type: 'individual',
                resources: ['視点転換ワークシート'],
              },
            ],
            expectedResult: 'お互いの感情と立場への理解が深まる',
            isCompleted: false,
          },
          {
            id: '2',
            stepNumber: 2,
            title: '建設的な対話の練習',
            description: '感情をコントロールしながら、建設的な対話を行う練習です。',
            duration: '2-3週間',
            activities: [
              {
                id: '2-1',
                name: 'アクティブリスニングの練習',
                description: '相手の話を最後まで聞き、理解を示す練習',
                type: 'couple',
                resources: ['リスニングガイド', '対話練習シート'],
              },
              {
                id: '2-2',
                name: '感情表現の改善',
                description: '感情を適切に表現する方法を学ぶ',
                type: 'guided',
                resources: ['感情表現ワークブック'],
              },
            ],
            expectedResult: 'お互いが安心して話せる環境が作られる',
            isCompleted: false,
          },
          {
            id: '3',
            stepNumber: 3,
            title: '共通の解決策を見つける',
            description: '対立の根本原因を理解し、双方が納得できる解決策を見つけます。',
            duration: '1-2週間',
            activities: [
              {
                id: '3-1',
                name: 'ブレインストーミングセッション',
                description: '創造的に解決策を考えるセッション',
                type: 'couple',
                resources: ['ブレインストーミングガイド'],
              },
              {
                id: '3-2',
                name: '妥協点の探求',
                description: 'お互いが受け入れられる妥協点を見つける',
                type: 'guided',
                resources: ['妥協点探求ワークシート'],
              },
            ],
            expectedResult: '双方が納得できる解決策が見つかる',
            isCompleted: false,
          },
          {
            id: '4',
            stepNumber: 4,
            title: '関係の再構築',
            description: '解決策を実践し、関係を再構築していきます。',
            duration: '2-4週間',
            activities: [
              {
                id: '4-1',
                name: '解決策の実践',
                description: '見つけた解決策を実際に試してみる',
                type: 'couple',
                resources: ['実践チェックリスト'],
              },
              {
                id: '4-2',
                name: '定期的な振り返り',
                description: '進捗を定期的に振り返り、調整する',
                type: 'couple',
                resources: ['振り返りシート'],
              },
            ],
            expectedResult: '安定した関係が構築される',
            isCompleted: false,
          },
        ],
        expectedOutcome: '相互理解の深化と安定した関係の構築',
        timeFrame: '6-10週間',
        successRate: 78,
        alternatives: [
          {
            id: 'alt1',
            name: '短期集中アプローチ',
            description: '集中的なセッションで短期間で解決を図る',
            pros: ['迅速な解決', '集中力の維持'],
            cons: ['時間的制約', '感情的な負担'],
            timeFrame: '2-3週間',
          },
          {
            id: 'alt2',
            name: '個別サポートアプローチ',
            description: 'それぞれに個別のサポートを提供する',
            pros: ['個別のニーズに対応', 'プライバシーの確保'],
            cons: ['連携の難しさ', 'コストの増加'],
            timeFrame: '4-6週間',
          },
        ],
      };

      // 提案生成のシミュレーション（2秒待機）
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProposal(mockProposal);
      setIsLoading(false);
    };

    void loadProposal();
  }, []);

  const handleStepExecution = async (stepId: string) => {
    setIsExecuting(true);

    // ステップ実行のシミュレーション
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // ステップを完了済みにマーク
    if (proposal) {
      setProposal((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((step) =>
            step.id === stepId ? { ...step, isCompleted: true } : step
          ),
        };
      });
    }

    alert('ステップを完了しました！次のステップに進むことができます。');
    setIsExecuting(false);
  };

  const handleStartMediation = () => {
    window.location.href = '/dashboard/mediation/plan';
  };

  const getStepStatusColor = (isCompleted: boolean) => {
    return isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStepStatusLabel = (isCompleted: boolean) => {
    return isCompleted ? '完了' : '未完了';
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800';
      case 'couple':
        return 'bg-green-100 text-green-800';
      case 'guided':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'individual':
        return '個人';
      case 'couple':
        return 'カップル';
      case 'guided':
        return 'ガイド付き';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">仲裁提案を生成中</h2>
          <p className="text-gray-600 mb-4">あなたの状況に最適な仲裁提案を作成しています...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: '90%' }}
            ></div>
          </div>
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
              <h1 className="text-2xl font-bold text-gray-900">AI仲裁提案</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowAlternatives(!showAlternatives)}
                variant="outline"
                size="sm"
              >
                {showAlternatives ? '提案を閉じる' : '代替案を見る'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {proposal ? (
          <>
            {/* 提案概要 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">AI仲裁提案</h2>
                <p className="text-xl text-gray-600 mb-6">{proposal.approach}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{proposal.successRate}%</div>
                    <div className="text-lg text-gray-600">成功率</div>
                    <div className="text-sm text-gray-500">類似ケースでの実績</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{proposal.timeFrame}</div>
                    <div className="text-lg text-gray-600">期間</div>
                    <div className="text-sm text-gray-500">推奨実施期間</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {proposal.steps.length}
                    </div>
                    <div className="text-lg text-gray-600">ステップ数</div>
                    <div className="text-sm text-gray-500">段階的アプローチ</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">期待される結果</h3>
                <p className="text-blue-800">{proposal.expectedOutcome}</p>
              </div>
            </div>

            {/* 代替案 */}
            {showAlternatives && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">代替アプローチ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {proposal.alternatives.map((alternative) => (
                    <div key={alternative.id} className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">{alternative.name}</h4>
                      <p className="text-gray-600 mb-4">{alternative.description}</p>

                      <div className="mb-4">
                        <h5 className="font-medium text-green-800 mb-2">メリット</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          {alternative.pros.map((pro, index) => (
                            <li key={index}>• {pro}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-red-800 mb-2">デメリット</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          {alternative.cons.map((con, index) => (
                            <li key={index}>• {con}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-sm text-gray-500">期間: {alternative.timeFrame}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ステップ詳細 */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">実施ステップ</h3>

              <div className="space-y-8">
                {proposal.steps.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                          {step.stepNumber}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{step.title}</h4>
                          <p className="text-sm text-gray-500">期間: {step.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStepStatusColor(step.isCompleted)}`}
                        >
                          {getStepStatusLabel(step.isCompleted)}
                        </span>
                        <Button
                          onClick={() => setSelectedStep(selectedStep === index ? -1 : index)}
                          variant="outline"
                          size="sm"
                        >
                          {selectedStep === index ? '詳細を閉じる' : '詳細を見る'}
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{step.description}</p>

                    {selectedStep === index && (
                      <div className="mt-6 space-y-6">
                        {/* アクティビティ */}
                        <div>
                          <h5 className="font-bold text-gray-900 mb-3">実施アクティビティ</h5>
                          <div className="space-y-4">
                            {step.activities.map((activity) => (
                              <div key={activity.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium text-gray-900">{activity.name}</h6>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${getActivityTypeColor(activity.type)}`}
                                  >
                                    {getActivityTypeLabel(activity.type)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                {activity.resources && activity.resources.length > 0 && (
                                  <div className="text-xs text-blue-600">
                                    リソース: {activity.resources.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 期待される結果 */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-medium text-green-900 mb-2">期待される結果</h5>
                          <p className="text-sm text-green-800">{step.expectedResult}</p>
                        </div>

                        {/* 実行ボタン */}
                        {!step.isCompleted && (
                          <div className="text-center">
                            <Button
                              onClick={() => handleStepExecution(step.id)}
                              disabled={isExecuting}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            >
                              {isExecuting ? '実行中...' : 'このステップを実行する'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleStartMediation}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-xl"
              >
                関係改善プランを開始する
              </Button>
            </div>
          </>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">提案を読み込み中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
