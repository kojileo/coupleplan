'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import type { Toilet } from '@/lib/api/places';
import { searchToilets, getGoogleMapsUrl, getFallbackToilets } from '@/lib/api/places';

interface ToiletFinderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToiletFinder({ isOpen, onClose }: ToiletFinderProps): ReactElement | null {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    'checking' | 'allowed' | 'denied' | 'unavailable'
  >('checking');

  const getCurrentLocationAndSearch = async (): Promise<void> => {
    setLoading(true);
    setLocationStatus('checking');

    try {
      if (!navigator.geolocation) {
        setLocationStatus('unavailable');
        const fallbackToilets = getFallbackToilets(35.6812, 139.7671); // 東京駅
        setToilets(fallbackToilets);
        return;
      }

      // 位置情報の取得を試行
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationStatus('allowed');
            const { latitude, longitude } = position.coords;

            searchToilets(latitude, longitude)
              .then((results) => {
                setToilets(results);
                resolve();
              })
              .catch((error) => {
                console.error('Error searching toilets:', error);
                const fallbackToilets = getFallbackToilets(latitude, longitude);
                setToilets(fallbackToilets);
                resolve();
              });
          },
          () => {
            setLocationStatus('denied');
            // 位置情報が拒否された場合、東京駅周辺のフォールバック
            const fallbackToilets = getFallbackToilets(35.6812, 139.7671);
            setToilets(fallbackToilets);
            resolve();
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          }
        );
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationStatus('unavailable');
      const fallbackToilets = getFallbackToilets(35.6812, 139.7671);
      setToilets(fallbackToilets);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNearby = (): void => {
    void getCurrentLocationAndSearch();
  };

  const openInGoogleMaps = (toilet: Toilet): void => {
    const url = getGoogleMapsUrl(toilet.lat, toilet.lon, toilet.name);
    window.open(url, '_blank');
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getLocationStatusMessage = (): string => {
    switch (locationStatus) {
      case 'checking':
        return '位置情報を確認中...';
      case 'allowed':
        return '現在地周辺のお手洗い情報';
      case 'denied':
      case 'unavailable':
        return '位置情報が利用できないため、主要駅のお手洗い情報を表示しています';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      void getCurrentLocationAndSearch();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <span className="mr-2">🚻</span>
              お手洗い検索
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">{getLocationStatusMessage()}</p>
        </div>

        <div className="p-4">
          <button
            onClick={handleSearchNearby}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                検索中...
              </>
            ) : (
              <>
                <span className="mr-2">🔍</span>
                お手洗いを検索
              </>
            )}
          </button>

          <div className="max-h-96 overflow-y-auto">
            {toilets.length === 0 && !loading ? (
              <p className="text-gray-500 text-center py-8">
                検索ボタンを押してお手洗いを探してください
              </p>
            ) : (
              <div className="space-y-3">
                {toilets.map((toilet) => (
                  <div
                    key={toilet.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{toilet.name}</h3>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {toilet.distance && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          📍 {formatDistance(toilet.distance)}
                        </span>
                      )}
                      {toilet.fee === false && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          無料
                        </span>
                      )}
                      {toilet.fee === true && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          有料
                        </span>
                      )}
                      {toilet.wheelchair && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          ♿ 車椅子対応
                        </span>
                      )}
                    </div>

                    {toilet.opening_hours && (
                      <p className="text-xs text-gray-600 mb-2">🕒 {toilet.opening_hours}</p>
                    )}

                    {toilet.description && (
                      <p className="text-xs text-gray-600 mb-2">{toilet.description}</p>
                    )}

                    <button
                      onClick={() => openInGoogleMaps(toilet)}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      🗺️ Google マップで開く
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
