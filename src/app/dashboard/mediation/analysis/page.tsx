'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface AnalysisResult {
  id: string;
  coupleId: string;
  analysisDate: number;
  overallScore: number;
  emotionalTone: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keyIssues: KeyIssue[];
  communicationPatterns: CommunicationPattern[];
  recommendations: Recommendation[];
  riskFactors: RiskFactor[];
  strengths: Strength[];
}

interface KeyIssue {
  id: string;
  category: string;
  severity: number;
  description: string;
  impact: number;
  frequency: number;
}

interface CommunicationPattern {
  id: string;
  pattern: string;
  frequency: number;
  effectiveness: number;
  description: string;
}

interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  expectedOutcome: string;
  timeFrame: string;
}

interface RiskFactor {
  id: string;
  factor: string;
  severity: number;
  description: string;
  mitigation: string;
}

interface Strength {
  id: string;
  strength: string;
  description: string;
  utilization: string;
}

export default function AnalysisPage(): ReactElement {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'issues' | 'patterns' | 'recommendations'
  >('overview');

  useEffect(() => {
    const loadAnalysis = async () => {
      setIsLoading(true);

      // AI分析結果のシミュレーション
      const mockAnalysisResult: AnalysisResult = {
        id: 'analysis123',
        coupleId: 'couple123',
        analysisDate: Date.now(),
        overallScore: 6.8,
        emotionalTone: {
          positive: 35,
          negative: 45,
          neutral: 20,
        },
        keyIssues: [
          {
            id: '1',
            category: 'コミュニケーション',
            severity: 8,
            description: 'デートプランの決定プロセスでの意見の相違',
            impact: 7,
            frequency: 6,
          },
          {
            id: '2',
            category: '価値観',
            severity: 6,
            description: '趣味や興味の違いによる理解不足',
            impact: 5,
            frequency: 4,
          },
          {
            id: '3',
            category: '時間管理',
            severity: 5,
            description: 'お互いのスケジュール調整の難しさ',
            impact: 4,
            frequency: 3,
          },
        ],
        communicationPatterns: [
          {
            id: '1',
            pattern: '回避的コミュニケーション',
            frequency: 7,
            effectiveness: 3,
            description: '対立を避けるために重要な話題を避ける傾向',
          },
          {
            id: '2',
            pattern: '感情的コミュニケーション',
            frequency: 6,
            effectiveness: 4,
            description: '感情的な表現が多いが、建設的な解決に至らない',
          },
          {
            id: '3',
            pattern: '一方的コミュニケーション',
            frequency: 5,
            effectiveness: 2,
            description: '一方が主導し、相手の意見を聞かない傾向',
          },
        ],
        recommendations: [
          {
            id: '1',
            priority: 'high',
            category: 'コミュニケーション',
            title: 'アクティブリスニングの実践',
            description: '相手の話を最後まで聞き、理解を示す練習',
            expectedOutcome: '相互理解の向上',
            timeFrame: '2-3週間',
          },
          {
            id: '2',
            priority: 'high',
            category: '対立解決',
            title: '建設的な対話の練習',
            description: '感情をコントロールしながら意見を交換する方法',
            expectedOutcome: '対立の早期解決',
            timeFrame: '1-2週間',
          },
          {
            id: '3',
            priority: 'medium',
            category: '関係性',
            title: '共通の趣味の発見',
            description: 'お互いの興味を理解し、共通点を見つける',
            expectedOutcome: '絆の強化',
            timeFrame: '1ヶ月',
          },
        ],
        riskFactors: [
          {
            id: '1',
            factor: 'コミュニケーションの悪化',
            severity: 8,
            description: '現在の対立が長期間続く可能性',
            mitigation: '早期の対話と理解の促進',
          },
          {
            id: '2',
            factor: '関係性の冷却',
            severity: 6,
            description: '感情的な距離が広がるリスク',
            mitigation: 'ポジティブな交流の増加',
          },
        ],
        strengths: [
          {
            id: '1',
            strength: '相互尊重',
            description: 'お互いを尊重する姿勢は保たれている',
            utilization: 'この基盤を活かして対話を深める',
          },
          {
            id: '2',
            strength: '問題解決意欲',
            description: '関係を改善したいという強い意欲',
            utilization: 'この意欲を具体的な行動に移す',
          },
        ],
      };

      // 分析のシミュレーション（3秒待機）
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setAnalysisResult(mockAnalysisResult);
      setIsLoading(false);
    };

    loadAnalysis();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    // レポート生成のシミュレーション
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert('詳細レポートを生成しました');
    setIsGenerating(false);
  };

  const handleStartMediation = () => {
    window.location.href = '/dashboard/mediation/proposal';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return '良好';
    if (score >= 6) return '普通';
    return '要注意';
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI分析中</h2>
          <p className="text-gray-600 mb-4">あなたの関係性を分析しています...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: '75%' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">分析結果が見つかりませんでした</p>
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
              <h1 className="text-2xl font-bold text-gray-900">AI状況分析</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                {isGenerating ? '生成中...' : 'レポート生成'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 分析結果サマリー */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI分析結果</h2>
            <p className="text-gray-600">
              あなたの関係性をAIが分析し、改善のための提案をまとめました
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                {analysisResult.overallScore.toFixed(1)}
              </div>
              <div className="text-lg text-gray-600">総合スコア</div>
              <div className={`text-sm font-medium ${getScoreColor(analysisResult.overallScore)}`}>
                {getScoreLabel(analysisResult.overallScore)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {analysisResult.keyIssues.length}
              </div>
              <div className="text-lg text-gray-600">主要課題</div>
              <div className="text-sm text-gray-500">改善が必要な領域</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {analysisResult.strengths.length}
              </div>
              <div className="text-lg text-gray-600">関係の強み</div>
              <div className="text-sm text-gray-500">活用できる要素</div>
            </div>
          </div>

          {/* 感情トーン分析 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">感情トーン分析</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResult.emotionalTone.positive}%
                </div>
                <div className="text-sm text-green-800">ポジティブ</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analysisResult.emotionalTone.negative}%
                </div>
                <div className="text-sm text-red-800">ネガティブ</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {analysisResult.emotionalTone.neutral}%
                </div>
                <div className="text-sm text-gray-800">ニュートラル</div>
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
                { id: 'issues', name: '主要課題', icon: '⚠️' },
                { id: 'patterns', name: 'コミュニケーション', icon: '💬' },
                { id: 'recommendations', name: '推奨事項', icon: '💡' },
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">リスク要因</h3>
                    <div className="space-y-3">
                      {analysisResult.riskFactors.map((risk) => (
                        <div key={risk.id} className="p-4 bg-red-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{risk.factor}</h4>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(risk.severity)}`}
                            >
                              深刻度: {risk.severity}/10
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                          <p className="text-sm text-blue-600">対策: {risk.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">関係の強み</h3>
                    <div className="space-y-3">
                      {analysisResult.strengths.map((strength) => (
                        <div key={strength.id} className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">{strength.strength}</h4>
                          <p className="text-sm text-gray-600 mb-2">{strength.description}</p>
                          <p className="text-sm text-green-600">活用方法: {strength.utilization}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 主要課題タブ */}
            {selectedTab === 'issues' && (
              <div className="space-y-6">
                {analysisResult.keyIssues.map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{issue.category}</h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(issue.severity)}`}
                        >
                          深刻度: {issue.severity}/10
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          影響度: {issue.impact}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{issue.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>頻度: {issue.frequency}/10</span>
                      <span>カテゴリ: {issue.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* コミュニケーションパターンタブ */}
            {selectedTab === 'patterns' && (
              <div className="space-y-6">
                {analysisResult.communicationPatterns.map((pattern) => (
                  <div key={pattern.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{pattern.pattern}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          頻度: {pattern.frequency}/10
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            pattern.effectiveness >= 6
                              ? 'bg-green-100 text-green-800'
                              : pattern.effectiveness >= 4
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          効果性: {pattern.effectiveness}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600">{pattern.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 推奨事項タブ */}
            {selectedTab === 'recommendations' && (
              <div className="space-y-6">
                {analysisResult.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{recommendation.title}</h3>
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
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">期待される結果</h4>
                      <p className="text-sm text-blue-800">{recommendation.expectedOutcome}</p>
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
            onClick={handleStartMediation}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-xl"
          >
            仲裁提案を開始する
          </Button>
        </div>
      </div>
    </div>
  );
}
