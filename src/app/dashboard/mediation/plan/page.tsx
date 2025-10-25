'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface ImprovementPlan {
  id: string;
  coupleId: string;
  planName: string;
  startDate: number;
  endDate: number;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  goals: Goal[];
  activities: PlanActivity[];
  milestones: Milestone[];
  resources: Resource[];
}

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetDate: number;
  isAchieved: boolean;
  progress: number;
}

interface PlanActivity {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'couple' | 'guided';
  frequency: string;
  duration: string;
  isCompleted: boolean;
  completedDate?: number;
  notes?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: number;
  isAchieved: boolean;
  achievedDate?: number;
  celebration?: string;
}

interface Resource {
  id: string;
  name: string;
  type: 'document' | 'video' | 'exercise' | 'tool';
  description: string;
  url?: string;
  isUsed: boolean;
}

export default function ImprovementPlanPage(): ReactElement {
  const [plan, setPlan] = useState<ImprovementPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'activities' | 'goals' | 'resources'>(
    'overview'
  );
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);

      // 関係改善プランのシミュレーション
      const mockPlan: ImprovementPlan = {
        id: 'plan123',
        coupleId: 'couple123',
        planName: '段階的関係修復プラン',
        startDate: Date.now(),
        endDate: Date.now() + 10 * 7 * 24 * 60 * 60 * 1000, // 10週間後
        status: 'active',
        progress: 35,
        goals: [
          {
            id: 'goal1',
            title: '相互理解の深化',
            description: 'お互いの立場や感情を理解し合えるようになる',
            priority: 'high',
            targetDate: Date.now() + 4 * 7 * 24 * 60 * 60 * 1000, // 4週間後
            isAchieved: false,
            progress: 60,
          },
          {
            id: 'goal2',
            title: '建設的な対話の確立',
            description: '感情をコントロールしながら建設的な対話ができるようになる',
            priority: 'high',
            targetDate: Date.now() + 6 * 7 * 24 * 60 * 60 * 1000, // 6週間後
            isAchieved: false,
            progress: 40,
          },
          {
            id: 'goal3',
            title: '安定した関係の構築',
            description: '長期的に安定した関係を構築する',
            priority: 'medium',
            targetDate: Date.now() + 10 * 7 * 24 * 60 * 60 * 1000, // 10週間後
            isAchieved: false,
            progress: 20,
          },
        ],
        activities: [
          {
            id: 'act1',
            title: '感情日記の記録',
            description: '毎日の感情を記録し、パターンを理解する',
            type: 'individual',
            frequency: '毎日',
            duration: '15分',
            isCompleted: false,
          },
          {
            id: 'act2',
            title: 'アクティブリスニングの練習',
            description: '相手の話を最後まで聞き、理解を示す練習',
            type: 'couple',
            frequency: '週3回',
            duration: '30分',
            isCompleted: false,
          },
          {
            id: 'act3',
            title: '建設的な対話セッション',
            description: '感情をコントロールしながら意見を交換する',
            type: 'guided',
            frequency: '週1回',
            duration: '1時間',
            isCompleted: false,
          },
          {
            id: 'act4',
            title: '共通の趣味の発見',
            description: 'お互いの興味を理解し、共通点を見つける',
            type: 'couple',
            frequency: '週1回',
            duration: '2時間',
            isCompleted: false,
          },
        ],
        milestones: [
          {
            id: 'milestone1',
            title: '第1段階完了',
            description: '感情の整理と理解が完了',
            targetDate: Date.now() + 2 * 7 * 24 * 60 * 60 * 1000, // 2週間後
            isAchieved: false,
            celebration: '小さな記念日を祝う',
          },
          {
            id: 'milestone2',
            title: '第2段階完了',
            description: '建設的な対話ができるようになった',
            targetDate: Date.now() + 5 * 7 * 24 * 60 * 60 * 1000, // 5週間後
            isAchieved: false,
            celebration: '特別なデートを計画する',
          },
          {
            id: 'milestone3',
            title: 'プラン完了',
            description: '関係改善プランが完了',
            targetDate: Date.now() + 10 * 7 * 24 * 60 * 60 * 1000, // 10週間後
            isAchieved: false,
            celebration: '関係の新たなスタートを祝う',
          },
        ],
        resources: [
          {
            id: 'res1',
            name: '感情日記テンプレート',
            type: 'document',
            description: '感情を記録するためのテンプレート',
            isUsed: false,
          },
          {
            id: 'res2',
            name: 'アクティブリスニングガイド',
            type: 'document',
            description: '効果的なリスニングの方法を学ぶガイド',
            isUsed: false,
          },
          {
            id: 'res3',
            name: '対話練習ビデオ',
            type: 'video',
            description: '建設的な対話の練習方法を学ぶビデオ',
            url: '/videos/communication-practice',
            isUsed: false,
          },
          {
            id: 'res4',
            name: '関係性チェックリスト',
            type: 'tool',
            description: '関係の進捗を確認するチェックリスト',
            isUsed: false,
          },
        ],
      };

      // プラン読み込みのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPlan(mockPlan);
      setIsLoading(false);
    };

    void loadPlan();
  }, []);

  const handleActivityComplete = async (activityId: string) => {
    if (!plan) return;

    // アクティビティ完了のシミュレーション
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activities: prev.activities.map((activity) =>
          activity.id === activityId
            ? { ...activity, isCompleted: true, completedDate: Date.now() }
            : activity
        ),
        progress: Math.min(100, prev.progress + 5), // 進捗を5%増加
      };
    });

    alert('アクティビティを完了しました！');
  };

  const handleGoalUpdate = (goalId: string, progress: number) => {
    if (!plan) return;

    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        goals: prev.goals.map((goal) =>
          goal.id === goalId ? { ...goal, progress: Math.min(100, progress) } : goal
        ),
      };
    });
  };

  const handleResourceUse = (resourceId: string) => {
    if (!plan) return;

    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        resources: prev.resources.map((resource) =>
          resource.id === resourceId ? { ...resource, isUsed: true } : resource
        ),
      };
    });
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

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'video':
        return '🎥';
      case 'exercise':
        return '💪';
      case 'tool':
        return '🔧';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">プランを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">プランが見つかりませんでした</p>
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
              <h1 className="text-2xl font-bold text-gray-900">関係改善プラン</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  plan.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : plan.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {plan.status === 'active'
                  ? '進行中'
                  : plan.status === 'completed'
                    ? '完了'
                    : '一時停止'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* プラン概要 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{plan.planName}</h2>
            <p className="text-gray-600 mb-6">
              開始日: {new Date(plan.startDate).toLocaleDateString()} - 終了予定:{' '}
              {new Date(plan.endDate).toLocaleDateString()}
            </p>

            {/* 進捗バー */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${plan.progress}%` }}
              ></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{plan.progress}%</div>
            <div className="text-sm text-gray-500">完了</div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', name: '概要', icon: '📊' },
                { id: 'activities', name: 'アクティビティ', icon: '🎯' },
                { id: 'goals', name: 'ゴール', icon: '🎯' },
                { id: 'resources', name: 'リソース', icon: '📚' },
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
                {/* マイルストーン */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">マイルストーン</h3>
                  <div className="space-y-4">
                    {plan.milestones.map((milestone) => (
                      <div key={milestone.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-900">{milestone.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                milestone.isAchieved
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {milestone.isAchieved ? '達成済み' : '未達成'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(milestone.targetDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{milestone.description}</p>
                        {milestone.celebration && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-900 mb-2">お祝い</h5>
                            <p className="text-sm text-green-800">{milestone.celebration}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* アクティビティタブ */}
            {selectedTab === 'activities' && (
              <div className="space-y-6">
                {plan.activities.map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{activity.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getActivityTypeColor(activity.type)}`}
                        >
                          {activity.type === 'individual'
                            ? '個人'
                            : activity.type === 'couple'
                              ? 'カップル'
                              : 'ガイド付き'}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            activity.isCompleted
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {activity.isCompleted ? '完了' : '未完了'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{activity.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">頻度</div>
                        <div className="font-medium">{activity.frequency}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">時間</div>
                        <div className="font-medium">{activity.duration}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">タイプ</div>
                        <div className="font-medium">{activity.type}</div>
                      </div>
                    </div>

                    {!activity.isCompleted && (
                      <div className="text-center">
                        <Button
                          onClick={() => handleActivityComplete(activity.id)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          このアクティビティを完了する
                        </Button>
                      </div>
                    )}

                    {activity.isCompleted && activity.completedDate && (
                      <div className="text-center text-sm text-green-600">
                        完了日: {new Date(activity.completedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ゴールタブ */}
            {selectedTab === 'goals' && (
              <div className="space-y-6">
                {plan.goals.map((goal) => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{goal.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(goal.priority)}`}
                        >
                          {goal.priority === 'high'
                            ? '高'
                            : goal.priority === 'medium'
                              ? '中'
                              : '低'}
                          優先度
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            goal.isAchieved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {goal.isAchieved ? '達成済み' : '未達成'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{goal.description}</p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">進捗</span>
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      目標日: {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* リソースタブ */}
            {selectedTab === 'resources' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.resources.map((resource) => (
                  <div key={resource.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getResourceTypeIcon(resource.type)}</span>
                        <h4 className="text-lg font-bold text-gray-900">{resource.name}</h4>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          resource.isUsed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {resource.isUsed ? '使用済み' : '未使用'}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{resource.description}</p>

                    {resource.url && (
                      <div className="mb-4">
                        <Button
                          onClick={() => window.open(resource.url, '_blank')}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          リソースを開く
                        </Button>
                      </div>
                    )}

                    {!resource.isUsed && (
                      <Button
                        onClick={() => handleResourceUse(resource.id)}
                        size="sm"
                        className="w-full"
                      >
                        使用済みにマーク
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="text-center">
          <Button
            onClick={() => (window.location.href = '/dashboard/mediation/report')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-xl"
          >
            振り返りレポートを作成
          </Button>
        </div>
      </div>
    </div>
  );
}
