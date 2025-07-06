import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: '恋愛心理学完全ガイド - 科学的根拠に基づく恋愛成功法 | Couple Plan',
  description:
    '心理学研究に基づいた恋愛の科学的アプローチ。愛着理論、認知バイアス、社会心理学の観点から恋愛関係を分析し、成功する恋愛の法則を専門家が詳しく解説します。',
  keywords:
    '恋愛心理学, 愛着理論, 恋愛科学, 心理学研究, 認知バイアス, 社会心理学, 恋愛成功法, パートナーシップ, 心理学的アプローチ, 恋愛行動',
  openGraph: {
    title: '恋愛心理学完全ガイド - 科学的根拠に基づく恋愛成功法',
    description:
      '心理学研究に基づいた恋愛の科学的アプローチ。愛着理論、認知バイアス、社会心理学の観点から恋愛関係を分析。',
    type: 'article',
    url: 'https://coupleplan.com/love-psychology',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '恋愛心理学完全ガイド - 科学的根拠に基づく恋愛成功法',
  description:
    '心理学研究に基づいた恋愛の科学的アプローチ。愛着理論、認知バイアス、社会心理学の観点から恋愛関係を分析。',
  author: {
    '@type': 'Organization',
    name: 'Couple Plan',
  },
  datePublished: '2024-01-01',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://coupleplan.com/love-psychology',
  },
};

export default function LovePsychologyPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-25 to-blue-50" />

        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full px-6 py-3 shadow-lg mb-8">
              <span className="text-purple-500 mr-2 text-sm">🧠</span>
              <span className="text-gray-700 font-medium text-sm">科学的根拠に基づく恋愛理論</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                恋愛心理学
              </span>
              <span className="block text-gray-900 mt-2">完全ガイド</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              心理学の研究成果に基づいた、科学的な恋愛アプローチを学びましょう。
              <br />
              愛着理論から認知心理学まで、恋愛を成功に導く心理学的法則を詳しく解説します。
            </p>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* 1. 愛着理論 */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-purple-500 pb-4">
                1. 愛着理論（Attachment Theory）
              </h2>

              <div className="bg-purple-50 rounded-lg p-8 mb-8 border border-purple-200">
                <h3 className="text-2xl font-semibold text-purple-800 mb-6">
                  愛着スタイルが恋愛関係に与える影響
                </h3>
                <p className="text-purple-700 mb-6 leading-relaxed">
                  ジョン・ボウルビィによって提唱された愛着理論は、幼少期の養育者との関係が成人後の恋愛関係に大きな影響を与えることを示しています。
                  愛着スタイルを理解することで、自分や相手の行動パターンを深く理解できるようになります。
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">🔐 安全型愛着（Secure）</h4>
                    <p className="text-purple-700 text-sm mb-3">
                      <strong>特徴：</strong> 信頼関係を築くのが得意で、感情的に安定している
                    </p>
                    <div className="space-y-2 text-purple-600 text-xs">
                      <p>• 相手との親密さを求めつつ、独立性も保てる</p>
                      <p>• コミュニケーションが直接的で建設的</p>
                      <p>• 成人の約60-70%がこのタイプ</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">😰 不安型愛着（Anxious）</h4>
                    <p className="text-purple-700 text-sm mb-3">
                      <strong>特徴：</strong> 見捨てられることへの不安が強く、相手に依存しがち
                    </p>
                    <div className="space-y-2 text-purple-600 text-xs">
                      <p>• 相手の愛情を常に確認したがる</p>
                      <p>• 感情の起伏が激しい</p>
                      <p>• 成人の約15-20%がこのタイプ</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">
                      🚪 回避型愛着（Avoidant）
                    </h4>
                    <p className="text-purple-700 text-sm mb-3">
                      <strong>特徴：</strong> 親密さを避け、独立を重視する傾向が強い
                    </p>
                    <div className="space-y-2 text-purple-600 text-xs">
                      <p>• 感情を表現するのが苦手</p>
                      <p>• 一人の時間を重視する</p>
                      <p>• 成人の約15-25%がこのタイプ</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">
                      🌪️ 混乱型愛着（Disorganized）
                    </h4>
                    <p className="text-purple-700 text-sm mb-3">
                      <strong>特徴：</strong> 不安型と回避型の両方の特徴を持つ
                    </p>
                    <div className="space-y-2 text-purple-600 text-xs">
                      <p>• 親密さを求めつつも恐れる</p>
                      <p>• 感情のコントロールが困難</p>
                      <p>• 成人の約5-10%がこのタイプ</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-8 border border-indigo-200">
                <h3 className="text-2xl font-semibold text-indigo-800 mb-4">
                  愛着スタイル別コミュニケーション戦略
                </h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-indigo-100">
                    <h4 className="font-semibold text-indigo-800 mb-3">
                      不安型パートナーとの関係構築
                    </h4>
                    <ul className="space-y-2 text-indigo-700 text-sm">
                      <li>
                        • <strong>一貫性：</strong> 言動に一貫性を保ち、予測可能な行動を心がける
                      </li>
                      <li>
                        • <strong>安心感の提供：</strong>{' '}
                        定期的に愛情表現を行い、関係の安定性を伝える
                      </li>
                      <li>
                        • <strong>感情の受容：</strong> 相手の不安を否定せず、理解していることを示す
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-indigo-100">
                    <h4 className="font-semibold text-indigo-800 mb-3">
                      回避型パートナーとの関係構築
                    </h4>
                    <ul className="space-y-2 text-indigo-700 text-sm">
                      <li>
                        • <strong>段階的アプローチ：</strong>{' '}
                        急激な親密さを求めず、徐々に距離を縮める
                      </li>
                      <li>
                        • <strong>独立性の尊重：</strong> 相手の一人の時間と空間を尊重する
                      </li>
                      <li>
                        • <strong>非言語的表現：</strong> 言葉よりも行動で愛情を示す
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. 認知バイアス */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-blue-500 pb-4">
                2. 恋愛における認知バイアス
              </h2>

              <div className="bg-blue-50 rounded-lg p-8 mb-8 border border-blue-200">
                <h3 className="text-2xl font-semibold text-blue-800 mb-6">
                  恋愛関係に影響を与える主要な認知バイアス
                </h3>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-3">
                      💕 ハロー効果（Halo Effect）
                    </h4>
                    <p className="text-blue-700 mb-3">
                      相手の一つの良い特徴が、他のすべての特徴を良く見せてしまう心理現象。恋愛初期に特に顕著に現れます。
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h5 className="font-medium text-blue-800 mb-2">対処法：</h5>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• 相手の具体的な行動を客観的に観察する</li>
                        <li>• 友人や家族の意見も参考にする</li>
                        <li>• 時間をかけて相手を知る</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-3">
                      🔍 確証バイアス（Confirmation Bias）
                    </h4>
                    <p className="text-blue-700 mb-3">
                      自分の既存の信念や期待を支持する情報ばかりを探し、反対の情報を無視してしまう傾向。
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h5 className="font-medium text-blue-800 mb-2">恋愛での例：</h5>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• 相手が自分を好きだと思い込み、好意的な行動だけに注目する</li>
                        <li>• 逆に、相手が自分を嫌っていると思い込み、否定的な解釈ばかりする</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-3">
                      🎯 基本的帰属エラー（Fundamental Attribution Error）
                    </h4>
                    <p className="text-blue-700 mb-3">
                      他人の行動を性格や人格に起因すると考えがちで、状況的要因を軽視してしまう傾向。
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h5 className="font-medium text-blue-800 mb-2">恋愛での例：</h5>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• 相手が遅刻したとき「時間にルーズな人」と決めつける</li>
                        <li>• 連絡が遅いとき「自分に興味がない」と思い込む</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. 社会心理学的現象 */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-green-500 pb-4">
                3. 恋愛における社会心理学的現象
              </h2>

              <div className="bg-green-50 rounded-lg p-8 mb-8 border border-green-200">
                <h3 className="text-2xl font-semibold text-green-800 mb-6">
                  「単純接触効果」による好意の形成
                </h3>
                <p className="text-green-700 mb-6 leading-relaxed">
                  ロバート・ザイアンスによって提唱された単純接触効果は、接触回数が増えるほど好感度が高まるという心理現象です。
                  恋愛関係の発展において、この効果を理解し活用することは非常に重要です。
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-3">📈 効果的な接触頻度</h4>
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>
                        • <strong>初期段階：</strong> 週2-3回の短時間接触
                      </li>
                      <li>
                        • <strong>発展期：</strong> 週3-4回の中程度接触
                      </li>
                      <li>
                        • <strong>安定期：</strong> 質の高い接触を重視
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-3">⚠️ 過度の接触による逆効果</h4>
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>• 毎日の長時間接触は疲労を生む</li>
                      <li>• 強制的な接触は嫌悪感を招く</li>
                      <li>• 適度な距離感が重要</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-8 border border-yellow-200">
                <h3 className="text-2xl font-semibold text-yellow-800 mb-4">
                  「相補性の原理」と「類似性の原理」
                </h3>
                <p className="text-yellow-700 mb-6 leading-relaxed">
                  恋愛関係において、似ている部分と補完し合う部分のバランスが重要です。
                  心理学研究では、両方の要素が長期的な関係の成功に寄与することが示されています。
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-yellow-100">
                    <h4 className="font-semibold text-yellow-800 mb-3">🤝 類似性の魅力</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-1">価値観の共有</h5>
                        <p className="text-yellow-700 text-sm">
                          人生観、道徳観、将来の目標などの根本的価値観の一致
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-1">趣味・興味の共通性</h5>
                        <p className="text-yellow-700 text-sm">共通の活動を通じた絆の深化</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-yellow-100">
                    <h4 className="font-semibold text-yellow-800 mb-3">⚖️ 相補性の魅力</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-1">性格の補完</h5>
                        <p className="text-yellow-700 text-sm">
                          内向的vs外向的、計画的vs spontaneousなど
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-1">スキルの補完</h5>
                        <p className="text-yellow-700 text-sm">お互いの得意分野で支え合う関係</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. 神経科学的観点 */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-red-500 pb-4">
                4. 恋愛の神経科学 - 脳科学が明かす愛の仕組み
              </h2>

              <div className="bg-red-50 rounded-lg p-8 mb-8 border border-red-200">
                <h3 className="text-2xl font-semibold text-red-800 mb-6">
                  恋愛に関わる神経伝達物質
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-3">💘 ドーパミン（Dopamine）</h4>
                    <p className="text-red-700 text-sm mb-3">
                      <strong>役割：</strong> 快楽と報酬の感覚を生み出し、恋愛初期の高揚感を演出
                    </p>
                    <div className="space-y-2 text-red-600 text-xs">
                      <p>• 相手を見ただけで放出される</p>
                      <p>• 「恋愛依存」の原因物質</p>
                      <p>• 新しい体験への動機を生む</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-3">🤗 オキシトシン（Oxytocin）</h4>
                    <p className="text-red-700 text-sm mb-3">
                      <strong>役割：</strong> 愛着形成と絆の強化、「愛情ホルモン」とも呼ばれる
                    </p>
                    <div className="space-y-2 text-red-600 text-xs">
                      <p>• 身体接触によって分泌される</p>
                      <p>• 信頼関係の構築に重要</p>
                      <p>• 長期的な関係維持に不可欠</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-3">
                      😍 フェニルエチルアミン（PEA）
                    </h4>
                    <p className="text-red-700 text-sm mb-3">
                      <strong>役割：</strong> 恋愛初期の興奮と集中力を高める「天然の覚醒剤」
                    </p>
                    <div className="space-y-2 text-red-600 text-xs">
                      <p>• チョコレートにも含まれる</p>
                      <p>• 相手への集中力を高める</p>
                      <p>• 通常1-3年で減少する</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-3">
                      💪 バソプレシン（Vasopressin）
                    </h4>
                    <p className="text-red-700 text-sm mb-3">
                      <strong>役割：</strong> パートナーへの保護欲と独占欲を生み出す
                    </p>
                    <div className="space-y-2 text-red-600 text-xs">
                      <p>• 男性により強く作用</p>
                      <p>• 一夫一妻制の生物学的基盤</p>
                      <p>• 長期的コミットメントを促進</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-8 border border-pink-200">
                <h3 className="text-2xl font-semibold text-pink-800 mb-4">
                  恋愛の3つのフェーズと脳の変化
                </h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-pink-100">
                    <div className="flex items-start">
                      <span className="bg-pink-100 text-pink-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                        1
                      </span>
                      <div>
                        <h4 className="font-semibold text-pink-800 mb-2">情熱期（0-18ヶ月）</h4>
                        <p className="text-pink-700 mb-3">
                          ドーパミンとPEAが大量分泌され、相手への強い執着と高揚感が特徴。
                        </p>
                        <p className="text-pink-600 text-sm">
                          <strong>脳の状態：</strong>{' '}
                          前頭前野の活動低下により、判断力が鈍る「恋は盲目」状態
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-pink-100">
                    <div className="flex items-start">
                      <span className="bg-pink-100 text-pink-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                        2
                      </span>
                      <div>
                        <h4 className="font-semibold text-pink-800 mb-2">愛着期（1-3年）</h4>
                        <p className="text-pink-700 mb-3">
                          オキシトシンが主役となり、安定した絆と信頼関係が形成される。
                        </p>
                        <p className="text-pink-600 text-sm">
                          <strong>脳の状態：</strong>{' '}
                          前頭前野の機能が回復し、より現実的な判断が可能に
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-pink-100">
                    <div className="flex items-start">
                      <span className="bg-pink-100 text-pink-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                        3
                      </span>
                      <div>
                        <h4 className="font-semibold text-pink-800 mb-2">長期愛着期（3年以降）</h4>
                        <p className="text-pink-700 mb-3">
                          バソプレシンとオキシトシンのバランスにより、深い愛着と安定性が維持される。
                        </p>
                        <p className="text-pink-600 text-sm">
                          <strong>脳の状態：</strong>{' '}
                          安定したホルモンバランスにより、長期的なパートナーシップが可能
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* まとめ */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-gray-500 pb-4">
                まとめ - 科学的知識を恋愛に活かす
              </h2>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200">
                <div className="max-w-3xl mx-auto">
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    恋愛心理学の知識は、自分と相手をより深く理解し、
                    <strong className="text-gray-900">健全で満足度の高い関係</strong>
                    を築くためのツールです。
                    科学的根拠に基づいたアプローチを取り入れることで、感情に流されすぎることなく、
                    <strong className="text-gray-900">建設的な関係性</strong>を構築できます。
                  </p>

                  <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">実践への応用ポイント：</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        • <strong>自己理解：</strong>{' '}
                        自分の愛着スタイルを知り、行動パターンを客観視する
                      </li>
                      <li>
                        • <strong>相手理解：</strong> パートナーの心理的特性を尊重し、適切に対応する
                      </li>
                      <li>
                        • <strong>バイアス認識：</strong>{' '}
                        認知バイアスの存在を意識し、現実的な判断を心がける
                      </li>
                      <li>
                        • <strong>段階的発展：</strong>{' '}
                        恋愛の自然な発展段階を理解し、焦らず関係を築く
                      </li>
                      <li>
                        • <strong>長期的視点：</strong>{' '}
                        一時的な感情に惑わされず、持続可能な関係を目指す
                      </li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/dating-guide"
                      className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl mr-4"
                    >
                      デートガイドを読む
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                      実践を始める
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
