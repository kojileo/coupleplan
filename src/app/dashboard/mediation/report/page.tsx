'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface ReflectionReport {
  id: string;
  coupleId: string;
  reportDate: number;
  period: {
    startDate: number;
    endDate: number;
  };
  overallProgress: number;
  relationshipScore: {
    before: number;
    after: number;
    improvement: number;
  };
  achievements: Achievement[];
  challenges: Challenge[];
  insights: Insight[];
  recommendations: Recommendation[];
  nextSteps: NextStep[];
  satisfaction: {
    overall: number;
    communication: number;
    understanding: number;
    conflictResolution: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  impact: number;
  category: string;
  date: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  severity: number;
  category: string;
  lessons: string;
}

interface Insight {
  id: string;
  insight: string;
  category: string;
  importance: number;
  application: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeFrame: string;
  expectedOutcome: string;
}

interface NextStep {
  id: string;
  step: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetDate: number;
}

export default function ReflectionReportPage(): ReactElement {
  const [report, setReport] = useState<ReflectionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'achievements' | 'challenges' | 'insights' | 'recommendations'
  >('overview');

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);

      // 振り返りレポートのシミュレーション
      const mockReport: ReflectionReport = {
        id: 'report123',
        coupleId: 'couple123',
        reportDate: Date.now(),
        period: {
          startDate: Date.now() - 6 * 7 * 24 * 60 * 60 * 1000, // 6週間前
          endDate: Date.now(),
        },
        overallProgress: 75,
        relationshipScore: {
          before: 4.2,
          after: 7.8,
          improvement: 3.6,
        },
        achievements: [
          {
            id: 'ach1',
            title: '相互理解の深化',
            description: 'お互いの立場や感情を理解できるようになった',
            impact: 8,
            category: 'コミュニケーション',
            date: Date.now() - 4 * 7 * 24 * 60 * 60 * 1000,
          },
          {
            id: 'ach2',
            title: '建設的な対話の確立',
            description: '感情をコントロールしながら対話できるようになった',
            impact: 9,
            category: '対立解決',
            date: Date.now() - 2 * 7 * 24 * 60 * 60 * 1000,
          },
          {
            id: 'ach3',
            title: '共通の趣味の発見',
            description: '一緒に楽しめる活動を見つけることができた',
            impact: 7,
            category: '関係性',
            date: Date.now() - 1 * 7 * 24 * 60 * 60 * 1000,
          },
        ],
        challenges: [
          {
            id: 'challenge1',
            title: '時間の制約',
            description: '忙しいスケジュールの中で時間を作ることが困難だった',
            severity: 6,
            category: '実践',
            lessons: '短時間でも効果的な交流方法を見つけることが重要',
          },
          {
            id: 'challenge2',
            title: '感情のコントロール',
            description: '感情的になった時に冷静さを保つのが難しかった',
            severity: 7,
            category: '感情管理',
            lessons: '感情を認識し、適切に表現する方法を学ぶ必要がある',
          },
        ],
        insights: [
          {
            id: 'insight1',
            insight: '相手の立場を理解することの重要性',
            category: '理解',
            importance: 9,
            application: '今後の対立でも相手の視点を考慮する',
          },
          {
            id: 'insight2',
            insight: '定期的なコミュニケーションの必要性',
            category: 'コミュニケーション',
            importance: 8,
            application: '週に1回は必ず話し合う時間を作る',
          },
          {
            id: 'insight3',
            insight: '感情を適切に表現することの価値',
            category: '感情表現',
            importance: 7,
            application: '感情を隠さず、建設的に表現する',
          },
        ],
        recommendations: [
          {
            id: 'rec1',
            title: '継続的なコミュニケーション練習',
            description: 'アクティブリスニングの練習を継続する',
            priority: 'high',
            timeFrame: '継続的',
            expectedOutcome: 'より深い相互理解の実現',
          },
          {
            id: 'rec2',
            title: '定期的な関係性チェック',
            description: '月に1回、関係性の振り返りを行う',
            priority: 'medium',
            timeFrame: '月1回',
            expectedOutcome: '問題の早期発見と解決',
          },
          {
            id: 'rec3',
            title: '新しい共通体験の創造',
            description: '一緒に新しいことを体験する機会を作る',
            priority: 'low',
            timeFrame: '月2回',
            expectedOutcome: '関係の新たな側面の発見',
          },
        ],
        nextSteps: [
          {
            id: 'step1',
            step: '関係性の継続的モニタリング',
            description: '定期的に関係性の状態を確認し、必要に応じて調整する',
            priority: 'high',
            targetDate: Date.now() + 2 * 7 * 24 * 60 * 60 * 1000,
          },
          {
            id: 'step2',
            step: '新しいコミュニケーション手法の導入',
            description: 'より効果的なコミュニケーション方法を学び、実践する',
            priority: 'medium',
            targetDate: Date.now() + 4 * 7 * 24 * 60 * 60 * 1000,
          },
        ],
        satisfaction: {
          overall: 8,
          communication: 7,
          understanding: 9,
          conflictResolution: 8,
        },
      };

      // レポート生成のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setReport(mockReport);
      setIsLoading(false);
    };

    void loadReport();
  }, []);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    // PDF生成のシミュレーション
    await new Promise((resolve) => setTimeout(resolve, 3000));

    alert('PDFレポートを生成しました');
    setIsGenerating(false);
  };

  const handleShareReport = () => {
    if (navigator.share) {
      void navigator.share({
        title: '関係改善レポート',
        text: '私たちの関係改善の進捗レポートです',
        url: window.location.href,
      });
    } else {
      void navigator.clipboard.writeText(window.location.href);
      alert('レポートのリンクをコピーしました');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return '良好';
    if (score >= 6) return '普通';
    return '改善必要';
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

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-red-100 text-red-800';
    if (severity >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">振り返りレポート生成中</h2>
          <p className="text-gray-600 mb-4">あなたの関係改善の進捗を分析しています...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: '85%' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">レポートが見つかりませんでした</p>
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
              <h1 className="text-2xl font-bold text-gray-900">振り返りレポート</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                {isGenerating ? '生成中...' : 'PDF生成'}
              </Button>
              <Button onClick={handleShareReport} variant="outline" size="sm">
                共有
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* レポート概要 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">関係改善レポート</h2>
            <p className="text-gray-600 mb-6">
              期間: {new Date(report.period.startDate).toLocaleDateString()} -{' '}
              {new Date(report.period.endDate).toLocaleDateString()}
            </p>

            {/* 進捗バー */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${report.overallProgress}%` }}
              ></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{report.overallProgress}%</div>
            <div className="text-sm text-gray-500">総合進捗</div>
          </div>

          {/* 関係性スコア */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {report.relationshipScore.before.toFixed(1)}
              </div>
              <div className="text-lg text-gray-600">改善前</div>
              <div className="text-sm text-gray-500">関係性スコア</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {report.relationshipScore.after.toFixed(1)}
              </div>
              <div className="text-lg text-gray-600">改善後</div>
              <div className="text-sm text-gray-500">関係性スコア</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                +{report.relationshipScore.improvement.toFixed(1)}
              </div>
              <div className="text-lg text-gray-600">改善幅</div>
              <div className="text-sm text-gray-500">スコア向上</div>
            </div>
          </div>

          {/* 満足度 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">満足度評価</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(report.satisfaction.overall)}`}>
                  {report.satisfaction.overall}/10
                </div>
                <div className="text-sm text-gray-600">総合満足度</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.satisfaction.communication)}`}
                >
                  {report.satisfaction.communication}/10
                </div>
                <div className="text-sm text-gray-600">コミュニケーション</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.satisfaction.understanding)}`}
                >
                  {report.satisfaction.understanding}/10
                </div>
                <div className="text-sm text-gray-600">相互理解</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.satisfaction.conflictResolution)}`}
                >
                  {report.satisfaction.conflictResolution}/10
                </div>
                <div className="text-sm text-gray-600">対立解決</div>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', name: '概要', icon: '📊' },
                { id: 'achievements', name: '達成事項', icon: '🏆' },
                { id: 'challenges', name: '課題', icon: '⚠️' },
                { id: 'insights', name: '洞察', icon: '💡' },
                { id: 'recommendations', name: '推奨事項', icon: '📋' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* 概要タブ */}
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* 次のステップ */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">次のステップ</h3>
                  <div className="space-y-4">
                    {report.nextSteps.map((step) => (
                      <div key={step.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-900">{step.step}</h4>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(step.priority)}`}
                            >
                              {step.priority === 'high'
                                ? '高'
                                : step.priority === 'medium'
                                  ? '中'
                                  : '低'}
                              優先度
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(step.targetDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 達成事項タブ */}
            {selectedTab === 'achievements' && (
              <div className="space-y-6">
                {report.achievements.map((achievement) => (
                  <div key={achievement.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{achievement.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {achievement.category}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          影響度: {achievement.impact}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{achievement.description}</p>
                    <div className="text-sm text-gray-500">
                      達成日: {new Date(achievement.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 課題タブ */}
            {selectedTab === 'challenges' && (
              <div className="space-y-6">
                {report.challenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{challenge.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {challenge.category}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(challenge.severity)}`}
                        >
                          深刻度: {challenge.severity}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{challenge.description}</p>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h5 className="font-medium text-yellow-900 mb-2">学んだこと</h5>
                      <p className="text-sm text-yellow-800">{challenge.lessons}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 洞察タブ */}
            {selectedTab === 'insights' && (
              <div className="space-y-6">
                {report.insights.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{insight.insight}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {insight.category}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          重要度: {insight.importance}/10
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">今後の活用方法</h5>
                      <p className="text-sm text-blue-800">{insight.application}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 推奨事項タブ */}
            {selectedTab === 'recommendations' && (
              <div className="space-y-6">
                {report.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{recommendation.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(recommendation.priority)}`}
                        >
                          {recommendation.priority === 'high'
                            ? '高'
                            : recommendation.priority === 'medium'
                              ? '中'
                              : '低'}
                          優先度
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {recommendation.timeFrame}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{recommendation.description}</p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-medium text-green-900 mb-2">期待される結果</h5>
                      <p className="text-sm text-green-800">{recommendation.expectedOutcome}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="text-center">
          <Button
            onClick={() => (window.location.href = '/dashboard')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-xl"
          >
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
