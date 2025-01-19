export type Plan = {
  id: string
  title: string
  description?: string | null
  date?: string | Date | null
  budget: number
  location?: string | null
  isPublic: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  profile?: {
    name: string
  } | null
}

export type CreatePlanInput = Pick<Plan, 'title' | 'description' | 'date' | 'budget' | 'location'>

export type UpdatePlanInput = Partial<CreatePlanInput>
