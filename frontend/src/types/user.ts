export type UserRole = 'SUPER_ADMIN' | 'MALPOT_OFFICER' | 'CITIZEN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  citizenshipNumber: string | null;
  role: UserRole;
  district: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  citizenshipNumber: string;
}
