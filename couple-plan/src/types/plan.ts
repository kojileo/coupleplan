export interface Plan {
    id: string
    title: string
    description: string | null
    date: Date | null
    budget: number
    location: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
    isPublic: boolean
  }
  
  export type CreatePlanInput = Pick<Plan, 'title' | 'description' | 'date' | 'budget' | 'location'>
  
  export type UpdatePlanInput = Partial<CreatePlanInput>