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
    default: 'Couple Plan - カップルのためのデートプラン管理アプリ',
    template: '%s | Couple Plan',
  },
  description:
    'カップルで一緒にデートプランを作成・共有・管理できるWebアプリケーション。行きたい場所の保存、予算管理、公開プランの参考など、デートをより楽しくする機能を提供しています。',
  keywords: 'デートプラン, カップル, アプリ, デート, 恋人, 予定管理, 旅行計画, プラン共有',
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
    title: 'Couple Plan - カップルのためのデートプラン管理アプリ',
    description: 'カップルで一緒にデートプランを作成・共有・管理できるWebアプリケーション。',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Couple Plan - カップルのためのデートプラン管理アプリ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Couple Plan - カップルのためのデートプラン管理アプリ',
    description: 'カップルで一緒にデートプランを作成・共有・管理できるWebアプリケーション。',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://coupleplan.com',
  },
  category: 'lifestyle',
};

export default function RootLayout({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <html lang="ja">
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <meta name="google-site-verification" content="your-google-site-verification-code" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
