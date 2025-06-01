import {
  searchToilets,
  getFallbackToilets,
  getGoogleMapsUrl,
  getCurrentPosition,
} from '@/lib/api/places';

// Fetch APIのモック
global.fetch = jest.fn();

// navigator.geolocationのモック
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('places API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentPosition', () => {
    it('正常に位置情報を取得できる', async () => {
      const mockPosition = {
        coords: {
          latitude: 35.6812,
          longitude: 139.7671,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      const position = await getCurrentPosition();
      expect(position).toEqual(mockPosition);
    });

    it('navigator.geolocationがサポートされていない場合エラーをスローする', async () => {
      // navigator.geolocationを無効にする
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
      });

      await expect(getCurrentPosition()).rejects.toThrow(
        'Geolocation is not supported by this browser.'
      );

      // 元に戻す
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
      });
    });

    it('位置情報の取得に失敗した場合エラーをスローする', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
        error(new Error('位置情報の取得に失敗しました'));
      });

      await expect(getCurrentPosition()).rejects.toThrow('Unable to retrieve your location');
    });
  });

  describe('searchToilets', () => {
    const mockOverpassResponse = {
      elements: [
        {
          type: 'node',
          id: 12345,
          lat: 35.6812,
          lon: 139.7671,
          tags: {
            name: 'テスト公衆トイレ1',
            amenity: 'toilets',
            fee: 'no',
            wheelchair: 'yes',
            opening_hours: '24/7',
            description: 'テスト用の説明',
          },
        },
        {
          type: 'way',
          id: 67890,
          center: {
            lat: 35.6815,
            lon: 139.7675,
          },
          tags: {
            name: 'テスト公衆トイレ2',
            amenity: 'toilets',
            fee: 'yes',
            wheelchair: 'no',
          },
        },
      ],
    };

    it('正常にお手洗いデータを取得できる', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOverpassResponse,
      });

      const result = await searchToilets(35.6812, 139.7671);

      expect(fetch).toHaveBeenCalledWith(
        'https://overpass-api.de/api/interpreter',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '12345',
        name: 'テスト公衆トイレ1',
        lat: 35.6812,
        lon: 139.7671,
        fee: false,
        wheelchair: true,
        opening_hours: '24/7',
        description: 'テスト用の説明',
      });

      expect(result[1]).toMatchObject({
        id: '67890',
        name: 'テスト公衆トイレ2',
        lat: 35.6815,
        lon: 139.7675,
        fee: true,
        wheelchair: false,
      });
    });

    it('APIレスポンスが失敗の場合フォールバックデータを返す', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await searchToilets(35.6812, 139.7671);

      // フォールバックデータが返される
      expect(result.length).toBeGreaterThan(0);
    });

    it('ネットワークエラーの場合フォールバックデータを返す', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await searchToilets(35.6812, 139.7671);

      // フォールバックデータが返される
      expect(result.length).toBeGreaterThan(0);
    });

    it('空のレスポンスの場合空配列を返す', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ elements: [] }),
      });

      const result = await searchToilets(35.6812, 139.7671);

      expect(result).toEqual([]);
    });

    it('無効な座標の要素を除外する', async () => {
      const invalidResponse = {
        elements: [
          {
            type: 'node',
            id: 1,
            lat: 35.6812,
            lon: 139.7671,
            tags: { name: '有効なトイレ' },
          },
          {
            type: 'node',
            id: 2,
            lat: 0,
            lon: 0,
            tags: { name: '無効なトイレ' },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse,
      });

      const result = await searchToilets(35.6812, 139.7671);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('有効なトイレ');
    });

    it('距離順にソートされる', async () => {
      const responseWithDistance = {
        elements: [
          {
            type: 'node',
            id: 1,
            lat: 35.6815, // より遠い
            lon: 139.7675,
            tags: { name: '遠いトイレ' },
          },
          {
            type: 'node',
            id: 2,
            lat: 35.6812, // より近い
            lon: 139.7671,
            tags: { name: '近いトイレ' },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithDistance,
      });

      const result = await searchToilets(35.6812, 139.7671);

      expect(result[0].name).toBe('近いトイレ');
      expect(result[1].name).toBe('遠いトイレ');
      expect(result[0].distance ?? 0).toBeLessThan(result[1].distance ?? 0);
    });
  });

  describe('getFallbackToilets', () => {
    it('フォールバックトイレデータを正しく返す', () => {
      const result = getFallbackToilets(35.6812, 139.7671);

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(10); // 最大10件

      // 各要素が必要なプロパティを持っているかチェック
      result.forEach((toilet) => {
        expect(toilet).toHaveProperty('id');
        expect(toilet).toHaveProperty('name');
        expect(toilet).toHaveProperty('lat');
        expect(toilet).toHaveProperty('lon');
        expect(toilet).toHaveProperty('distance');
        expect(toilet).toHaveProperty('fee');
        expect(toilet).toHaveProperty('wheelchair');
        expect(toilet).toHaveProperty('opening_hours');
        expect(typeof toilet.distance).toBe('number');
      });
    });

    it('距離順にソートされている', () => {
      const result = getFallbackToilets(35.6812, 139.7671); // 東京駅

      for (let i = 1; i < result.length; i++) {
        const prevDistance = result[i - 1].distance ?? 0;
        const currentDistance = result[i].distance ?? 0;
        expect(prevDistance).toBeLessThanOrEqual(currentDistance);
      }
    });

    it('異なる位置での距離計算が正しく動作する', () => {
      const tokyoResult = getFallbackToilets(35.6812, 139.7671); // 東京駅
      const osakaResult = getFallbackToilets(34.7024, 135.4959); // 大阪駅

      // 東京駅から最も近いトイレ（東京のトイレのはず）
      const tokyoClosest = tokyoResult[0];
      // 大阪駅から最も近いトイレ（大阪のトイレのはず）
      const osakaClosest = osakaResult[0];

      // 東京駅にいる場合、大阪駅にいる場合よりも東京のトイレが近いはず
      expect(tokyoClosest.name).toContain('東京');
      expect(osakaClosest.name).toContain('大阪');

      // 距離も適切に計算されているはず
      expect(tokyoClosest.distance).toBeLessThan(1000); // 1km未満
      expect(osakaClosest.distance).toBeLessThan(1000); // 1km未満
    });
  });

  describe('getGoogleMapsUrl', () => {
    it('正しいGoogle MapsのURLを生成する', () => {
      const url = getGoogleMapsUrl(35.6812, 139.7671, 'テストトイレ');

      expect(url).toBe(
        'https://www.google.com/maps/search/?api=1&query=35.6812,139.7671&query_place_id=%E3%83%86%E3%82%B9%E3%83%88%E3%83%88%E3%82%A4%E3%83%AC'
      );
    });

    it('特殊文字を含む名前を正しくエンコードする', () => {
      const url = getGoogleMapsUrl(35.6812, 139.7671, 'トイレ & バス');

      expect(url).toContain(encodeURIComponent('トイレ & バス'));
    });
  });
});
