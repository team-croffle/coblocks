export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  id: string;
  loginId: string;
  displayName: string;
  role: UserRole;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const isAdmin = (u: AuthUser | null): boolean => u?.role === 'admin';
export const isStaff = (u: AuthUser | null): boolean =>
  u?.role === 'admin' || u?.role === 'teacher';
