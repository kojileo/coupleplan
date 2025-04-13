import type { Profile, Like } from '@prisma/client';

export type Location = {
  id: string;
  url: string;
  name: string | null;
  planId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Plan = {
  id: string;
  title: string;
  description: string;
  date: Date | null;
  region: string | null;
  budget: number;
  isPublic: boolean;
  isRecommended: boolean;
  category: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  locations: Location[];
};

export type ExtendedPlan = Plan & {
  profile?: Profile | null;
  likes?: Like[];
  _count?: {
    likes: number;
  };
};

export type CreatePlanInput = {
  title: string;
  description: string;
  date?: Date | null;
  locations?: Array<{
    url: string;
    name?: string | null;
  }>;
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
  locations: Array<{
    id: string;
    url: string;
    name: string | null;
  }>;
  region: string | null;
  budget: number;
  imageUrl: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRecommendedPlanInput = Pick<
  RecommendedPlan,
  'title' | 'description' | 'locations' | 'region' | 'budget' | 'imageUrl' | 'category'
>;

export type UpdateRecommendedPlanInput = Partial<CreateRecommendedPlanInput>;
