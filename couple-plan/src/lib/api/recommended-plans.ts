import { prisma } from '@/lib/prisma';
import { RecommendedPlan } from '@/types/plan';

export async function getRecommendedPlans(): Promise<RecommendedPlan[]> {
  const plans = await prisma.recommendedPlan.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return plans;
}

export async function getRecommendedPlanById(id: string): Promise<RecommendedPlan | null> {
  const plan = await prisma.recommendedPlan.findUnique({
    where: { id },
  });

  return plan;
}

export async function createRecommendedPlan(
  data: Omit<RecommendedPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RecommendedPlan> {
  const plan = await prisma.recommendedPlan.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      region: data.region,
      budget: data.budget,
      imageUrl: data.imageUrl,
      category: data.category,
    },
  });

  return plan;
}

export async function updateRecommendedPlan(
  id: string,
  data: Partial<Omit<RecommendedPlan, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<RecommendedPlan> {
  const plan = await prisma.recommendedPlan.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      region: data.region,
      budget: data.budget,
      imageUrl: data.imageUrl,
      category: data.category,
    },
  });

  return plan;
}

export async function deleteRecommendedPlan(id: string): Promise<RecommendedPlan> {
  const plan = await prisma.recommendedPlan.delete({
    where: { id },
  });

  return plan;
}
