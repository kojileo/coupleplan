/// <reference types="node" />

import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Prismaクライアントの初期化
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

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

    console.log('管理者ユーザーを作成しました:', adminUser);

    // おすすめプランの作成
    const recommendedPlans = [
      {
        title: '東京タワーデート',
        description: '東京タワーを中心とした1日デートプラン',
        locations: {
          create: [
            {
              url: 'https://www.tokyotower.co.jp/',
              name: '東京タワー',
            },
          ],
        },
        region: 'tokyo',
        budget: 10000,
        category: '定番デート',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '鎌倉散策',
        description: '鎌倉の観光スポットを巡る1日プラン',
        locations: {
          create: [
            {
              url: 'https://www.kamakura-info.jp/',
              name: '鎌倉駅',
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
        title: '横浜中華街グルメツアー',
        description: '横浜中華街の美味しい料理を巡るプラン',
        locations: {
          create: [
            {
              url: 'https://www.chinatown.or.jp/',
              name: '横浜中華街',
            },
          ],
        },
        region: 'yokohama',
        budget: 12000,
        category: 'グルメ',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '富士山五合目ハイキング',
        description: '富士山五合目からの絶景ハイキングプラン',
        locations: {
          create: [
            {
              url: 'https://www.fujisan-climb.jp/',
              name: '富士山五合目',
            },
          ],
        },
        region: 'other',
        budget: 15000,
        category: 'アクティビティ',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '夏の花火大会デート',
        description: '夏の風物詩、花火大会を楽しむプラン',
        locations: {
          create: [
            {
              url: 'https://sumidagawa-hanabi.com/',
              name: '隅田川花火大会',
            },
          ],
        },
        region: 'tokyo',
        budget: 5000,
        category: '季節限定',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
      {
        title: '記念日ディナー',
        description: '特別な記念日を祝う豪華ディナープラン',
        locations: {
          create: [
            {
              url: 'https://www.tokyo-skytree.jp/',
              name: '東京スカイツリー',
            },
          ],
        },
        region: 'tokyo',
        budget: 30000,
        category: '記念日',
        isRecommended: true,
        isPublic: true,
        userId: adminUser.userId,
      },
    ];

    // トランザクション内でプランを作成
    await prisma.$transaction(async (tx) => {
      for (const plan of recommendedPlans) {
        try {
          const createdPlan = await tx.plan.create({
            data: plan,
          });
          console.log('プランを作成しました:', createdPlan.title);
        } catch (error) {
          console.error('プランの作成中にエラーが発生しました:', plan.title, error);
          throw error;
        }
      }
    });

    console.log('シードデータの作成が完了しました');
  } catch (error) {
    console.error('シード処理中にエラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('シード処理中にエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
