import { render, screen } from '@testing-library/react';
import RecommendedPlansPage from '@/app/(dashboard)/recommended/page';
import { getRecommendedPlans } from '@/lib/api/recommended-plans';

jest.mock('@/lib/api/recommended-plans', () => ({
  getRecommendedPlans: jest.fn(),
}));

const mockRecommendedPlans = [
  {
    id: '1',
    title: '東京タワーデート',
    description: '東京タワーを中心とした1日デートプラン',
    location: '東京タワー',
    region: '東京都',
    budget: 10000,
    imageUrl: '/images/tokyo-tower.jpg',
    category: '定番デート',
    createdAt: new Date('2024-04-06'),
    updatedAt: new Date('2024-04-06'),
  },
  {
    id: '2',
    title: '鎌倉散策',
    description: '鎌倉の観光スポットを巡る1日プラン',
    location: '鎌倉駅',
    region: '神奈川県',
    budget: 8000,
    imageUrl: '/images/kamakura.jpg',
    category: '観光',
    createdAt: new Date('2024-04-06'),
    updatedAt: new Date('2024-04-06'),
  },
];

test('おすすめプランページが正しくレンダリングされる', async () => {
  (getRecommendedPlans as any).mockResolvedValue(mockRecommendedPlans);

  const page = await RecommendedPlansPage();
  render(page);

  // ページタイトルが表示される
  expect(screen.getByText('おすすめプラン')).toBeInTheDocument();

  // カテゴリーが表示される
  expect(screen.getByText('定番デート')).toBeInTheDocument();
  expect(screen.getByText('観光')).toBeInTheDocument();

  // プランの詳細が表示される
  expect(screen.getByText('東京タワーデート')).toBeInTheDocument();
  expect(screen.getByText('鎌倉散策')).toBeInTheDocument();
  expect(screen.getByText('東京タワーを中心とした1日デートプラン')).toBeInTheDocument();
  expect(screen.getByText('鎌倉の観光スポットを巡る1日プラン')).toBeInTheDocument();

  // 予算が表示される
  expect(screen.getByText('¥10,000')).toBeInTheDocument();
  expect(screen.getByText('¥8,000')).toBeInTheDocument();

  // 地域が表示される
  expect(screen.getByText('東京都')).toBeInTheDocument();
  expect(screen.getByText('神奈川県')).toBeInTheDocument();

  // 「このプランを使う」ボタンが表示される
  const useButtons = screen.getAllByText('このプランを使う');
  expect(useButtons).toHaveLength(2);
}); 