import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RecoverRequest,
  SignupRequest,
  SignupResponse,
} from '@coblocks/shared';

import { http } from './client';

export const login = async (body: LoginRequest) =>
  (await http.post<LoginResponse>('/auth/login', body)).data;

export const signup = async (body: SignupRequest) =>
  (await http.post<SignupResponse>('/auth/signup', body)).data;

export const recover = async (body: RecoverRequest) =>
  (await http.post<{ ok: true }>('/auth/recover', body)).data;

export const me = async () => (await http.get<AuthUser>('/auth/me')).data;

export const logout = async () => {
  await http.post('/auth/logout');
};
