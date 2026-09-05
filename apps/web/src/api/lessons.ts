import type {
  AttemptResult,
  BlockProgram,
  Lesson,
  LessonProgress,
  LessonQuery,
  LessonSummary,
  Paginated,
} from '@coblocks/shared';

import { http } from './client';

export const fetchLessons = async (query: LessonQuery = {}) =>
  (
    await http.get<Paginated<LessonSummary>>('/lessons', {
      params: {
        ...query,
        bands: query.bands?.join(','),
        concepts: query.concepts?.join(','),
        levels: query.levels?.join(','),
      },
    })
  ).data;

export const fetchLesson = async (slug: string) =>
  (await http.get<Lesson>(`/lessons/${slug}`)).data;

export const fetchMyProgress = async () => (await http.get<LessonProgress[]>('/progress/me')).data;

/** 서버가 shared 인터프리터로 다시 채점한다 — 클라이언트 결과는 미리보기일 뿐이다. */
export const submitAttempt = async (lessonId: string, program: BlockProgram) =>
  (await http.post<AttemptResult>(`/progress/${lessonId}/attempt`, { program })).data;
