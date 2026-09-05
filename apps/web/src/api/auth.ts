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

export const signup = (body: SignupRequest) =>
  http.post<SignupResponse>('/auth/signup', body).then((r) => r.data);

export const recover = (body: RecoverRequest) =>
  http.post<{ ok: true }>('/auth/recover', body).then((r) => r.data);

export const me = () => http.get<AuthUser>('/auth/me').then((r) => r.data);

export const logout = async () => {
  await http.post('/auth/logout');
};
