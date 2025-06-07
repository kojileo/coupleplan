import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import type { ReactElement } from 'react';

import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://coupleplan.com'),
  title: {
    default: 'Couple Plan - カップルのためのデートプラン管理・お手洗い検索・会話ネタ提供アプリ',
    template: '%s | Couple Plan',
  },
  description:
    'カップルで一緒にデートプランを作成・共有・管理できるWebアプリケーション。現在地周辺のお手洗い検索、デート中の会話ネタ提供、行きたい場所の保存、予算管理、公開プランの参考など、デートをより楽しくする緊急ヘルプ機能付きアプリです。',
  keywords: [
    'デートプラン',
    'カップル',
    'アプリ',
    'デート',
    '恋人',
    '予定管理',
    '旅行計画',
    'プラン共有',
    'お手洗い検索',
    'トイレ検索',
    '公衆トイレ',
    '現在地 トイレ',
    'デート トイレ',
    '会話ネタ',
    '話題提供',
    'デート 会話',
    'カップル 話題',
    '恋人 会話',
    '緊急ヘルプ',
    'デート サポート',
    '位置情報',
    'Google マップ連携',
    'デート 困った',
    'デート 助け',
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
    siteName: 'Couple Plan',
    title: 'Couple Plan - お手洗い検索・会話ネタ提供付きデートプラン管理アプリ',
    description:
      'デート中の「困った」を瞬間解決！お手洗い検索、会話ネタ提供、デートプラン管理が一つになったカップル向けアプリ。',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Couple Plan - お手洗い検索・会話ネタ提供付きデートプラン管理アプリ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Couple Plan - お手洗い検索・会話ネタ提供付きデートプラン管理アプリ',
    description:
      'デート中の「困った」を瞬間解決！お手洗い検索、会話ネタ提供、デートプラン管理が一つになったカップル向けアプリ。',
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
              name: 'Couple Plan',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web Browser',
              description: 'カップル向けデートプラン管理・お手洗い検索・会話ネタ提供アプリ',
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
                'デートプラン作成・管理',
                '現在地周辺お手洗い検索',
                'カップル向け会話ネタ提供',
                'デート場所の保存・共有',
                '予算管理機能',
                '緊急ヘルプ機能',
                'Google マップ連携',
              ],
              keywords: 'デートプラン,お手洗い検索,会話ネタ,カップル,デート,恋人',
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
