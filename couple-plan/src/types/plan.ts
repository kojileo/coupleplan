export type Plan = {
  id: string;
  title: string;
  description?: string | null;
  date?: string | Date | null;
  budget: number;
  location?: string | null;
  region?: string | null;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    name: string;
  } | null;
  likes: {
    id: string;
    userId: string;
  }[];
  _count?: {
    likes: number;
  };
};

export type CreatePlanInput = Pick<
  Plan,
  'title' | 'description' | 'date' | 'budget' | 'location' | 'region'
>;

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
