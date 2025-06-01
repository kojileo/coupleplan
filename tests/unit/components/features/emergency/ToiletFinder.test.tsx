import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ToiletFinder } from '@/components/features/emergency/ToiletFinder';

// Mock API functions
jest.mock('@/lib/api/places', () => ({
  searchToilets: jest.fn(),
  getGoogleMapsUrl: jest.fn(),
  getFallbackToilets: jest.fn(),
}));

const mockSearchToilets = require('@/lib/api/places').searchToilets;
const mockGetGoogleMapsUrl = require('@/lib/api/places').getGoogleMapsUrl;
const mockGetFallbackToilets = require('@/lib/api/places').getFallbackToilets;

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

const mockToiletData = [
  {
    id: '1',
    name: 'テスト公衆トイレ1',
    lat: 35.6812,
    lon: 139.7671,
    distance: 0.1,
    fee: false,
    wheelchair: true,
    opening_hours: '24h',
    description: 'テスト用のお手洗い',
  },
  {
    id: '2',
    name: 'テスト公衆トイレ2',
    lat: 35.6815,
    lon: 139.7675,
    distance: 0.2,
    fee: true,
    wheelchair: false,
    opening_hours: '6:00-23:00',
  },
];

describe('ToiletFinder', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchToilets.mockResolvedValue(mockToiletData);
    mockGetFallbackToilets.mockReturnValue(mockToiletData);
    mockGetGoogleMapsUrl.mockReturnValue('https://maps.google.com/test');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('isOpen=falseの時は何も表示しない', () => {
    render(<ToiletFinder isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('お手洗い検索')).not.toBeInTheDocument();
  });

  it('isOpen=trueの時にモーダルが表示される', async () => {
    // geolocationのモックを設定して初期ローディングを回避
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error(new Error('位置情報が拒否されました'));
    });

    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('お手洗い検索')).toBeInTheDocument();

    // ローディングが終了して検索ボタンが表示されるまで待機
    await waitFor(
      () => {
        expect(screen.getByText('お手洗いを検索')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('×ボタンをクリックするとonCloseが呼ばれる', () => {
    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('位置情報が利用可能な場合の検索テスト', async () => {
    const mockPosition = {
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success(mockPosition);
    });

    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('現在地周辺のお手洗い情報')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockSearchToilets).toHaveBeenCalledWith(35.6812, 139.7671);
    });
  });

  it('位置情報が拒否された場合のフォールバック処理', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error(new Error('位置情報が拒否されました'));
    });

    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(
        screen.getByText('位置情報が利用できないため、主要駅のお手洗い情報を表示しています')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockGetFallbackToilets).toHaveBeenCalledWith(35.6812, 139.7671);
    });
  });

  it('navigator.geolocationが利用できない場合', async () => {
    // navigator.geolocationを無効にする
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
    });

    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(
        screen.getByText('位置情報が利用できないため、主要駅のお手洗い情報を表示しています')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockGetFallbackToilets).toHaveBeenCalledWith(35.6812, 139.7671);
    });

    // 元に戻す
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  it('お手洗いリストが正しく表示される', async () => {
    const mockPosition = {
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success(mockPosition);
    });

    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('テスト公衆トイレ1')).toBeInTheDocument();
      expect(screen.getByText('テスト公衆トイレ2')).toBeInTheDocument();
    });

    // 距離表示のテスト
    expect(screen.getByText('📍 100m')).toBeInTheDocument();
    expect(screen.getByText('📍 200m')).toBeInTheDocument();

    // 無料/有料の表示
    expect(screen.getByText('無料')).toBeInTheDocument();
    expect(screen.getByText('有料')).toBeInTheDocument();

    // 車椅子対応の表示
    expect(screen.getByText('♿ 車椅子対応')).toBeInTheDocument();

    // 営業時間の表示
    expect(screen.getByText('🕒 24h')).toBeInTheDocument();
    expect(screen.getByText('🕒 6:00-23:00')).toBeInTheDocument();
  });

  it('Google マップリンクが正しく動作する', async () => {
    const mockPosition = {
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success(mockPosition);
    });

    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('テスト公衆トイレ1')).toBeInTheDocument();
    });

    const mapButtons = screen.getAllByText('🗺️ Google マップで開く');
    fireEvent.click(mapButtons[0]);

    expect(mockGetGoogleMapsUrl).toHaveBeenCalledWith(35.6812, 139.7671, 'テスト公衆トイレ1');
    expect(window.open).toHaveBeenCalledWith('https://maps.google.com/test', '_blank');
  });

  it('検索ボタンをクリックすると再検索される', async () => {
    const mockPosition = {
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    // 初回の自動検索が完了するまで待機
    await waitFor(() => {
      expect(mockSearchToilets).toHaveBeenCalledTimes(1);
    });

    // 検索ボタンをクリック
    const searchButton = screen.getByText('お手洗いを検索');
    fireEvent.click(searchButton);

    // 再検索が実行される
    await waitFor(() => {
      expect(mockSearchToilets).toHaveBeenCalledTimes(2);
    });
  });

  it('検索中はローディング状態が表示される', async () => {
    let resolveSearch: (value: any) => void;
    const searchPromise = new Promise((resolve) => {
      resolveSearch = resolve;
    });
    mockSearchToilets.mockReturnValue(searchPromise);

    const mockPosition = {
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success(mockPosition);
    });

    render(<ToiletFinder isOpen={true} onClose={mockOnClose} />);

    // ローディング状態が表示される
    await waitFor(() => {
      expect(screen.getByText('検索中...')).toBeInTheDocument();
    });

    // 検索を完了
    resolveSearch!(mockToiletData);

    // ローディングが終了
    await waitFor(() => {
      expect(screen.queryByText('検索中...')).not.toBeInTheDocument();
    });
  });
});
