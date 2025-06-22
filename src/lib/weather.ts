export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  icon: string;
}

export interface OutfitSuggestion {
  title: string;
  description: string;
  items: string[];
  icon: string;
}

const WEATHER_CONDITIONS = {
  CLEAR: [800],
  PARTLY_CLOUDY: [801, 802],
  CLOUDY: [803, 804],
  RAIN: [500, 501, 502, 503, 504, 511, 520, 521, 522, 531],
  THUNDERSTORM: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
  SNOW: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
  MIST: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
};

interface WeatherAPIResponse {
  name: string;
  weather: Array<{
    id: number;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind?: {
    speed: number;
  };
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error('OpenWeatherMap API key is not configured');
    throw new Error(
      '🔑 OpenWeatherMap API keyが設定されていません。\n\n' +
        '解決方法:\n' +
        '1. https://openweathermap.org/api でアカウントを作成\n' +
        '2. 無料のAPIキーを取得\n' +
        '3. プロジェクトルートに .env.local ファイルを作成\n' +
        '4. NEXT_PUBLIC_OPENWEATHER_API_KEY=あなたのAPIキー を追加\n' +
        '5. 開発サーバーを再起動 (npm run dev)'
    );
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
  console.log('Fetching weather data from:', url.replace(apiKey, 'HIDDEN_API_KEY'));

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Weather API response error:', {
        status: response.status,
        statusText: response.statusText,
        url: url.replace(apiKey, 'HIDDEN_API_KEY'),
      });

      if (response.status === 401) {
        throw new Error('APIキーが無効です。OpenWeatherMapのAPIキーを確認してください。');
      } else if (response.status === 404) {
        throw new Error('指定された場所の天気情報が見つかりません。');
      } else {
        throw new Error(`天気API エラー: ${response.status} ${response.statusText}`);
      }
    }

    const data = (await response.json()) as WeatherAPIResponse;
    console.log('Weather data received:', data);

    if (!data.weather || !data.weather[0] || !data.main) {
      throw new Error('天気データの形式が正しくありません');
    }

    return {
      location: data.name || '不明な場所',
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      conditionCode: data.weather[0].id,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      feelsLike: Math.round(data.main.feels_like),
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);

    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('天気情報の取得に失敗しました。ネットワーク接続を確認してください。');
    }
  }
}

export function getOutfitSuggestions(weather: WeatherData): OutfitSuggestion[] {
  const suggestions: OutfitSuggestion[] = [];
  const temp = weather.temperature;
  const condition = weather.conditionCode;

  // 基本的な服装提案（気温ベース）
  if (temp >= 25) {
    suggestions.push({
      title: '暑い日の軽やかスタイル',
      description: '涼しく快適に過ごせる服装です',
      items: [
        '薄手のTシャツ・タンクトップ',
        'ショートパンツ・軽いスカート',
        'サンダル・スニーカー',
        '帽子・サングラス',
        '日焼け止め',
      ],
      icon: '☀️',
    });
  } else if (temp >= 20) {
    suggestions.push({
      title: '過ごしやすい日のカジュアルスタイル',
      description: '快適な気温を活かした軽やかな服装',
      items: [
        '半袖シャツ・軽いニット',
        'ロングパンツ・膝丈スカート',
        'スニーカー・フラットシューズ',
        '薄手のカーディガン（備え）',
      ],
      icon: '🌤️',
    });
  } else if (temp >= 15) {
    suggestions.push({
      title: '春秋の重ね着スタイル',
      description: '寒暖差に対応できる重ね着コーデ',
      items: [
        '長袖シャツ・薄手のセーター',
        'ロングパンツ・タイツ+スカート',
        '軽いジャケット・カーディガン',
        'スニーカー・ブーツ',
      ],
      icon: '🍂',
    });
  } else if (temp >= 10) {
    suggestions.push({
      title: '肌寒い日の防寒スタイル',
      description: 'しっかり防寒しつつおしゃれに',
      items: [
        '厚手のニット・セーター',
        '温かいパンツ・厚手のタイツ',
        'コート・ジャケット',
        'ブーツ・厚手の靴下',
        'マフラー・手袋',
      ],
      icon: '🧥',
    });
  } else {
    suggestions.push({
      title: '寒い日の完全防寒スタイル',
      description: '寒さをしっかりシャットアウト',
      items: [
        '厚手のセーター・インナー重ね着',
        '防寒パンツ・厚手のタイツ',
        'ダウンジャケット・厚手のコート',
        '防寒ブーツ・厚手の靴下',
        'マフラー・手袋・ニット帽',
      ],
      icon: '❄️',
    });
  }

  // 天気に応じた追加提案
  if (WEATHER_CONDITIONS.RAIN.includes(condition)) {
    suggestions.push({
      title: '雨の日対応スタイル',
      description: '雨に濡れずにおしゃれを楽しむ',
      items: [
        'レインコート・撥水ジャケット',
        '速乾性のある素材の服',
        '防水ブーツ・レインシューズ',
        '傘・レインハット',
        '防水バッグ・カバー',
      ],
      icon: '🌧️',
    });
  }

  if (WEATHER_CONDITIONS.SNOW.includes(condition)) {
    suggestions.push({
      title: '雪の日の防寒スタイル',
      description: '雪道も安全におしゃれに歩ける',
      items: [
        '防水・防寒アウター',
        '重ね着できる温かいインナー',
        '滑りにくいブーツ',
        '防寒小物（手袋・帽子・マフラー）',
        '防水バッグ',
      ],
      icon: '⛄',
    });
  }

  if (weather.windSpeed > 5) {
    suggestions.push({
      title: '風の強い日のスタイル',
      description: '風に負けないしっかりコーデ',
      items: [
        '風を通しにくい素材のアウター',
        'スカートよりもパンツスタイル',
        '髪が乱れにくいヘアスタイル',
        '帽子の紐・クリップ',
        '軽すぎないバッグ',
      ],
      icon: '💨',
    });
  }

  if (weather.humidity > 70) {
    suggestions.push({
      title: '湿度の高い日のスタイル',
      description: '蒸し暑さに対応する快適コーデ',
      items: [
        '通気性の良い素材（リネン・コットン）',
        '吸汗速乾性のインナー',
        'ゆったりとしたシルエット',
        'サンダル・通気性の良い靴',
        '汗拭きタオル・制汗剤',
      ],
      icon: '💧',
    });
  }

  return suggestions;
}
