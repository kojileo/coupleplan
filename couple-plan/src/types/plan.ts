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
  }
  
  export interface CreatePlanInput {
    title: string
    description: string
    date: Date | null
    budget: number
    location: string
  }