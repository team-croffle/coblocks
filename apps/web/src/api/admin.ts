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

export const fetchOverview = () => http.get<SystemOverview>('/admin/overview').then((r) => r.data);

export const fetchAuditLogs = (params: { q?: string; categories?: AuditCategory[]; page?: number }) =>
  http
    .get<Paginated<AuditLog>>('/admin/audit-logs', {
      params: { ...params, categories: params.categories?.join(',') },
    })
    .then((r) => r.data);

export const fetchUsers = (params: { q?: string; page?: number } = {}) =>
  http.get<Paginated<MaskedUser>>('/admin/users', { params }).then((r) => r.data);

/** 마스킹 해제는 사유와 승인이 필요하다. 여기서는 요청만 남긴다. */
export const requestUnmask = (userId: string, reason: string) =>
  http.post(`/admin/users/${userId}/unmask-requests`, { reason }).then((r) => r.data);

export const fetchInquiries = () => http.get<Inquiry[]>('/admin/inquiries').then((r) => r.data);

export const answerInquiry = (id: string, answer: string) =>
  http.post<Inquiry>(`/admin/inquiries/${id}/answer`, { answer }).then((r) => r.data);

export const holdInquiry = (id: string) =>
  http.post<Inquiry>(`/admin/inquiries/${id}/hold`).then((r) => r.data);

export const fetchAdminLessons = () => http.get<Paginated<Lesson>>('/admin/lessons').then((r) => r.data);

export const createLesson = (body: Partial<Lesson>) =>
  http.post<Lesson>('/admin/lessons', body).then((r) => r.data);

export const updateLesson = (id: string, body: Partial<Lesson>) =>
  http.patch<Lesson>(`/admin/lessons/${id}`, body).then((r) => r.data);
