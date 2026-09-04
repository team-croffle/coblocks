import type { AuthUser, LoginRequest, LoginResponse } from '@coblocks/shared';
import { http } from './client';

export const login = (body: LoginRequest) =>
  http.post<LoginResponse>('/auth/login', body).then((r) => r.data);

export const me = () => http.get<AuthUser>('/auth/me').then((r) => r.data);

export const logout = () => http.post('/auth/logout').then(() => undefined);
