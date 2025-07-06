import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'デートガイド完全版 - 成功するデートの作り方とコツ | Couple Plan',
  description:
    '恋愛心理学に基づいたデートガイド。初デートの準備から記念日プランまで、成功するデートの作り方を専門家が解説。カップルの関係を深めるデートプランニングのコツを詳しく紹介します。',
  keywords:
    'デートガイド, デートプラン, 恋愛心理学, 初デート, 記念日デート, カップル, デートスポット, 恋愛テクニック, デートの作り方, 関係性構築, 恋愛アドバイス',
  openGraph: {
    title: 'デートガイド完全版 - 成功するデートの作り方とコツ',
    description:
      '恋愛心理学に基づいたデートガイド。初デートの準備から記念日プランまで、成功するデートの作り方を専門家が解説。',
    type: 'article',
    url: 'https://coupleplan.com/dating-guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'デートガイド完全版 - 成功するデートの作り方とコツ',
    description:
      '恋愛心理学に基づいたデートガイド。初デートの準備から記念日プランまで、成功するデートの作り方を専門家が解説。',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'デートガイド完全版 - 成功するデートの作り方とコツ',
  description:
    '恋愛心理学に基づいたデートガイド。初デートの準備から記念日プランまで、成功するデートの作り方を専門家が解説。',
  author: {
    '@type': 'Organization',
    name: 'Couple Plan',
    url: 'https://coupleplan.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Couple Plan',
    logo: {
      '@type': 'ImageObject',
      url: 'https://coupleplan.com/logo.png',
    },
  },
  datePublished: '2024-01-01',
  dateModified: '2024-01-01',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://coupleplan.com/dating-guide',
  },
};

export default function DatingGuidePage(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-25 to-purple-50" />

        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full px-6 py-3 shadow-lg mb-8">
              <span className="text-rose-500 mr-2 text-sm">💡</span>
              <span className="text-gray-700 font-medium text-sm">
                恋愛心理学に基づく専門ガイド
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                デートガイド完全版
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              恋愛心理学に基づいた、成功するデートの作り方とコツを専門家が詳しく解説。
              <br />
              初デートから記念日まで、カップルの関係を深めるデートプランニングの秘訣をお教えします。
            </p>
          </div>
        </div>
      </section>

      {/* 目次 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              この記事で学べること
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-rose-50 rounded-lg p-6 border border-rose-100">
                <h3 className="font-semibold text-rose-800 mb-2">🎯 デートの基本原則</h3>
                <p className="text-rose-700 text-sm">
                  成功するデートの心理学的基盤と基本的な考え方
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">💕 初デートの成功法</h3>
                <p className="text-blue-700 text-sm">
                  緊張を和らげ、相手との距離を縮める具体的テクニック
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <h3 className="font-semibold text-purple-800 mb-2">🌟 記念日デートの演出</h3>
                <p className="text-purple-700 text-sm">
                  特別な日をより印象的にするためのプランニング
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">🏙️ 場所選びの科学</h3>
                <p className="text-green-700 text-sm">
                  環境心理学に基づいた最適なデートスポット選び
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
                <h3 className="font-semibold text-yellow-800 mb-2">💬 会話テクニック</h3>
                <p className="text-yellow-700 text-sm">自然な会話を続けるための実践的な方法</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                <h3 className="font-semibold text-indigo-800 mb-2">📅 プランニングの実践</h3>
                <p className="text-indigo-700 text-sm">具体的なデートプランの作成手順と注意点</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* 1. デートの基本原則 */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-rose-500 pb-4">
                1. デートの基本原則 - 恋愛心理学の観点から
              </h2>

              <div className="bg-rose-50 rounded-lg p-8 mb-8 border border-rose-200">
                <h3 className="text-2xl font-semibold text-rose-800 mb-4">
                  「ミラーリング効果」を活用した関係構築
                </h3>
                <p className="text-rose-700 mb-4 leading-relaxed">
                  恋愛心理学において、相手の行動や話し方を自然に真似る「ミラーリング効果」は、親密感を高める重要な要素です。
                  デート中に相手の仕草や話すスピードを意識的に合わせることで、無意識レベルでの親近感を醸成できます。
                </p>
                <div className="bg-white rounded-lg p-6 border border-rose-100">
                  <h4 className="font-semibold text-rose-800 mb-3">実践的なミラーリング方法：</h4>
                  <ul className="list-disc list-inside space-y-2 text-rose-700">
                    <li>相手が飲み物を飲んだタイミングで、自分も飲み物を口にする</li>
                    <li>相手の話すスピードに合わせて、自分の話すペースを調整する</li>
                    <li>相手が身を乗り出して話すときは、自分も前傾姿勢を取る</li>
                    <li>相手の表情の変化に敏感に反応し、共感を示す</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-8 mb-8 border border-blue-200">
                <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                  「近接効果」による親密度向上
                </h3>
                <p className="text-blue-700 mb-4 leading-relaxed">
                  物理的な距離が心理的な距離に影響を与える「近接効果」は、デートにおいて非常に重要です。
                  適切な距離感を保ちながら、段階的に親密度を高めることで、自然な関係性の発展を促せます。
                </p>
                <div className="bg-white rounded-lg p-6 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-3">段階的な距離の縮め方：</h4>
                  <ol className="list-decimal list-inside space-y-2 text-blue-700">
                    <li>初めは1.5-2メートルの社会的距離を保つ</li>
                    <li>会話が弾んできたら、1-1.5メートルの個人的距離に近づく</li>
                    <li>相手の反応を見ながら、0.5-1メートルの親密な距離へ</li>
                    <li>自然な接触（肩に触れる、手を取る）のタイミングを見極める</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* 2. 初デートの成功法 */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-blue-500 pb-4">
                2. 初デートの成功法 - 第一印象から関係発展まで
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">デート前の準備</h3>
                  <ul className="space-y-3 text-green-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>
                        <strong>服装選び：</strong> 清潔感を最優先に、相手の好みを考慮した服装を選ぶ
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>
                        <strong>会話準備：</strong>{' '}
                        共通の話題を3-5個用意し、相手について知っていることを整理
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>
                        <strong>メンタル準備：</strong> 緊張を和らげるリラックス法を練習
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4">当日の心構え</h3>
                  <ul className="space-y-3 text-purple-700">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 mt-1">✓</span>
                      <span>
                        <strong>自然体で：</strong> 無理に格好つけず、素の自分を大切にする
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 mt-1">✓</span>
                      <span>
                        <strong>相手ファースト：</strong> 相手の気持ちや反応を優先的に考える
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 mt-1">✓</span>
                      <span>
                        <strong>楽しむ姿勢：</strong> 結果を重視しすぎず、時間を楽しむことを重視
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-8 border border-pink-200">
                <h3 className="text-2xl font-semibold text-pink-800 mb-4">
                  初デートで避けるべき7つのNG行動
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-pink-100">
                    <h4 className="font-semibold text-pink-800 mb-3">会話のNG</h4>
                    <ul className="space-y-2 text-pink-700 text-sm">
                      <li>• 過去の恋愛について詳しく聞く</li>
                      <li>• 自分の話ばかりをする</li>
                      <li>• ネガティブな話題を持ち出す</li>
                      <li>• 相手の外見について過度にコメントする</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-pink-100">
                    <h4 className="font-semibold text-pink-800 mb-3">行動のNG</h4>
                    <ul className="space-y-2 text-pink-700 text-sm">
                      <li>• スマートフォンを頻繁に見る</li>
                      <li>• 時間を気にしすぎる</li>
                      <li>• 相手のペースを無視する</li>
                      <li>• 無理に盛り上げようとする</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. 場所選びの科学 */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-green-500 pb-4">
                3. 場所選びの科学 - 環境心理学に基づくスポット選択
              </h2>

              <div className="bg-green-50 rounded-lg p-8 mb-8 border border-green-200">
                <h3 className="text-2xl font-semibold text-green-800 mb-6">
                  環境が与える心理的影響
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-3">🌿 自然環境</h4>
                    <p className="text-green-700 text-sm mb-3">
                      公園や海辺などの自然環境は、ストレスを軽減し、リラックス効果を提供します。
                    </p>
                    <p className="text-green-600 text-xs">
                      <strong>効果：</strong> 心拍数の安定、会話の促進、親密感の向上
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-3">🏛️ 文化的環境</h4>
                    <p className="text-green-700 text-sm mb-3">
                      美術館や博物館などの文化施設は、知的な刺激を提供し、深い会話を促します。
                    </p>
                    <p className="text-green-600 text-xs">
                      <strong>効果：</strong> 共通の話題創出、知的親密感の形成
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-3">🍽️ 食事環境</h4>
                    <p className="text-green-700 text-sm mb-3">
                      適度な騒音レベルのレストランは、プライベート感を保ちながら会話を促進します。
                    </p>
                    <p className="text-green-600 text-xs">
                      <strong>効果：</strong> 五感の刺激、共食による親密感の醸成
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-8 border border-yellow-200">
                <h3 className="text-2xl font-semibold text-yellow-800 mb-4">
                  デートタイプ別おすすめスポット
                </h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-yellow-100">
                    <h4 className="font-semibold text-yellow-800 mb-3">初デート向け</h4>
                    <p className="text-yellow-700 mb-3">
                      心理的圧迫感が少なく、自然な会話ができる場所を選ぶことが重要です。
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-2">🏛️ 文化施設</h5>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          <li>• 美術館・博物館</li>
                          <li>• 水族館・動物園</li>
                          <li>• 図書館カフェ</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-2">🌳 自然スポット</h5>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          <li>• 公園の散歩道</li>
                          <li>• 海辺の遊歩道</li>
                          <li>• 植物園</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-yellow-100">
                    <h4 className="font-semibold text-yellow-800 mb-3">継続デート向け</h4>
                    <p className="text-yellow-700 mb-3">
                      お互いの好みを理解し、共通の体験を重ねることで関係性を深めます。
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-2">🎪 体験型スポット</h5>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          <li>• 料理教室</li>
                          <li>• 陶芸体験</li>
                          <li>• ボルダリング</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-2">🎭 エンターテイメント</h5>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          <li>• コンサート・ライブ</li>
                          <li>• 映画館</li>
                          <li>• 演劇鑑賞</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. 会話テクニック */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-purple-500 pb-4">
                4. 会話テクニック - 自然な対話を続けるための実践法
              </h2>

              <div className="bg-purple-50 rounded-lg p-8 mb-8 border border-purple-200">
                <h3 className="text-2xl font-semibold text-purple-800 mb-6">
                  「FORD法」を活用した会話の広げ方
                </h3>
                <p className="text-purple-700 mb-6 leading-relaxed">
                  FORD法は、Family（家族）、Occupation（職業）、Recreation（趣味）、Dreams（夢）の4つのトピックを軸に、
                  自然な会話を展開する心理学的手法です。この方法を使うことで、相手との共通点を見つけやすくなります。
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">F - Family（家族）</h4>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• 「兄弟姉妹はいますか？」</li>
                      <li>• 「家族とはよく一緒に過ごしますか？」</li>
                      <li>• 「ペットを飼っていますか？」</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">O - Occupation（職業）</h4>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• 「お仕事は何をされていますか？」</li>
                      <li>• 「その仕事の魅力は何ですか？」</li>
                      <li>• 「仕事で大変なことはありますか？」</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">R - Recreation（趣味）</h4>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• 「休日はどう過ごすことが多いですか？」</li>
                      <li>• 「最近ハマっていることはありますか？」</li>
                      <li>• 「学生時代に夢中になったことは？」</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">D - Dreams（夢）</h4>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• 「将来の目標はありますか？」</li>
                      <li>• 「行ってみたい場所はありますか？」</li>
                      <li>• 「やってみたいことはありますか？」</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-8 border border-indigo-200">
                <h3 className="text-2xl font-semibold text-indigo-800 mb-4">
                  「アクティブリスニング」で相手の心を開く
                </h3>
                <p className="text-indigo-700 mb-6 leading-relaxed">
                  アクティブリスニング（積極的傾聴）は、相手が話していることを深く理解し、
                  感情的なつながりを築くための重要なコミュニケーション技法です。
                </p>

                <div className="bg-white rounded-lg p-6 border border-indigo-100">
                  <h4 className="font-semibold text-indigo-800 mb-4">
                    実践的なアクティブリスニング技法：
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                        1
                      </span>
                      <div>
                        <h5 className="font-medium text-indigo-800 mb-1">
                          パラフレーズ（言い換え）
                        </h5>
                        <p className="text-indigo-700 text-sm">
                          相手の言葉を自分の言葉で要約して返す「つまり〜ということですね」
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                        2
                      </span>
                      <div>
                        <h5 className="font-medium text-indigo-800 mb-1">感情の反映</h5>
                        <p className="text-indigo-700 text-sm">
                          相手の感情を言葉にして返す「それは嬉しかったでしょうね」
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                        3
                      </span>
                      <div>
                        <h5 className="font-medium text-indigo-800 mb-1">質問による深掘り</h5>
                        <p className="text-indigo-700 text-sm">
                          オープンクエスチョンで話を広げる「それについてもう少し教えてください」
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. 実践的プランニング */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-red-500 pb-4">
                5. 実践的プランニング - 具体的なデート計画の立て方
              </h2>

              <div className="bg-red-50 rounded-lg p-8 mb-8 border border-red-200">
                <h3 className="text-2xl font-semibold text-red-800 mb-6">
                  デートプランの5段階設計法
                </h3>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <div className="flex items-start">
                      <span className="bg-red-100 text-red-800 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-4">
                        1
                      </span>
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">目的の明確化</h4>
                        <p className="text-red-700 mb-3">
                          そのデートで何を達成したいか、相手との関係性をどう発展させたいかを明確にします。
                        </p>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <p className="text-red-700 text-sm">
                            <strong>例：</strong>{' '}
                            「お互いの趣味について深く知り合う」「リラックスして自然な会話を楽しむ」
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <div className="flex items-start">
                      <span className="bg-red-100 text-red-800 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-4">
                        2
                      </span>
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">相手の分析</h4>
                        <p className="text-red-700 mb-3">
                          相手の性格、好み、ライフスタイルを考慮したプランを立てます。
                        </p>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <p className="text-red-700 text-sm">
                            <strong>チェック項目：</strong>{' '}
                            インドア派/アウトドア派、食べ物の好み、時間の都合、体力的な制約
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <div className="flex items-start">
                      <span className="bg-red-100 text-red-800 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-4">
                        3
                      </span>
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">タイムテーブル作成</h4>
                        <p className="text-red-700 mb-3">
                          無理のないスケジュールを組み、余裕を持った時間配分を心がけます。
                        </p>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <p className="text-red-700 text-sm">
                            <strong>基本構成：</strong> 開始（30分）→ メイン活動（2-3時間）→
                            休憩・食事（1時間）→ 締めくくり（30分）
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <div className="flex items-start">
                      <span className="bg-red-100 text-red-800 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-4">
                        4
                      </span>
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">リスク管理</h4>
                        <p className="text-red-700 mb-3">
                          天候や混雑などの予期せぬ事態に対する代替プランを用意します。
                        </p>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <p className="text-red-700 text-sm">
                            <strong>準備事項：</strong>{' '}
                            雨天時の室内プラン、混雑時の別ルート、体調不良時の短縮プラン
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <div className="flex items-start">
                      <span className="bg-red-100 text-red-800 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-4">
                        5
                      </span>
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">フィードバック収集</h4>
                        <p className="text-red-700 mb-3">
                          デート後に相手の反応を確認し、次回のプランに活かします。
                        </p>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <p className="text-red-700 text-sm">
                            <strong>確認方法：</strong>{' '}
                            「今日はどうでしたか？」「どの部分が一番楽しかったですか？」
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* まとめ */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-gray-500 pb-4">
                まとめ - 成功するデートの秘訣
              </h2>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200">
                <div className="max-w-3xl mx-auto">
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    成功するデートの秘訣は、
                    <strong className="text-gray-900">相手への思いやり</strong>と
                    <strong className="text-gray-900">心理学的な理解</strong>
                    の組み合わせにあります。
                    この記事で紹介した各種テクニックを活用しながら、何よりも
                    <strong className="text-gray-900">相手と過ごす時間を楽しむ</strong>
                    ことを大切にしてください。
                  </p>

                  <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">重要なポイントの振り返り：</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        • <strong>心理学的アプローチ：</strong>{' '}
                        ミラーリング効果と近接効果を活用した関係構築
                      </li>
                      <li>
                        • <strong>環境の重要性：</strong> 場所選びが与える心理的影響を理解する
                      </li>
                      <li>
                        • <strong>コミュニケーション：</strong>{' '}
                        FORD法とアクティブリスニングで深い対話を実現
                      </li>
                      <li>
                        • <strong>計画性：</strong> 5段階設計法による綿密で柔軟なプランニング
                      </li>
                      <li>
                        • <strong>継続的改善：</strong> フィードバックを活用した関係性の発展
                      </li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/plans/public"
                      className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl mr-4"
                    >
                      公開プランを見る
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                      プラン作成を始める
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}
