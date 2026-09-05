import type {
  AuditCategory,
  AuditLog,
  Inquiry,
  Lesson,
  MaskedUser,
  Paginated,
  SystemOverview,
} from '@coblocks/shared';

import { http } from './client';

export const fetchOverview = async () => (await http.get<SystemOverview>('/admin/overview')).data;

export const fetchAuditLogs = async (params: {
  q?: string;
  categories?: AuditCategory[];
  page?: number;
}) =>
  (
    await http.get<Paginated<AuditLog>>('/admin/audit-logs', {
      params: { ...params, categories: params.categories?.join(',') },
    })
  ).data;

export const fetchUsers = async (params: { q?: string; page?: number } = {}) =>
  (await http.get<Paginated<MaskedUser>>('/admin/users', { params })).data;

/** 마스킹 해제는 사유와 승인이 필요하다. 여기서는 요청만 남긴다. */
export const requestUnmask = async (userId: string, reason: string) =>
  (await http.post(`/admin/users/${userId}/unmask-requests`, { reason })).data;

export const fetchInquiries = async () => (await http.get<Inquiry[]>('/admin/inquiries')).data;

export const answerInquiry = async (id: string, answer: string) =>
  (await http.post<Inquiry>(`/admin/inquiries/${id}/answer`, { answer })).data;

export const holdInquiry = async (id: string) =>
  (await http.post<Inquiry>(`/admin/inquiries/${id}/hold`)).data;

export const fetchAdminLessons = async () =>
  (await http.get<Paginated<Lesson>>('/admin/lessons')).data;

export const createLesson = async (body: Partial<Lesson>) =>
  (await http.post<Lesson>('/admin/lessons', body)).data;

export const updateLesson = async (id: string, body: Partial<Lesson>) =>
  (await http.patch<Lesson>(`/admin/lessons/${id}`, body)).data;
