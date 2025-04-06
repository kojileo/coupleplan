// データベース接続テストスクリプト
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('データベース接続テストを開始します...');
  
  const prisma = new PrismaClient();
  
  try {
    // データベース接続テスト
    await prisma.$connect();
    console.log('データベース接続成功！');
    
    // テーブル一覧を取得
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('利用可能なテーブル:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // 各テーブルのレコード数を取得
    const profileCount = await prisma.profile.count();
    const planCount = await prisma.plan.count();
    const likeCount = await prisma.like.count();
    const recommendedPlanCount = await prisma.recommendedPlan.count();
    
    console.log('\nテーブルのレコード数:');
    console.log(`- profiles: ${profileCount}`);
    console.log(`- plans: ${planCount}`);
    console.log(`- likes: ${likeCount}`);
    console.log(`- recommended_plans: ${recommendedPlanCount}`);
    
  } catch (error) {
    console.error('データベース接続エラー:', error);
  } finally {
    await prisma.$disconnect();
    console.log('データベース接続を閉じました');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 