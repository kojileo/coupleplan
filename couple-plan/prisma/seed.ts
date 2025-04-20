/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function cleanDatabase() {
  // 外部キー制約を考慮して、正しい順序で削除
  console.log('データベースのクリーンアップを開始します...');

  // 各テーブルのデータを削除
  await prisma.like.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.profile.deleteMany();

  console.log('データベースのクリーンアップが完了しました');
}

async function main() {
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

  for (const plan of recommendedPlans) {
    await prisma.plan.create({
      data: plan,
    });
  }

  console.log('シードデータの作成が完了しました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
