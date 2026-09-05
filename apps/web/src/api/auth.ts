import type { AuthUser, LoginRequest, LoginResponse } from '@coblocks/shared';

import { http } from './client';

export const login = async (body: LoginRequest) =>
  (await http.post<LoginResponse>('/auth/login', body)).data;

export const me = async () => (await http.get<AuthUser>('/auth/me')).data;

export const logout = async () => {
  await http.post('/auth/logout');
};
