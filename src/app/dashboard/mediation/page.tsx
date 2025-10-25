'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface RelationshipData {
  coupleId: string;
  relationshipScore: number;
  recentEvents: RecentEvent[];
  lastMediationDate?: number;
  mediationCount: number;
}

interface RecentEvent {
  id: string;
  date: number;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  impact: number; // 1-5 scale
}

interface ConflictHistory {
  id: string;
  date: number;
  severity: 'low' | 'medium' | 'high';
  topic: string;
  status: 'resolved' | 'ongoing' | 'escalated';
  description: string;
  resolution?: string;
}

interface MediationRequest {
  coupleId: string;
  conflictSummary: string;
  desiredOutcome: string;
  urgency: 'low' | 'medium' | 'high';
  preferredTime: string;
  isAnonymous: boolean;
  additionalContext?: string;
}

export default function MediationRequestPage(): ReactElement {
  const [relationshipData, setRelationshipData] = useState<RelationshipData | null>(null);
  const [conflictHistory, setConflictHistory] = useState<ConflictHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formData, setFormData] = useState<MediationRequest>({
    coupleId: '',
    conflictSummary: '',
    desiredOutcome: '',
    urgency: 'medium',
    preferredTime: '',
    isAnonymous: false,
    additionalContext: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);

      // 関係性データのシミュレーション
      const mockRelationshipData: RelationshipData = {
        coupleId: 'couple123',
        relationshipScore: 7.2,
        recentEvents: [
          {
            id: '1',
            date: Date.now() - 86400000, // 1日前
            type: 'negative',
            description: 'デートプランについて意見が分かれた',
            impact: 3,
          },
          {
            id: '2',
            date: Date.now() - 172800000, // 2日前
            type: 'positive',
            description: '一緒に料理をして楽しい時間を過ごした',
            impact: 4,
          },
          {
            id: '3',
            date: Date.now() - 259200000, // 3日前
            type: 'neutral',
            description: '日常的な会話を交わした',
            impact: 2,
          },
        ],
        lastMediationDate: Date.now() - 604800000, // 1週間前
        mediationCount: 2,
      };

      // 対立履歴のシミュレーション
      const mockConflictHistory: ConflictHistory[] = [
        {
          id: '1',
          date: Date.now() - 86400000,
          severity: 'high',
          topic: 'デートプランの意見相違',
          status: 'ongoing',
          description: '週末のデートプランについて、お互いの希望が合わず対立が発生',
        },
        {
          id: '2',
          date: Date.now() - 604800000,
          severity: 'medium',
          topic: '家事分担',
          status: 'resolved',
          description: '家事の分担について話し合い、解決策を見つけた',
          resolution: '役割分担表を作成し、お互いの負担を軽減',
        },
        {
          id: '3',
          date: Date.now() - 1209600000, // 2週間前
          severity: 'low',
          topic: '趣味の時間',
          status: 'resolved',
          description: '個人の趣味の時間について理解を深めることができた',
          resolution: 'お互いの趣味を尊重し、適度な距離感を保つことに合意',
        },
      ];

      setRelationshipData(mockRelationshipData);
      setConflictHistory(mockConflictHistory);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof MediationRequest, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.conflictSummary.trim()) {
      newErrors.conflictSummary = '対立の概要を入力してください';
    } else if (formData.conflictSummary.length < 10) {
      newErrors.conflictSummary = '10文字以上で入力してください';
    }

    if (!formData.desiredOutcome.trim()) {
      newErrors.desiredOutcome = '希望する結果を入力してください';
    } else if (formData.desiredOutcome.length < 10) {
      newErrors.desiredOutcome = '10文字以上で入力してください';
    }

    if (!formData.preferredTime.trim()) {
      newErrors.preferredTime = '連絡可能時間を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 仲裁依頼の送信シミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert('仲裁依頼を送信しました。AI分析を開始します。');
      window.location.href = '/dashboard/mediation/analysis';
    } catch (error) {
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const getRelationshipScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRelationshipScoreLabel = (score: number) => {
    if (score >= 8) return '良好';
    if (score >= 6) return '普通';
    return '要注意';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">AI仲裁・関係修復</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>🔒</span>
                <span>プライバシー保護</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 関係性データ */}
        {relationshipData && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">現在の関係性</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div
                  className={`text-3xl font-bold ${getRelationshipScoreColor(relationshipData.relationshipScore)}`}
                >
                  {relationshipData.relationshipScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">関係性スコア</div>
                <div
                  className={`text-sm font-medium ${getRelationshipScoreColor(relationshipData.relationshipScore)}`}
                >
                  {getRelationshipScoreLabel(relationshipData.relationshipScore)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {relationshipData.mediationCount}
                </div>
                <div className="text-sm text-gray-600">仲裁回数</div>
                <div className="text-sm text-gray-500">
                  {relationshipData.lastMediationDate
                    ? `前回: ${new Date(relationshipData.lastMediationDate).toLocaleDateString()}`
                    : '初回'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {relationshipData.recentEvents.filter((e) => e.type === 'positive').length}
                </div>
                <div className="text-sm text-gray-600">最近のポジティブイベント</div>
                <div className="text-sm text-gray-500">直近3件</div>
              </div>
            </div>
          </div>
        )}

        {/* 対立履歴 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">最近の対立履歴</h2>
          <div className="space-y-4">
            {conflictHistory.map((conflict) => (
              <div key={conflict.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{conflict.topic}</h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(conflict.severity)}`}
                    >
                      {conflict.severity === 'high'
                        ? '高'
                        : conflict.severity === 'medium'
                          ? '中'
                          : '低'}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conflict.status)}`}
                    >
                      {conflict.status === 'resolved'
                        ? '解決済み'
                        : conflict.status === 'ongoing'
                          ? '継続中'
                          : 'エスカレート'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{conflict.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(conflict.date).toLocaleDateString()}</span>
                  {conflict.resolution && (
                    <span className="text-green-600">解決策: {conflict.resolution}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 仲裁依頼フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">仲裁依頼</h2>

          <div className="space-y-6">
            {/* 対立の概要 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対立の概要 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.conflictSummary}
                onChange={(e) => handleInputChange('conflictSummary', e.target.value)}
                placeholder="現在の対立状況について詳しく教えてください。具体的な出来事、感情、背景などを含めて記述してください。"
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.conflictSummary ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.conflictSummary && (
                <p className="text-red-500 text-sm mt-1">{errors.conflictSummary}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {formData.conflictSummary.length}/500文字
              </p>
            </div>

            {/* 希望する結果 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望する結果 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.desiredOutcome}
                onChange={(e) => handleInputChange('desiredOutcome', e.target.value)}
                placeholder="この対立を通じてどのような結果を望んでいますか？和解、理解の深化、具体的な解決策など、あなたの希望を教えてください。"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.desiredOutcome ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.desiredOutcome && (
                <p className="text-red-500 text-sm mt-1">{errors.desiredOutcome}</p>
              )}
            </div>

            {/* 緊急度と連絡時間 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">緊急度</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">低 - 時間をかけて解決したい</option>
                  <option value="medium">中 - 適度な緊急度</option>
                  <option value="high">高 - 早急な解決が必要</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  連絡可能時間 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.preferredTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">選択してください</option>
                  <option value="morning">午前中 (9:00-12:00)</option>
                  <option value="afternoon">午後 (13:00-17:00)</option>
                  <option value="evening">夕方 (18:00-21:00)</option>
                  <option value="night">夜 (21:00-23:00)</option>
                </select>
                {errors.preferredTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.preferredTime}</p>
                )}
              </div>
            </div>

            {/* 追加情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                追加情報（任意）
              </label>
              <textarea
                value={formData.additionalContext}
                onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                placeholder="その他、仲裁に役立ちそうな情報があれば教えてください。"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 匿名オプション */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                匿名で仲裁を依頼する（パートナーに依頼内容が知られません）
              </label>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3"
            >
              {isSubmitting ? '送信中...' : '仲裁を依頼する'}
            </Button>
          </div>
        </div>
      </div>

      {/* 確認モーダル */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">仲裁依頼の確認</h3>
            <p className="text-gray-600 mb-6">
              以下の内容で仲裁を依頼しますか？
              <br />
              送信後、AI分析が開始されます。
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>
                <strong>緊急度:</strong>{' '}
                {formData.urgency === 'high' ? '高' : formData.urgency === 'medium' ? '中' : '低'}
              </p>
              <p>
                <strong>連絡時間:</strong> {formData.preferredTime}
              </p>
              <p>
                <strong>匿名:</strong> {formData.isAnonymous ? 'はい' : 'いいえ'}
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
