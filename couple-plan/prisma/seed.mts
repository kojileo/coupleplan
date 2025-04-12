import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
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
      id: uuidv4(),
      title: '東京タワーデート',
      description: '東京タワーを中心とした1日デートプラン',
      location: '東京タワー',
      region: 'tokyo',
      budget: 10000,
      imageUrl: '/images/tokyo-tower.jpg',
      category: '定番デート',
    },
    {
      id: uuidv4(),
      title: '鎌倉散策',
      description: '鎌倉の観光スポットを巡る1日プラン',
      location: '鎌倉駅',
      region: 'yokohama',
      budget: 8000,
      imageUrl: '/images/kamakura.jpg',
      category: '観光',
    },
    {
      id: uuidv4(),
      title: '横浜中華街グルメツアー',
      description: '横浜中華街の美味しい料理を巡るプラン',
      location: '横浜中華街',
      region: 'yokohama',
      budget: 12000,
      imageUrl: '/images/yokohama-chinatown.jpg',
      category: 'グルメ',
    },
    {
      id: uuidv4(),
      title: '富士山五合目ハイキング',
      description: '富士山五合目からの絶景ハイキングプラン',
      location: '富士山五合目',
      region: 'other',
      budget: 15000,
      imageUrl: '/images/mount-fuji.jpg',
      category: 'アクティビティ',
    },
    {
      id: uuidv4(),
      title: '夏の花火大会デート',
      description: '夏の風物詩、花火大会を楽しむプラン',
      location: '隅田川花火大会',
      region: 'tokyo',
      budget: 5000,
      imageUrl: '/images/fireworks.jpg',
      category: '季節限定',
    },
    {
      id: uuidv4(),
      title: '記念日ディナー',
      description: '特別な記念日を祝う豪華ディナープラン',
      location: '東京スカイツリー',
      region: 'tokyo',
      budget: 30000,
      imageUrl: '/images/sky-tree.jpg',
      category: '記念日',
    },
  ];

  for (const plan of recommendedPlans) {
    await prisma.recommendedPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
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