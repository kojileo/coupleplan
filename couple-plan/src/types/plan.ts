import type { Plan as PrismaBasePlan, Profile, Like } from '@prisma/client';

export type ExtendedPlan = PrismaBasePlan & {
  profile?: Profile | null;
  likes?: Like[];
  _count?: {
    likes: number;
  };
};

export type { PrismaBasePlan as Plan };

export type CreatePlanInput = {
  title: string;
  description: string;
  date?: Date | null;
  location?: string | null;
  region?: string | null;
  budget: number;
  isPublic: boolean;
  category?: string | null;
};

export type UpdatePlanInput = Partial<CreatePlanInput>;

export interface RecommendedPlan {
  id: string;
  title: string;
  description: string;
  location: string | null;
  region: string | null;
  budget: number;
  imageUrl: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRecommendedPlanInput = Pick<
  RecommendedPlan,
  'title' | 'description' | 'location' | 'region' | 'budget' | 'imageUrl' | 'category'
>;

export type UpdateRecommendedPlanInput = Partial<CreateRecommendedPlanInput>;
