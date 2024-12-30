export interface ShareInvitation {
    id: string
    planId: string
    email: string
    status: 'pending' | 'accepted' | 'rejected'
    createdAt: Date
    updatedAt: Date
  }
  
  export interface CreateShareInvitationInput {
    email: string
  }