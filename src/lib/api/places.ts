// お手洗い検索のためのAPI関数（無料版）

export interface Toilet {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance?: number;
  fee?: boolean;
  wheelchair?: boolean;
  opening_hours?: string;
  description?: string;
}

// ユーザーの現在位置を取得
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      () => {
        throw new Error('Unable to retrieve your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

// 距離計算（ハーバーサイン公式）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// OpenStreetMap Overpass APIからお手洗い情報を取得
export const searchToilets = async (
  latitude: number,
  longitude: number,
  radiusKm = 1
): Promise<Toilet[]> => {
  try {
    const radiusMeters = radiusKm * 1000;

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="toilets"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="toilets"](around:${radiusMeters},${latitude},${longitude});
        relation["amenity"="toilets"](around:${radiusMeters},${latitude},${longitude});
      );
      out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    interface OverpassElement {
      type: string;
      id: number;
      lat?: number;
      lon?: number;
      center?: {
        lat: number;
        lon: number;
      };
      tags: Record<string, string>;
    }

    interface OverpassResponse {
      elements: OverpassElement[];
    }

    const data = (await response.json()) as OverpassResponse;

    if (!data.elements) {
      return [];
    }

    const toilets: Toilet[] = data.elements
      .map((element) => {
        const lat = element.lat ?? element.center?.lat ?? 0;
        const lon = element.lon ?? element.center?.lon ?? 0;
        const distance = calculateDistance(latitude, longitude, lat, lon);

        const id = element.id.toString();
        const tags = element.tags || {};
        const name = tags.name || 'お手洗い';
        const description = tags.description || '';

        const fee = tags.fee === 'yes';
        const wheelchairAccessible = tags.wheelchair === 'yes';
        const opening_hours = tags.opening_hours || tags['opening hours'] || '';

        return {
          id,
          name,
          description,
          lat,
          lon,
          distance,
          fee,
          wheelchair: wheelchairAccessible,
          opening_hours,
        };
      })
      .filter((toilet) => toilet.lat !== 0 && toilet.lon !== 0);

    return toilets.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  } catch (error) {
    console.error('Error fetching toilets:', error);
    return getFallbackToilets(latitude, longitude);
  }
};

// フォールバック用の静的データ（大幅に拡張）
export function getFallbackToilets(userLat: number, userLon: number): Toilet[] {
  const staticToilets = [
    // 東京主要駅
    {
      id: 'static-tokyo-1',
      name: 'JR東京駅 八重洲口',
      lat: 35.6812,
      lon: 139.7671,
      fee: false,
      wheelchair: true,
      opening_hours: '24h',
      description: '24時間利用可能',
    },
    {
      id: 'static-tokyo-2',
      name: 'JR東京駅 丸の内口',
      lat: 35.6812,
      lon: 139.7669,
      fee: false,
      wheelchair: true,
      opening_hours: '24h',
    },
    {
      id: 'static-shinjuku-1',
      name: 'JR新宿駅 南口',
      lat: 35.6896,
      lon: 139.7006,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    {
      id: 'static-shinjuku-2',
      name: 'JR新宿駅 東口',
      lat: 35.6906,
      lon: 139.7022,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    {
      id: 'static-shibuya-1',
      name: 'JR渋谷駅 ハチ公口',
      lat: 35.6598,
      lon: 139.7006,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    {
      id: 'static-ikebukuro-1',
      name: 'JR池袋駅 東口',
      lat: 35.7298,
      lon: 139.7147,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    {
      id: 'static-ueno-1',
      name: 'JR上野駅 公園口',
      lat: 35.7137,
      lon: 139.7773,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    {
      id: 'static-shinagawa-1',
      name: 'JR品川駅 港南口',
      lat: 35.6285,
      lon: 139.7387,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    // 大阪主要駅
    {
      id: 'static-osaka-1',
      name: 'JR大阪駅 中央改札口',
      lat: 34.7024,
      lon: 135.4959,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    {
      id: 'static-namba-1',
      name: '南海なんば駅',
      lat: 34.6651,
      lon: 135.5018,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    // 名古屋
    {
      id: 'static-nagoya-1',
      name: 'JR名古屋駅 中央改札口',
      lat: 35.1706,
      lon: 136.8816,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    // 福岡
    {
      id: 'static-hakata-1',
      name: 'JR博多駅 博多口',
      lat: 33.5904,
      lon: 130.4208,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
    // 仙台
    {
      id: 'static-sendai-1',
      name: 'JR仙台駅 西口',
      lat: 38.2606,
      lon: 140.8819,
      fee: false,
      wheelchair: true,
      opening_hours: '5:00-24:00',
    },
  ];

  return staticToilets
    .map((toilet) => ({
      ...toilet,
      distance: Math.round(calculateDistance(userLat, userLon, toilet.lat, toilet.lon) * 1000),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10); // 最大10件に制限
}

// Google Mapsで開く URL を生成
export function getGoogleMapsUrl(lat: number, lon: number, name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(name)}`;
}
