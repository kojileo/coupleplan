export type Location = {
  id: string;
  url: string;
  name: string | null;
  planId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface Plan {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string | null;
  region: string;
  budget: number;
  isPublic: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
  locations: {
    url: string;
    name: string | null;
  }[];
  likes?: {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    planId: string;
  }[];
  profile?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export type ExtendedPlan = Plan & {
  profile?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  likes?: {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    planId: string;
  }[];
  _count?: {
    likes: number;
  };
  isRecommended?: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export type CreateRecommendedPlanInput = Pick<
  RecommendedPlan,
  'title' | 'description' | 'locations' | 'region' | 'budget' | 'imageUrl' | 'category'
>;

export type UpdateRecommendedPlanInput = Partial<CreateRecommendedPlanInput>;
