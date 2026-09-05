import type { Page } from '@playwright/test';

import type { AuthUser, Lesson, LessonProgress, Paginated } from '@coblocks/shared';

export const USER: AuthUser = {
  id: 'u-e2e',
  nickname: '테스트봇',
  role: 'student',
  accountType: 'personal',
  studentNo: null,
  xp: 30,
};

export const LESSON: Lesson = {
  id: 'l-e2e',
  slug: 'e2e-first-steps',
  title: '네모를 그려라',
  description: '앞으로 가기와 방향 돌리기를 네 번 반복하면 네모가 됩니다.',
  band: 'e56',
  concept: 'loop',
  level: 2,
  periods: 2,
  standardCode: '[6실05-01]',
  blockLabels: ['앞으로 가기', '방향 돌리기', '반복하기'],
  stage: {
    col: 5,
    row: 5,
    start: { x: 0, y: 4, heading: 0 },
    goal: { x: 4, y: 0 },
    walls: [],
  },
  status: 'published',
  orderIndex: 1,
};

const LESSONS: Paginated<Lesson> = { items: [LESSON], total: 1, page: 1, pageSize: 200 };
const PROGRESS: LessonProgress[] = [];

const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

interface Options {
  /** 이 경로들은 500 을 돌려준다 — 에러 상태 UI 를 검증할 때 쓴다. */
  fail?: string[];
}

/**
 * `/api/**` 를 통째로 가로챈다.
 * 실제 서버 대신 계약만 세워 두므로, 여기서 통과했다고 백엔드가 맞다는 뜻은 아니다.
 * 이 뼈대가 지키는 것은 "화면이 서버 응답대로 움직이는가" 하나다.
 */
export async function mockApi(page: Page, options: Options = {}) {
  const failed = new Set(options.fail ?? []);

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^\/api/, '');

    if (failed.has(path)) return route.fulfill(json({ message: 'boom' }, 500));

    if (path === '/auth/signup') {
      return route.fulfill(
        json({ accessToken: 'e2e-token', user: USER, recoveryCodes: ['AAAA-1111', 'BBBB-2222'] }),
      );
    }
    if (path === '/auth/login')
      return route.fulfill(json({ accessToken: 'e2e-token', user: USER }));
    if (path === '/auth/me') return route.fulfill(json(USER));
    if (path === '/auth/logout') return route.fulfill(json({ ok: true }));

    if (path === '/lessons') return route.fulfill(json(LESSONS));
    if (path === `/lessons/${LESSON.slug}`) return route.fulfill(json(LESSON));
    if (path === '/progress/me') return route.fulfill(json(PROGRESS));
    if (path.endsWith('/attempt')) {
      return route.fulfill(
        json({
          outcome: 'success',
          steps: [],
          awardedXp: 20,
          totalXp: USER.xp + 20,
          level: 1,
        }),
      );
    }

    return route.fulfill(json({ message: 'not mocked' }, 404));
  });
}
