// AI Service
// AIを活用したデートプラン生成サービス

import {
  AIGenerationRequest,
  AIGenerationResponse,
  GeneratedPlan,
  GeneratedPlanItem,
  PlanItemType,
} from '@/types/date-plan';
import { getRateLimiter } from './rate-limiter';

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
type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'mock';

/**
 * AI設定
 */
interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  geminiApiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * AI設定の取得
 *
 * 環境変数のバリデーション付き
 */
function getAIConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER || 'mock') as AIProvider;

  // プロバイダーのバリデーション
  const validProviders: AIProvider[] = ['gemini', 'openai', 'anthropic', 'mock'];
  if (!validProviders.includes(provider)) {
    console.warn(`無効なAIプロバイダー: ${provider}. mockにフォールバックします。`);
    return {
      provider: 'mock',
      maxTokens: 2000,
      temperature: 0.7,
    };
  }

  // モデル名のデフォルト設定
  let defaultModel = 'mock';
  let defaultMaxTokens = 2000;

  if (provider === 'gemini') {
    // Gemini 2.0 Flash 推奨（思考トークンなし、高速、トークン効率良好）
    // 2.0 Flash系: 思考トークン0 + 出力1000-1500 = 計1000-1500トークン
    // 2.5 Pro: 思考トークン2000 + 出力1000 = 計3000トークン（非効率）
    defaultModel = 'gemini-2.0-flash-exp';
    defaultMaxTokens = 2000;
  } else if (provider === 'openai') {
    defaultModel = 'gpt-4';
    defaultMaxTokens = 2000;
  } else if (provider === 'anthropic') {
    defaultModel = 'claude-3-sonnet-20240229';
    defaultMaxTokens = 2000;
  }

  return {
    provider,
    apiKey: process.env.AI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    model: process.env.AI_MODEL || defaultModel,
    // Gemini 2.0系: 2000トークンで十分（思考トークンなし）
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || defaultMaxTokens.toString()),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  };
}

/**
 * デートプランを生成
 *
 * 多重リクエスト防止機能:
 * - リクエストごとに一意のIDを生成
 * - レート制限マネージャーで重複実行を防止
 */
export async function generateDatePlan(
  request: AIGenerationRequest
): Promise<AIGenerationResponse> {
  const config = getAIConfig();
  const startTime = Date.now();

  try {
    let plans: GeneratedPlan[];

    // レート制限マネージャーを取得（シングルトン）
    const rateLimiter = getRateLimiter({
      maxRequestsPerMinute: 15, // Gemini 2.0無料枠（公式ドキュメント準拠）
      maxRequestsPerDay: 1500, // Gemini無料枠
      requestTimeout: getTimeoutForTokens(config.maxTokens || 2000) + 30000, // API + 30秒バッファ
      maxRetries: 2, // 最大2回リトライ
    });

    // 一意のリクエストIDを生成（重複防止）
    const requestId = `plan_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // レート制限付きで実行（キューイング、リトライ、重複防止すべて含む）
    plans = await rateLimiter.execute(async () => {
      switch (config.provider) {
        case 'gemini':
          return await generateWithGemini(request, config);
        case 'openai':
          return await generateWithOpenAI(request, config);
        case 'anthropic':
          return await generateWithAnthropic(request, config);
        case 'mock':
        default:
          return await generateWithMock(request);
      }
    }, requestId);

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

    // エラーの種類に応じた適切なメッセージ
    if (error instanceof AIGenerationError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'デートプランの生成に失敗しました';
    throw new AIGenerationError(message, 'GENERATION_FAILED', error);
  }
}

/**
 * トークン数に応じた適切なタイムアウトを取得
 */
function getTimeoutForTokens(maxTokens: number): number {
  // トークン数に応じてタイムアウトを動的に設定
  if (maxTokens <= 2000) {
    return 30000; // 30秒
  } else if (maxTokens <= 4000) {
    return 45000; // 45秒
  } else if (maxTokens <= 6000) {
    return 60000; // 60秒
  } else {
    return 90000; // 90秒
  }
}

/**
 * Google Gemini APIを使用してプランを生成
 *
 * 安全機能:
 * - APIキーのバリデーション
 * - タイムアウト設定
 * - エラーハンドリング
 * - レスポンスのバリデーション
 */
async function generateWithGemini(
  request: AIGenerationRequest,
  config: AIConfig
): Promise<GeneratedPlan[]> {
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    throw new AIGenerationError('Gemini APIキーが設定されていません', 'MISSING_API_KEY');
  }

  const prompt = buildPrompt(request);

  try {
    // Gemini API v1エンドポイント（最新版）
    // モデル名からバージョンプレフィックスを削除（例: gemini-1.5-pro → gemini-1.5-pro）
    const modelName = config.model || 'gemini-pro';
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

    console.log(`[Gemini API] リクエスト送信: ${modelName}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens || 2000, // ユーザー設定を尊重
          topP: 0.8,
          topK: 40,
        },
      }),
      // タイムアウト設定（トークン数に応じて動的に調整）
      signal: AbortSignal.timeout(getTimeoutForTokens(config.maxTokens || 2000)),
    });

    console.log(`[Gemini API] レスポンス受信: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.error('[Gemini API] エラー詳細:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl.replace(apiKey, 'API_KEY_HIDDEN'),
        error: errorData,
      });

      // レート制限エラーの特別処理
      if (response.status === 429) {
        throw new AIGenerationError(
          'レート制限に達しました。しばらく待ってから再試行してください。',
          'RATE_LIMIT_ERROR',
          { status: 429, details: errorData }
        );
      }

      // 404エラーの詳細情報
      if (response.status === 404) {
        throw new AIGenerationError(
          `Gemini APIエンドポイントが見つかりません。モデル名 "${modelName}" が正しいか確認してください。`,
          'GEMINI_API_ERROR',
          { status: 404, model: modelName, details: errorData }
        );
      }

      throw new AIGenerationError(
        `Gemini APIエラー: ${response.status} ${response.statusText}`,
        'GEMINI_API_ERROR',
        { status: response.status, details: errorData }
      );
    }

    const data = await response.json();

    // デバッグ: レスポンス構造を確認
    console.log('[Gemini API] レスポンス全体:', JSON.stringify(data, null, 2));

    // レスポンスのバリデーション
    if (!data.candidates || data.candidates.length === 0) {
      console.error('[Gemini API] 候補が空です:', data);
      throw new AIGenerationError('Gemini APIの応答が空です', 'EMPTY_RESPONSE', data);
    }

    const candidate = data.candidates[0];
    console.log('[Gemini API] 候補[0]:', JSON.stringify(candidate, null, 2));

    // finishReasonをチェック
    const finishReason = candidate.finishReason;
    console.log('[Gemini API] 終了理由:', finishReason);

    // MAX_TOKENSエラーのチェック
    if (finishReason === 'MAX_TOKENS') {
      const usage = data.usageMetadata;

      // Gemini 2.5系の思考トークン問題をチェック
      const thoughtsTokens = usage?.thoughtsTokenCount || 0;
      const currentModel = config.model || 'unknown';

      let errorMessage = `レスポンスがトークン制限に達しました。使用トークン: ${usage?.totalTokenCount || '不明'}`;

      if (thoughtsTokens > 1500) {
        errorMessage +=
          `\n\n⚠️ 思考トークン（${thoughtsTokens}）が使用されています。\n` +
          `現在のモデル: ${currentModel}\n\n` +
          `Gemini 2.5 Proは思考モード（約2000トークン）を使用するため非効率です。\n\n` +
          `推奨: Gemini 2.0 Flashに変更してください（思考トークン0、60-75%削減）：\n` +
          `AI_MODEL=gemini-2.0-flash-exp\n` +
          `AI_MAX_TOKENS=2000\n\n` +
          `または、2.5 Proを使い続ける場合: AI_MAX_TOKENS=4000`;
      } else {
        errorMessage += `\n\nAI_MAX_TOKENSを増やすか、プロンプトを短くしてください。`;
      }

      throw new AIGenerationError(errorMessage, 'MAX_TOKENS_ERROR', {
        finishReason,
        usageMetadata: usage,
        currentMaxTokens: config.maxTokens,
        currentModel,
        thoughtsTokenCount: thoughtsTokens,
      });
    }

    // 安全性フィルターエラーのチェック
    if (finishReason === 'SAFETY') {
      throw new AIGenerationError(
        'Geminiの安全性フィルターにより、コンテンツ生成がブロックされました。プロンプトを変更してください。',
        'SAFETY_FILTER_ERROR',
        { finishReason, safetyRatings: candidate.safetyRatings }
      );
    }

    // Gemini APIのレスポンス構造に対応（複数パターン対応）
    let content: string | undefined;

    // パターン1: candidate.content.parts[0].text
    if (
      candidate?.content?.parts &&
      Array.isArray(candidate.content.parts) &&
      candidate.content.parts.length > 0
    ) {
      content = candidate.content.parts[0].text;
    }
    // パターン2: candidate.text
    else if (candidate?.text) {
      content = candidate.text;
    }
    // パターン3: candidateが直接文字列
    else if (typeof candidate === 'string') {
      content = candidate;
    }

    if (!content) {
      console.error('[Gemini API] テキスト抽出失敗。候補データ:', candidate);
      throw new AIGenerationError(
        `Gemini APIの応答にテキストが含まれていません（終了理由: ${finishReason || '不明'}）`,
        'INVALID_RESPONSE',
        { candidate, fullResponse: data, finishReason }
      );
    }

    console.log('[Gemini API] 抽出成功。テキスト長:', content.length);

    // 安全性チェック（有害コンテンツフィルター）
    const safetyRatings = data.candidates[0]?.safetyRatings;
    if (safetyRatings) {
      const blockedRating = safetyRatings.find(
        (rating: any) => rating.probability === 'HIGH' || rating.probability === 'MEDIUM'
      );
      if (blockedRating) {
        console.warn('Gemini安全性フィルターが反応しました:', blockedRating);
      }
    }

    return parseAIResponse(content);
  } catch (error) {
    // タイムアウトエラー
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new AIGenerationError(
        'Gemini APIリクエストがタイムアウトしました',
        'TIMEOUT_ERROR',
        error
      );
    }

    // ネットワークエラー
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AIGenerationError('ネットワークエラーが発生しました', 'NETWORK_ERROR', error);
    }

    // 既知のエラーはそのまま再スロー
    if (error instanceof AIGenerationError) {
      throw error;
    }

    // その他のエラー
    throw new AIGenerationError('Gemini APIの呼び出しに失敗しました', 'GEMINI_API_ERROR', error);
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

  // サンプルプランを生成（1つのみ）
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
  ];

  return plans;
}

/**
 * プロンプトを構築
 */
function buildPrompt(request: AIGenerationRequest): string {
  const { budget, duration, location, preferences, special_requests } = request;

  // 簡潔なプロンプト（トークン数削減）
  let prompt = `予算${budget.toLocaleString()}円、${duration}時間、${location.prefecture}${location.city}`;
  if (location.station) {
    prompt += `（${location.station}駅）`;
  }
  prompt += `のデートプラン1つ提案。`;

  if (preferences.length > 0) {
    prompt += `好み: ${preferences.slice(0, 3).join('、')}。`;
  }

  if (special_requests) {
    prompt += `要望: ${special_requests.substring(0, 100)}。`;
  }

  prompt += `\n\n実際の店舗名または場所名、住所、緯度経度を含むJSON形式で出力。店舗名は実在するか、それらしい具体的な名前を使用:\n`;
  prompt += `{"plans":[{"title":"","description":"","budget":0,"duration":0,"score":0.9,"reason":"","items":[{"type":"restaurant","name":"炭火焼鳥 とりや（横浜駅西口店）","description":"","location":"〒220-0005 神奈川県横浜市西区南幸1-1-1 横浜駅西口ビル2階","latitude":35.6812,"longitude":139.7671,"start_time":"14:00","duration":1.5,"cost":0,"order_index":1}]}]}`;

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
    const plans = parsed.plans || [];

    // order_indexが不足している場合は自動生成
    plans.forEach((plan: any) => {
      if (plan.items && Array.isArray(plan.items)) {
        plan.items.forEach((item: any, index: number) => {
          if (item.order_index === undefined || item.order_index === null) {
            item.order_index = index + 1;
          }
        });
      }
    });

    return plans;
  } catch (error) {
    console.error('AI応答のパースエラー:', error);
    throw new AIGenerationError('AI応答の解析に失敗しました', 'PARSE_ERROR', error);
  }
}
