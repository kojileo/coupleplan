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
