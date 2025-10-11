// Profile型は将来実装予定
export interface Profile {
  id: string;
  email: string;
  name: string;
}

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
  date?: string | null;
  locations: Array<{
    url: string;
    name?: string | null;
  }>;
  region?: string | null;
  budget: number;
  isPublic: boolean;
  category?: string | null;
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
