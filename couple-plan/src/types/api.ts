import type { Profile } from './profile';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export type PlanRequest = {
  title: string;
  description: string;
  date?: Date | null;
  location?: string | null;
  budget: number;
  isPublic: boolean;
};

export type ApiResponse<T = void> = {
  data?: T;
  error?: string;
};

export type ShareInvitationRequest = {
  email: string;
};

export type ProfileUpdateRequest = {
  name: string;
  email: string;
};

export type ProfileResponse = ApiResponse<Profile>;
