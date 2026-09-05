import { queryOptions } from '@tanstack/react-query';

import type { AuditCategory } from '@coblocks/shared';

import {
  fetchAdminLessons,
  fetchAuditLogs,
  fetchInquiries,
  fetchOverview,
  fetchUsers,
} from './admin';
import { fetchLesson, fetchLessons, fetchMyProgress } from './lessons';

/**
 * 쿼리 정의를 한곳에 모은다.
 * 라우터 loader 와 페이지가 같은 키·같은 함수를 써야 프리페치한 값이 그대로 화면에 붙는다.
 * 키를 두 군데에 적으면 프리페치는 도는데 화면은 다시 부르는, 알아채기 어려운 낭비가 생긴다.
 */
export const lessonsQuery = () =>
  queryOptions({ queryKey: ['lessons'], queryFn: () => fetchLessons({ pageSize: 200 }) });

export const lessonQuery = (slug: string) =>
  queryOptions({ queryKey: ['lesson', slug], queryFn: () => fetchLesson(slug) });

export const myProgressQuery = () =>
  queryOptions({ queryKey: ['progress', 'me'], queryFn: fetchMyProgress });

export const adminOverviewQuery = () =>
  queryOptions({ queryKey: ['admin', 'overview'], queryFn: fetchOverview });

export const adminLessonsQuery = () =>
  queryOptions({ queryKey: ['admin', 'lessons'], queryFn: fetchAdminLessons });

export const adminInquiriesQuery = () =>
  queryOptions({ queryKey: ['admin', 'inquiries'], queryFn: fetchInquiries });

export const adminUsersQuery = (q: string) =>
  queryOptions({ queryKey: ['admin', 'users', q], queryFn: () => fetchUsers({ q }) });

export const adminAuditQuery = (q: string, categories: AuditCategory[]) =>
  queryOptions({
    queryKey: ['admin', 'audit', q, categories.join(',')],
    queryFn: () => fetchAuditLogs({ q, categories }),
  });
