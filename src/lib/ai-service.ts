// AI Service
// AIを活用したデートプラン生成サービス

import {
  AIGenerationRequest,
  AIGenerationResponse,
  GeneratedPlan,
  GeneratedPlanItem,
  PlanItemType,
} from '@/types/date-plan';

/**
 * AI生成エラー
 */
export class AIGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

/**
 * AIプロバイダー
 */
type AIProvider = 'openai' | 'anthropic' | 'mock';

/**
 * AI設定
 */
interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * AI設定の取得
 */
function getAIConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER || 'mock') as AIProvider;

  return {
    provider,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || (provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet'),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  };
}

/**
 * デートプランを生成
 */
export async function generateDatePlan(
  request: AIGenerationRequest
): Promise<AIGenerationResponse> {
  const config = getAIConfig();
  const startTime = Date.now();

  try {
    let plans: GeneratedPlan[];

    switch (config.provider) {
      case 'openai':
        plans = await generateWithOpenAI(request, config);
        break;
      case 'anthropic':
        plans = await generateWithAnthropic(request, config);
        break;
      case 'mock':
      default:
        plans = await generateWithMock(request);
        break;
    }

    const generationTime = (Date.now() - startTime) / 1000;

    return {
      generation_id: `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      plans,
      generation_time: generationTime,
      metadata: {
        model_used: config.model || 'mock',
        confidence_score: 0.85,
      },
    };
  } catch (error) {
    console.error('AI生成エラー:', error);
    throw new AIGenerationError('デートプランの生成に失敗しました', 'GENERATION_FAILED', error);
  }
}

/**
 * OpenAI APIを使用してプランを生成
 */
async function generateWithOpenAI(
  request: AIGenerationRequest,
  config: AIConfig
): Promise<GeneratedPlan[]> {
  if (!config.apiKey) {
    throw new AIGenerationError('OpenAI APIキーが設定されていません', 'MISSING_API_KEY');
  }

  const prompt = buildPrompt(request);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content:
            'あなたはカップル向けのデートプラン提案の専門家です。ユーザーの要望に基づいて、具体的で実行可能なデートプランを提案してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AIGenerationError('OpenAI APIエラー', 'OPENAI_API_ERROR', error);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new AIGenerationError('AI応答が空です', 'EMPTY_RESPONSE');
  }

  return parseAIResponse(content);
}

/**
 * Anthropic APIを使用してプランを生成
 */
async function generateWithAnthropic(
  request: AIGenerationRequest,
  config: AIConfig
): Promise<GeneratedPlan[]> {
  if (!config.apiKey) {
    throw new AIGenerationError('Anthropic APIキーが設定されていません', 'MISSING_API_KEY');
  }

  const prompt = buildPrompt(request);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AIGenerationError('Anthropic APIエラー', 'ANTHROPIC_API_ERROR', error);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new AIGenerationError('AI応答が空です', 'EMPTY_RESPONSE');
  }

  return parseAIResponse(content);
}

/**
 * モックデータを使用してプランを生成
 */
async function generateWithMock(request: AIGenerationRequest): Promise<GeneratedPlan[]> {
  // モック生成時間をシミュレート
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { location, budget, duration, preferences } = request;

  // サンプルプランを生成
  const plans: GeneratedPlan[] = [
    {
      title: `${location.city}で楽しむ${duration}時間デート`,
      description: `${location.prefecture}${location.city}を満喫する、予算${budget.toLocaleString()}円の充実したデートプランです。`,
      budget: budget * 0.95,
      duration: duration * 60,
      score: 0.92,
      reason: `過去のデート履歴とお二人の好みを分析し、${preferences.join('、')}を中心とした最適なプランを提案しました。`,
      items: [
        {
          type: 'cafe',
          name: 'おしゃれカフェでモーニング',
          description: `${location.city}で人気のカフェでゆったりとした朝食を楽しみます`,
          location: `${location.station || location.city}駅近く`,
          start_time: '10:00',
          duration: 60,
          cost: 2000,
          order_index: 1,
        },
        {
          type: 'activity',
          name: preferences[0] || '散歩',
          description: `お二人の好きな${preferences[0] || '散歩'}を楽しみます`,
          location: `${location.city}の人気スポット`,
          start_time: '11:30',
          duration: 120,
          cost: 0,
          order_index: 2,
        },
        {
          type: 'restaurant',
          name: `${location.city}の人気レストランでランチ`,
          description: '地元で評判の美味しいレストランで特別なランチを',
          location: `${location.station || location.city}駅周辺`,
          start_time: '13:30',
          duration: 90,
          cost: budget * 0.4,
          order_index: 3,
        },
        {
          type: 'shopping',
          name: 'ショッピングタイム',
          description: 'お互いへのプレゼント探しや、気になるお店を巡ります',
          location: `${location.city}のショッピングエリア`,
          start_time: '15:00',
          duration: 90,
          cost: budget * 0.3,
          order_index: 4,
        },
        {
          type: 'cafe',
          name: 'カフェで休憩',
          description: '素敵なカフェでゆったりとお茶を楽しみます',
          location: `${location.city}のおしゃれカフェ`,
          start_time: '16:30',
          duration: 60,
          cost: 1500,
          order_index: 5,
        },
      ],
    },
    {
      title: `${location.city}アクティブデート`,
      description: `体を動かして楽しむ、予算${budget.toLocaleString()}円のアクティブなデートプランです。`,
      budget: budget * 0.9,
      duration: duration * 60,
      score: 0.88,
      reason: 'アクティブな活動を好む傾向から、体験型のプランを提案しました。',
      items: [
        {
          type: 'activity',
          name: preferences[0] || 'スポーツ体験',
          description: `${preferences[0] || 'スポーツ'}を一緒に体験します`,
          location: `${location.city}の体験施設`,
          start_time: '10:00',
          duration: 120,
          cost: budget * 0.3,
          order_index: 1,
        },
        {
          type: 'restaurant',
          name: 'ヘルシーランチ',
          description: '体を動かした後の美味しいランチ',
          location: `${location.city}のヘルシーレストラン`,
          start_time: '12:30',
          duration: 60,
          cost: budget * 0.35,
          order_index: 2,
        },
        {
          type: 'sightseeing',
          name: `${location.city}観光`,
          description: '地元の魅力的なスポットを巡ります',
          location: `${location.city}の観光スポット`,
          start_time: '14:00',
          duration: 120,
          cost: 0,
          order_index: 3,
        },
        {
          type: 'cafe',
          name: 'カフェでクールダウン',
          description: '一日の思い出を振り返りながらゆっくり',
          location: `${location.city}の落ち着いたカフェ`,
          start_time: '16:00',
          duration: 60,
          cost: 1500,
          order_index: 4,
        },
      ],
    },
    {
      title: `${location.city}リラックスデート`,
      description: `ゆったりとした時間を過ごす、予算${budget.toLocaleString()}円のリラックスプランです。`,
      budget: budget * 0.85,
      duration: duration * 60,
      score: 0.85,
      reason: 'のんびりとした時間を大切にする傾向から、リラックスできるプランを提案しました。',
      items: [
        {
          type: 'cafe',
          name: '朝のカフェタイム',
          description: 'ゆったりとした朝食で一日をスタート',
          location: `${location.city}の静かなカフェ`,
          start_time: '10:30',
          duration: 90,
          cost: 2500,
          order_index: 1,
        },
        {
          type: 'sightseeing',
          name: preferences[1] || '散策',
          description: `${preferences[1] || '公園や庭園'}を散策します`,
          location: `${location.city}の癒しスポット`,
          start_time: '12:00',
          duration: 90,
          cost: 0,
          order_index: 2,
        },
        {
          type: 'restaurant',
          name: '落ち着いたレストランでランチ',
          description: '静かな雰囲気の中でゆっくり食事を楽しみます',
          location: `${location.city}の隠れ家レストラン`,
          start_time: '13:30',
          duration: 90,
          cost: budget * 0.5,
          order_index: 3,
        },
        {
          type: 'entertainment',
          name: preferences[2] || '美術館・博物館',
          description: `${preferences[2] || '美術館'}で芸術を鑑賞します`,
          location: `${location.city}の文化施設`,
          start_time: '15:00',
          duration: 90,
          cost: 2000,
          order_index: 4,
        },
        {
          type: 'cafe',
          name: 'ディナー前のカフェ',
          description: '一日を振り返りながらゆっくりお茶を',
          location: `${location.city}の景色の良いカフェ`,
          start_time: '16:30',
          duration: 60,
          cost: 1500,
          order_index: 5,
        },
      ],
    },
  ];

  return plans;
}

/**
 * プロンプトを構築
 */
function buildPrompt(request: AIGenerationRequest): string {
  const { budget, duration, location, preferences, special_requests, user_profile, date_history } =
    request;

  let prompt = `以下の条件でデートプランを3つ提案してください。\n\n`;
  prompt += `【基本情報】\n`;
  prompt += `- 予算: ${budget.toLocaleString()}円\n`;
  prompt += `- 所要時間: ${duration}時間\n`;
  prompt += `- 場所: ${location.prefecture}${location.city}`;
  if (location.station) {
    prompt += `（最寄り駅: ${location.station}）`;
  }
  prompt += `\n`;

  if (preferences.length > 0) {
    prompt += `- 好み: ${preferences.join('、')}\n`;
  }

  if (special_requests) {
    prompt += `- 特別な要望: ${special_requests}\n`;
  }

  if (user_profile) {
    prompt += `\n【ユーザー情報】\n`;
    prompt += `- 名前: ${user_profile.name}\n`;
    if (user_profile.age) {
      prompt += `- 年齢: ${user_profile.age}歳\n`;
    }
    if (user_profile.interests && user_profile.interests.length > 0) {
      prompt += `- 興味: ${user_profile.interests.join('、')}\n`;
    }
  }

  if (date_history && date_history.length > 0) {
    prompt += `\n【過去のデート履歴】\n`;
    date_history.slice(0, 3).forEach((history, index) => {
      prompt += `${index + 1}. ${history.date} - ${history.location}（${history.activities.join('、')}）`;
      if (history.rating) {
        prompt += ` - 評価: ${history.rating}/5`;
      }
      prompt += `\n`;
    });
  }

  prompt += `\n各プランは以下のJSON形式で出力してください：\n`;
  prompt += `{
  "plans": [
    {
      "title": "プラン名",
      "description": "プランの説明",
      "budget": 実際の予算,
      "duration": 所要時間（分）,
      "score": 推薦スコア（0-1）,
      "reason": "このプランを推薦する理由",
      "items": [
        {
          "type": "activity|restaurant|cafe|transportation|shopping|sightseeing|entertainment|other",
          "name": "アイテム名",
          "description": "詳細説明",
          "location": "場所",
          "start_time": "HH:MM形式",
          "duration": 所要時間（分）,
          "cost": 費用,
          "order_index": 順番
        }
      ]
    }
  ]
}`;

  return prompt;
}

/**
 * AI応答をパース
 */
function parseAIResponse(content: string): GeneratedPlan[] {
  try {
    // JSONブロックを抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON形式の応答が見つかりません');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.plans || [];
  } catch (error) {
    console.error('AI応答のパースエラー:', error);
    throw new AIGenerationError('AI応答の解析に失敗しました', 'PARSE_ERROR', error);
  }
}
