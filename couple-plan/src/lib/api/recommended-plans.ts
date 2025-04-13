import { prisma } from '@/lib/prisma';
import { RecommendedPlan, Plan } from '@/types/plan';

function convertToRecommendedPlan(plan: Plan): RecommendedPlan {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    locations: plan.locations,
    region: plan.region ?? null,
    budget: plan.budget,
    imageUrl: null,
    category: plan.category ?? '',
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export async function getRecommendedPlans(): Promise<RecommendedPlan[]> {
  const plans = await prisma.plan.findMany({
    where: {
      isRecommended: true,
    },
    include: {
      locations: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return plans.map(convertToRecommendedPlan);
}

export async function getRecommendedPlanById(id: string): Promise<RecommendedPlan | null> {
  const plan = await prisma.plan.findFirst({
    where: {
      id,
      isRecommended: true,
    },
    include: {
      locations: true,
    },
  });

  return plan ? convertToRecommendedPlan(plan) : null;
}

export async function createRecommendedPlan(
  data: Omit<RecommendedPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RecommendedPlan> {
  const plan = await prisma.plan.create({
    data: {
      title: data.title,
      description: data.description,
      locations: {
        create: data.locations,
      },
      region: data.region,
      budget: data.budget,
      isRecommended: true,
      category: data.category,
      userId: 'system',
    },
    include: {
      locations: true,
    },
  });

  return convertToRecommendedPlan(plan);
}

export async function updateRecommendedPlan(
  id: string,
  data: Partial<Omit<RecommendedPlan, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<RecommendedPlan> {
  const plan = await prisma.plan.update({
    where: {
      id,
      isRecommended: true,
    },
    data: {
      title: data.title,
      description: data.description,
      locations: data.locations
        ? {
            deleteMany: {},
            create: data.locations,
          }
        : undefined,
      region: data.region,
      budget: data.budget,
      category: data.category,
    },
    include: {
      locations: true,
    },
  });

  return convertToRecommendedPlan(plan);
}

export async function deleteRecommendedPlan(id: string): Promise<RecommendedPlan> {
  const plan = await prisma.plan.delete({
    where: {
      id,
      isRecommended: true,
    },
    include: {
      locations: true,
    },
  });

  return convertToRecommendedPlan(plan);
}
