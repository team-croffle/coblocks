import type {
  BlockProgram,
  Lesson,
  LessonProgress,
  LessonQuery,
  LessonSummary,
  Paginated,
  RunResult,
} from '@coblocks/shared';
import { http } from './client';

export const fetchLessons = (query: LessonQuery = {}) =>
  http
    .get<Paginated<LessonSummary>>('/lessons', {
      params: {
        ...query,
        bands: query.bands?.join(','),
        concepts: query.concepts?.join(','),
        levels: query.levels?.join(','),
      },
    })
    .then((r) => r.data);

export const fetchLesson = (slug: string) => http.get<Lesson>(`/lessons/${slug}`).then((r) => r.data);

export const fetchMyProgress = () => http.get<LessonProgress[]>('/progress/me').then((r) => r.data);

/** 서버가 shared 인터프리터로 다시 채점한다 — 클라이언트 결과는 미리보기일 뿐이다. */
export const submitAttempt = (lessonId: string, program: BlockProgram) =>
  http.post<RunResult>(`/progress/${lessonId}/attempt`, { program }).then((r) => r.data);
