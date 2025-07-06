import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import PublicPlansContent from '@/components/features/plans/PublicPlansContent';

export const metadata: Metadata = {
  title: '公開デートプラン一覧 - カップル向け厳選プラン | Couple Plan',
  description:
    '恋愛・デートの専門家が厳選した、カップル向けの公開デートプラン一覧。東京・大阪・京都など全国の人気デートスポットから、季節限定・記念日プランまで。実際に成功したデートプランを参考に、素敵なデートを計画しましょう。',
  keywords:
    '公開デートプラン, カップル, デート, 恋愛, 東京デート, 大阪デート, 京都デート, 記念日プラン, 季節限定デート, おすすめデートスポット, デートアイデア, 厳選プラン, プロ監修',
  openGraph: {
    title: '公開デートプラン一覧 - カップル向け厳選プラン',
    description:
      '恋愛・デートの専門家が厳選した、カップル向けの公開デートプラン一覧。実際に成功したデートプランを参考に、素敵なデートを計画しましょう。',
    type: 'website',
    url: 'https://coupleplan.com/plans/public',
    images: [
      {
        url: 'https://coupleplan.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Couple Plan - 公開デートプラン一覧',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '公開デートプラン一覧 - カップル向け厳選プラン',
    description:
      '恋愛・デートの専門家が厳選した、カップル向けの公開デートプラン一覧。実際に成功したデートプランを参考に、素敵なデートを計画しましょう。',
    images: ['https://coupleplan.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://coupleplan.com/plans/public',
  },
};

// 構造化データ
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '公開デートプラン一覧',
  description: '恋愛・デートの専門家が厳選した、カップル向けの公開デートプラン一覧',
  url: 'https://coupleplan.com/plans/public',
  mainEntity: {
    '@type': 'ItemList',
    name: '公開デートプラン',
    description: 'カップル向けの厳選されたデートプラン一覧',
    numberOfItems: 'dynamic',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: 'https://coupleplan.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '公開デートプラン',
        item: 'https://coupleplan.com/plans/public',
      },
    ],
  },
};

export default function PublicPlansPage(): ReactElement {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <PublicPlansContent />
    </>
  );
}
