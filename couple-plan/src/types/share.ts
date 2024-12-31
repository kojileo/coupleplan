export type ShareInvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface ShareInvitation {
  id: string
  planId: string
  email: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: Date
  updatedAt: Date
  recipient?: {
    name: string
    email: string
  }
}

export type CreateShareInvitationInput = Pick<ShareInvitation, 'email'>