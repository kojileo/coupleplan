/// <reference types="node" />

import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('データベースのクリーンアップを開始します...');
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.like.deleteMany();
      await tx.plan.deleteMany();
      await tx.profile.deleteMany();
    });
    console.log('データベースのクリーンアップが完了しました');
  } catch (error) {
    console.error('データベースのクリーンアップ中にエラーが発生しました:', error);
    throw error;
  }
}

async function main() {
  try {
    // データベースをクリーンアップ
    await cleanDatabase();

    console.log('シードデータの作成を開始します...');

    // 管理者ユーザーの作成
    const adminUser = await prisma.profile.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        userId: uuidv4(),
        name: '管理者',
        email: 'admin@example.com',
        isAdmin: true,
      },
    });

    // おすすめプランの作成
    const recommendedPlans = [
      {
        title: '初デート成功の心理学戦略プラン【渋谷編】',
        description:
          '心理学に基づいた初デートの成功確率を最大化するプラン。ミラーリング効果、近接効果、共感的理解を活用し、自然な会話の流れを作る5段階構成。待ち合わせからお別れまで、各段階での心理的ポイントと具体的な行動指針を詳細に解説。実際の成功率85%を記録したプロ監修の実践的プラン。',
        locations: {
          create: [
            {
              url: 'https://www.shibuya-sky.com/',
              name: '渋谷スカイ（開放感による心理的距離短縮効果）',
            },
            {
              url: 'https://www.shibuya109.jp/',
              name: '渋谷109前（共通の話題作り・観察学習の場）',
            },
            {
              url: 'https://www.tokyu-dept.co.jp/toyoko/',
              name: '東急東横店12F（落ち着いた環境での深い会話）',
            },
          ],
        },
        region: 'tokyo',
        budget: 12000,
        category: '定番デート',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '関係性深化の鎌倉マインドフルネスデート',
        description:
          '恋愛関係を深めるための心理学的アプローチを取り入れた鎌倉デート。マインドフルネス技法を活用し、相手への集中力を高める5つのポイント：①歩行瞑想による同調効果、②寺院での静寂体験による心理的親密度向上、③海辺での開放的会話、④和食での五感共有体験、⑤夕日鑑賞による感情の共有。カップルセラピストが推奨する実践的プログラム。',
        locations: {
          create: [
            {
              url: 'https://www.kenchoji.com/',
              name: '建長寺（マインドフルネス実践・心理的安定効果）',
            },
            {
              url: 'https://www.hasedera.jp/',
              name: '長谷寺（美的共感体験・感情の共有）',
            },
            {
              url: 'https://www.city.kamakura.kanagawa.jp/',
              name: '由比ヶ浜海岸（開放的環境での深い対話）',
            },
          ],
        },
        region: 'yokohama',
        budget: 8000,
        category: '観光',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '五感を使った横浜中華街グルメ心理学デート',
        description:
          '食事を通じた恋愛心理学の実践プラン。五感を刺激することで記憶に残る体験を創造し、相手との心理的結びつきを強化。①香りによる記憶の定着効果、②味覚の共有による親密度向上、③食事中の適切な距離感（プロクセミクス理論）、④会話のペーシングテクニック、⑤食後の散歩による消化と関係性の消化。恋愛コーチングの専門技術を活用した実践的アプローチ。',
        locations: {
          create: [
            {
              url: 'https://www.chinatown.or.jp/',
              name: '横浜中華街（五感刺激による記憶定着効果）',
            },
            {
              url: 'https://www.yokohama-akarenga.jp/',
              name: '赤レンガ倉庫（ロマンチック環境での感情増幅）',
            },
            {
              url: 'https://www.cosmoworld.jp/',
              name: 'コスモワールド（共同体験による絆深化）',
            },
          ],
        },
        region: 'yokohama',
        budget: 15000,
        category: 'グルメ',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '挑戦と成長の心理学：富士山ハイキングデート',
        description:
          '共同挑戦による絆深化の心理学原理を活用したハイキングプラン。困難を共に乗り越える体験が恋愛関係に与える心理的効果を最大化。①目標設定による共同意識の形成、②困難共有による心理的結束、③達成感の共有による満足度向上、④自然環境によるストレス軽減効果、⑤達成後の感情の共有。スポーツ心理学とカップルセラピーの知見を融合した実践プログラム。',
        locations: {
          create: [
            {
              url: 'https://www.fujisan-climb.jp/',
              name: '富士山五合目（共同挑戦による絆深化）',
            },
            {
              url: 'https://www.fujigoko.tv/',
              name: '富士五湖（自然環境による心理的癒し効果）',
            },
            {
              url: 'https://www.fujikyu.co.jp/',
              name: '富士急ハイランド（達成感後のリラクゼーション）',
            },
          ],
        },
        region: 'other',
        budget: 18000,
        category: 'アクティビティ',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '夏の花火大会：感情共有と記憶定着の心理学デート',
        description:
          '花火の美しさと感動を通じた感情共有による恋愛関係強化プラン。感情の同調効果と記憶の定着メカニズムを活用。①感情の同調による心理的結束、②美的体験の共有による価値観の一致確認、③群衆心理を利用した特別感の演出、④夜間の親密度向上効果、⑤記憶の定着による長期関係への影響。イベント心理学の専門知識を活用した戦略的アプローチ。',
        locations: {
          create: [
            {
              url: 'https://sumidagawa-hanabi.com/',
              name: '隅田川花火大会（感情共有による心理的結束）',
            },
            {
              url: 'https://www.tokyo-skytree.jp/',
              name: '東京スカイツリー（特別感演出による記憶定着）',
            },
            {
              url: 'https://www.tokyo-park.or.jp/park/format/about061.html',
              name: '隅田公園（静寂空間での感情の消化）',
            },
          ],
        },
        region: 'tokyo',
        budget: 8000,
        category: '季節限定',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '記念日の心理学：特別感演出と関係性強化の高級ディナー',
        description:
          '記念日の心理的意味を最大化し、関係性を深化させる高級ディナープラン。特別感の演出による愛着形成と、将来への期待感を高める心理学的技法を活用。①環境設定による特別感の演出、②五感を通じた記憶の強化、③感謝の表現による関係性の確認、④将来への期待感の共有、⑤記念品による記憶の物理的定着。恋愛心理学とホスピタリティ心理学の専門知識を融合した上級プラン。',
        locations: {
          create: [
            {
              url: 'https://www.tokyo-skytree.jp/',
              name: '東京スカイツリー レストラン（特別感による記憶定着）',
            },
            {
              url: 'https://www.roppongihills.com/',
              name: '六本木ヒルズ（都市の夜景による感情増幅）',
            },
            {
              url: 'https://www.imperial-hotel.co.jp/',
              name: '帝国ホテル（格式による特別感の演出）',
            },
          ],
        },
        region: 'tokyo',
        budget: 50000,
        category: '記念日',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
    ];

    // トランザクション内でプランを作成
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const plan of recommendedPlans) {
        await tx.plan.create({
          data: plan,
        });
      }
    });

    console.log('シードデータの作成が完了しました');
  } catch (error) {
    console.error('シード処理中にエラーが発生しました:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('シード処理中にエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('データベース接続の切断中にエラーが発生しました:', e);
    }
  });
