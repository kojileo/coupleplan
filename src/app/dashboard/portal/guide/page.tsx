'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import Button from '@/components/ui/button';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: GuideStep[];
  isExpanded: boolean;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tips?: string[];
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function GuidePage(): ReactElement {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'はじめに',
      description: 'CouplePlanの基本的な使い方を学びましょう',
      icon: '🚀',
      isExpanded: false,
      steps: [
        {
          id: '1',
          title: 'アカウント作成',
          description: 'メールアドレスまたはSNSアカウントでアカウントを作成します。',
          tips: ['パートナーとの連携も忘れずに設定しましょう'],
        },
        {
          id: '2',
          title: 'プロフィール設定',
          description: 'お互いの好みや興味を設定して、より良い提案を受けられます。',
          tips: ['詳細に設定するほど、AIの提案が精度が上がります'],
        },
        {
          id: '3',
          title: '初回デートプラン作成',
          description: 'AIデートプラン提案機能を使って、最初のプランを作成してみましょう。',
          tips: ['予算や時間、エリアを指定するとより具体的な提案ができます'],
        },
      ],
    },
    {
      id: 'ai-planning',
      title: 'AIデートプラン提案',
      description: 'AIを活用したデートプラン作成の方法',
      icon: '🤖',
      isExpanded: false,
      steps: [
        {
          id: '1',
          title: 'プラン作成画面を開く',
          description: 'ダッシュボードから「AIデートプラン提案」を選択します。',
        },
        {
          id: '2',
          title: '条件を入力',
          description: '予算、時間、エリア、好みなどの条件を入力します。',
          tips: ['できるだけ具体的に入力すると、より良い提案が得られます'],
        },
        {
          id: '3',
          title: 'AI生成を待つ',
          description: 'AIが最適なプランを生成するまで少し待ちます。',
          tips: ['通常30秒以内に完了します'],
        },
        {
          id: '4',
          title: 'プランを選択・カスタマイズ',
          description:
            '提案されたプランから気に入ったものを選択し、必要に応じてカスタマイズします。',
        },
      ],
    },
    {
      id: 'collaboration',
      title: 'カップル共同編集',
      description: 'パートナーと一緒にプランを作成する方法',
      icon: '👥',
      isExpanded: false,
      steps: [
        {
          id: '1',
          title: '共同編集セッションを開始',
          description: 'プラン作成画面で「共同編集」を選択します。',
        },
        {
          id: '2',
          title: 'パートナーを招待',
          description: 'パートナーに招待リンクを送信します。',
          tips: ['メールやメッセージアプリで共有できます'],
        },
        {
          id: '3',
          title: 'リアルタイム編集',
          description: 'お互いが同時に編集できる状態になります。',
          tips: ['相手のカーソル位置も表示されます'],
        },
        {
          id: '4',
          title: '競合解決',
          description: '同時編集による競合が発生した場合は、解決画面で調整します。',
        },
      ],
    },
    {
      id: 'conflict-resolution',
      title: 'AI喧嘩仲裁・関係修復',
      description: '関係修復のためのAIサポート機能',
      icon: '💕',
      isExpanded: false,
      steps: [
        {
          id: '1',
          title: '仲裁依頼を作成',
          description: '関係修復画面で現在の状況を入力します。',
        },
        {
          id: '2',
          title: 'AI分析',
          description: 'AIが状況を分析し、改善提案を行います。',
          tips: ['プライバシーは厳重に保護されます'],
        },
        {
          id: '3',
          title: '改善プランの実行',
          description: '提案された改善プランを実行します。',
        },
        {
          id: '4',
          title: '振り返り',
          description: '定期的に振り返りを行い、関係の改善を確認します。',
        },
      ],
    },
    {
      id: 'date-canvas',
      title: 'Date Canvas',
      description: '思い出を美しく記録する方法',
      icon: '🎨',
      isExpanded: false,
      steps: [
        {
          id: '1',
          title: 'キャンバスを作成',
          description: 'Date Canvas画面で新しいキャンバスを作成します。',
        },
        {
          id: '2',
          title: '写真を追加',
          description: 'デートの写真をアップロードして配置します。',
          tips: ['ドラッグ&ドロップで簡単に配置できます'],
        },
        {
          id: '3',
          title: 'テキストや装飾を追加',
          description: '思い出のコメントや装飾要素を追加します。',
        },
        {
          id: '4',
          title: '共有・保存',
          description: '完成したキャンバスを保存したり、パートナーと共有します。',
        },
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'アプリは無料で使えますか？',
      answer:
        'はい、基本的な機能は無料でご利用いただけます。より高度な機能をご利用いただく場合は、プレミアムプラン（月額¥980）をご検討ください。',
      category: 'general',
    },
    {
      id: '2',
      question: 'パートナーとの連携はどのように行いますか？',
      answer:
        'アプリ内の「パートナー連携」機能から、パートナーのメールアドレスを入力して招待を送信できます。パートナーが招待を受け入れると、共同編集などの機能が利用できるようになります。',
      category: 'collaboration',
    },
    {
      id: '3',
      question: 'AIの提案はどの程度正確ですか？',
      answer:
        'AIは学習データに基づいて提案を行いますが、個人の好みは千差万別です。提案されたプランは参考としてご活用いただき、必要に応じてカスタマイズすることをお勧めします。',
      category: 'ai',
    },
    {
      id: '4',
      question: 'データのプライバシーは保護されますか？',
      answer:
        'はい、すべてのデータは暗号化されて保存され、第三者と共有されることはありません。また、AI分析においても個人を特定できない形で処理されます。',
      category: 'privacy',
    },
    {
      id: '5',
      question: 'オフラインでも使えますか？',
      answer:
        'はい、一度ダウンロードしたプランはオフラインでも確認できます。ただし、新しいプランの作成や共同編集にはインターネット接続が必要です。',
      category: 'technical',
    },
    {
      id: '6',
      question: 'サポートはありますか？',
      answer:
        'はい、アプリ内のヘルプセンターからお問い合わせいただけます。また、よくある質問も充実していますので、まずはそちらをご確認ください。',
      category: 'support',
    },
  ];

  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'general', name: '一般的な質問' },
    { id: 'collaboration', name: '共同編集' },
    { id: 'ai', name: 'AI機能' },
    { id: 'privacy', name: 'プライバシー' },
    { id: 'technical', name: '技術的な質問' },
    { id: 'support', name: 'サポート' },
  ];

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const filteredFAQs =
    selectedCategory === 'all' ? faqs : faqs.filter((faq) => faq.category === selectedCategory);

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
              <h1 className="text-2xl font-bold text-gray-900">利用ガイド</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">CouplePlan利用ガイド</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            CouplePlanの機能を最大限活用して、素敵なデートプランを作成しましょう
          </p>
        </div>

        {/* ガイドセクション */}
        <div className="space-y-8 mb-16">
          {guideSections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <button
                onClick={() => handleSectionToggle(section.id)}
                className="w-full p-8 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{section.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                  <div className="text-2xl text-gray-400">
                    {expandedSection === section.id ? '−' : '+'}
                  </div>
                </div>
              </button>

              {expandedSection === section.id && (
                <div className="px-8 pb-8">
                  <div className="space-y-6">
                    {section.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                          <p className="text-gray-600 mb-3">{step.description}</p>
                          {step.tips && (
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h4 className="font-medium text-blue-900 mb-2">💡 ヒント</h4>
                              <ul className="space-y-1">
                                {step.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="text-sm text-blue-800">
                                    • {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQセクション */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">よくある質問</h2>

          {/* カテゴリフィルター */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ一覧 */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Q. {faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">A. {faq.answer}</p>
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">該当する質問が見つかりませんでした</p>
            </div>
          )}
        </div>

        {/* サポート情報 */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">さらにサポートが必要ですか？</h3>
            <p className="text-lg mb-6">お困りの際は、お気軽にお問い合わせください</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => (window.location.href = '/contact')}
                variant="outline"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                お問い合わせ
              </Button>
              <Button
                onClick={() => (window.location.href = '/faq')}
                variant="outline"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                よくある質問
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
