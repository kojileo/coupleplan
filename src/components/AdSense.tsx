'use client';

import { useEffect } from 'react';
import type { ReactElement } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = '',
}: AdSenseProps): ReactElement {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}

// 異なるサイズ用の事前定義コンポーネント
export function BannerAd({
  adSlot,
  className,
}: {
  adSlot: string;
  className?: string;
}): ReactElement {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="auto"
      style={{ display: 'block', width: '100%', height: '90px' }}
      className={className}
    />
  );
}

export function SquareAd({
  adSlot,
  className,
}: {
  adSlot: string;
  className?: string;
}): ReactElement {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="auto"
      style={{ display: 'block', width: '300px', height: '250px' }}
      className={className}
    />
  );
}

export function ResponsiveAd({
  adSlot,
  className,
}: {
  adSlot: string;
  className?: string;
}): ReactElement {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="auto"
      style={{ display: 'block' }}
      fullWidthResponsive={true}
      className={className}
    />
  );
}
