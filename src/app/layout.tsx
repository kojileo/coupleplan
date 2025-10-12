import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import type { ReactElement } from 'react';

import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

// 緊急停止スクリプトを読み込み（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  import('@/lib/force-stop');
  import('@/lib/debug-auth'); // デバッグ用認証ユーティリティ
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://coupleplan.com'),
  title: {
    default: 'CouplePlan - カップルの絆を深める統合プラットフォーム',
    template: '%s | CouplePlan',
  },
  description:
    'AIが提案するデートプランから、カップルでの共同編集、関係修復まで、カップルの絆を深める統合プラットフォーム。パーソナライズされたデートプラン生成、リアルタイム共同編集、AI喧嘩仲裁など、二人の関係性をサポートする機能を提供します。',
  keywords: [
    'デートプラン',
    'カップル',
    'アプリ',
    'デート',
    '恋人',
    'AI',
    '人工知能',
    'デート提案',
    'プラン生成',
    '共同編集',
    'リアルタイム',
    '関係修復',
    '喧嘩仲裁',
    'カップルアプリ',
    'デート支援',
    '関係性',
    '絆',
    'パーソナライズ',
    '統合プラットフォーム',
    'カップル向け',
    'デート管理',
    'プラン共有',
    'AI提案',
  ].join(', '),
  authors: [{ name: 'Couple Plan Team' }],
  creator: 'Couple Plan',
  publisher: 'Couple Plan',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://coupleplan.com',
    siteName: 'CouplePlan',
    title: 'CouplePlan - カップルの絆を深める統合プラットフォーム',
    description:
      'AIが提案するデートプランから、カップルでの共同編集、関係修復まで、カップルの絆を深める統合プラットフォーム。',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CouplePlan - カップルの絆を深める統合プラットフォーム',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CouplePlan - カップルの絆を深める統合プラットフォーム',
    description:
      'AIが提案するデートプランから、カップルでの共同編集、関係修復まで、カップルの絆を深める統合プラットフォーム。',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://coupleplan.com',
  },
  category: 'lifestyle',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <html lang="ja">
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'CouplePlan',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web Browser',
              description: 'カップルの絆を深める統合プラットフォーム',
              url: 'https://coupleplan.com',
              author: {
                '@type': 'Organization',
                name: 'Couple Plan Team',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'JPY',
                availability: 'https://schema.org/InStock',
              },
              featureList: [
                'AIデートプラン生成',
                'リアルタイム共同編集',
                'AI喧嘩仲裁・関係修復',
                'Date Canvas共同編集ボード',
                'ポータル統合プラットフォーム',
                '段階的マネタイズ制御',
                'カップル関係性分析',
              ],
              keywords: 'デートプラン,AI,共同編集,関係修復,カップル,デート,恋人',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1250',
                bestRating: '5',
                worstRating: '1',
              },
              screenshot: 'https://coupleplan.com/og-image.jpg',
            }),
          }}
        />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <meta
          name="google-site-verification"
          content={process.env.GOOGLE_SITE_VERIFICATION || ''}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
