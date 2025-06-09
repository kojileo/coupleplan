'use client';

import { MapPin, RefreshCw, Cloud, Sun, CloudRain, Wind, Droplets, Shirt } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import {
  type WeatherData,
  type OutfitSuggestion,
  getWeatherData,
  getOutfitSuggestions,
} from '@/lib/weather';

import { Badge } from './ui/badge';
import Button from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface WeatherOutfitCardProps {
  className?: string;
}

export function WeatherOutfitCard({ className = '' }: WeatherOutfitCardProps): React.ReactElement {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  const getWeatherIcon = (conditionCode: number): React.ReactElement => {
    if (conditionCode >= 200 && conditionCode < 300) return <CloudRain className="w-6 h-6" />;
    if (conditionCode >= 300 && conditionCode < 600) return <CloudRain className="w-6 h-6" />;
    if (conditionCode >= 600 && conditionCode < 700) return <Cloud className="w-6 h-6" />;
    if (conditionCode >= 700 && conditionCode < 800) return <Cloud className="w-6 h-6" />;
    if (conditionCode === 800) return <Sun className="w-6 h-6" />;
    return <Cloud className="w-6 h-6" />;
  };

  const fetchWeatherAndOutfit = async (lat: number, lon: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const weatherData = await getWeatherData(lat, lon);
      const outfitSuggestions = getOutfitSuggestions(weatherData);

      setWeather(weatherData);
      setOutfits(outfitSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '天気情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = useCallback((): void => {
    if (!navigator.geolocation) {
      // 位置情報がサポートされていない場合は東京の天気を表示
      void fetchWeatherAndOutfit(35.6762, 139.6503); // 東京の座標
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationGranted(true);
        void fetchWeatherAndOutfit(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        // 位置情報取得に失敗した場合は東京の天気を表示
        console.log('位置情報取得失敗、東京の天気を表示します:', error);
        void fetchWeatherAndOutfit(35.6762, 139.6503); // 東京の座標
      }
    );
  }, []);

  const refreshWeather = (): void => {
    if (!navigator.geolocation) {
      // 位置情報がサポートされていない場合は東京の天気を表示
      void fetchWeatherAndOutfit(35.6762, 139.6503); // 東京の座標
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchWeatherAndOutfit(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        // 位置情報取得に失敗した場合は東京の天気を表示
        console.log('位置情報再取得失敗、東京の天気を表示します:', error);
        void fetchWeatherAndOutfit(35.6762, 139.6503); // 東京の座標
      }
    );
  };

  useEffect(() => {
    // ページロード時に自動で位置情報を取得
    requestLocation();
  }, [requestLocation]);

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-500 mb-4 whitespace-pre-line text-left bg-red-50 border border-red-200 rounded-lg p-4">
              {error}
            </div>
            <Button onClick={requestLocation} variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              再試行
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>天気情報を取得中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className={`${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button onClick={requestLocation}>
              <MapPin className="w-4 h-4 mr-2" />
              位置情報を取得して天気を確認
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 天気情報カード */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getWeatherIcon(weather.conditionCode)}
              今日の天気
            </CardTitle>
            <Button variant="outline" size="sm" onClick={refreshWeather} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {weather.location}
              {!locationGranted && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                  位置情報未取得のため東京の天気を表示
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{weather.temperature}°C</div>
                <div className="text-sm text-gray-500">気温</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">{weather.feelsLike}°C</div>
                <div className="text-sm text-gray-500">体感温度</div>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4" />
                  <span className="font-semibold">{weather.windSpeed}m/s</span>
                </div>
                <div className="text-sm text-gray-500">風速</div>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  <span className="font-semibold">{weather.humidity}%</span>
                </div>
                <div className="text-sm text-gray-500">湿度</div>
              </div>
            </div>

            <div className="text-center">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {weather.condition}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 服装提案カード */}
      {outfits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shirt className="w-5 h-5" />
              おすすめの服装
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outfits.map((outfit, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">{outfit.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{outfit.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {outfit.items.map((item, itemIndex) => (
                      <Badge key={itemIndex} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
