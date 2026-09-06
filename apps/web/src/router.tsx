import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import type { AuthUser } from '@coblocks/shared';

import {
  adminAuditQuery,
  adminInquiriesQuery,
  adminLessonsQuery,
  adminOverviewQuery,
  adminUsersQuery,
  lessonQuery,
  lessonsQuery,
  myProgressQuery,
} from '@/api/queries';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { AuditPage } from '@/pages/admin/AuditPage';
import { InquiryPage } from '@/pages/admin/InquiryPage';
import { LessonFormPage } from '@/pages/admin/LessonFormPage';
import { LessonManagePage } from '@/pages/admin/LessonManagePage';
import { OverviewPage } from '@/pages/admin/OverviewPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { CurriculumPage } from '@/pages/CurriculumPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LandingPage } from '@/pages/LandingPage';
import { LessonPlayerPage } from '@/pages/LessonPlayerPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RecoverPage } from '@/pages/RecoverPage';
import { queryClient } from '@/query';
import { authReady, useAuthStore } from '@/stores/auth';

import { SignupPage } from './pages/SignupPage';

export interface RouterContext {
  /** 가드에서 최신 상태를 읽어야 하므로 값이 아니라 함수를 넘긴다. */
  getUser: () => AuthUser | null;
  /** 세션 복원이 끝날 때까지 기다린다. 가드는 이걸 먼저 기다린 뒤 판단한다. */
  waitForAuth: () => Promise<void>;
  queryClient: QueryClient;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
});

const recoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recover',
  component: RecoverPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  /**
   * `redirect` 는 **선택** 속성이어야 한다.
   * `{ redirect: string | undefined }` 로 두면 값이 없어도 키는 있어야 하는 타입이 되어,
   * 라우터가 `/login` 으로 가는 모든 곳에 `search` 를 요구한다.
   */
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
});

/** 로그인이 필요한 영역. 서버 가드가 진짜 방어선이고 여기는 UX 용이다. */
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppLayout,
  // 새로고침 직후에는 아직 세션 복원이 안 끝나 `user` 가 null 이다.
  // 기다리지 않고 판단하면 로그인된 사용자가 매번 로그인 화면으로 튕긴다.
  beforeLoad: async ({ context, location }) => {
    await context.waitForAuth();
    if (!context.getUser()) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
});

/**
 * 아래 loader 들은 프리페치만 한다 — `prefetchQuery` 는 실패해도 던지지 않는다.
 * `ensureQueryData` 로 기다리면 API 가 죽었을 때 라우트 자체가 에러로 떨어져,
 * 페이지가 준비해 둔 재시도 UI 를 보여 줄 기회가 사라진다.
 * 공통 헬퍼로 묶지 않는 이유는 제네릭이다 — 옵션을 배열로 받으면 타입이 unknown 으로 뭉개진다.
 */
const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'dashboard',
  component: DashboardPage,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(lessonsQuery());
    void context.queryClient.prefetchQuery(myProgressQuery());
  },
});
const curriculumRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'curriculum',
  component: CurriculumPage,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(lessonsQuery());
    void context.queryClient.prefetchQuery(myProgressQuery());
  },
});
const lessonRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'learn/$slug',
  component: LessonPlayerPage,
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(lessonQuery(params.slug));
    void context.queryClient.prefetchQuery(myProgressQuery());
  },
});
const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/app/dashboard' });
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
  beforeLoad: async ({ context, location }) => {
    await context.waitForAuth();
    const user = context.getUser();
    if (!user) throw redirect({ to: '/login', search: { redirect: location.href } });
    if (user.role !== 'admin') throw redirect({ to: '/app/dashboard' });
  },
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/admin/overview' });
  },
});
const adminOverviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'overview',
  component: OverviewPage,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(adminOverviewQuery());
  },
});
const adminLessonsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'lessons',
  component: LessonManagePage,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(adminLessonsQuery());
  },
});
const adminLessonNewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'lessons/new',
  component: LessonFormPage,
});
const adminLessonEditRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'lessons/$id/edit',
  component: LessonFormPage,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(adminLessonsQuery());
  },
});
const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'users',
  component: UsersPage,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(adminUsersQuery(''));
  },
});
const adminAuditRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'audit',
  component: AuditPage,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(adminAuditQuery('', []));
  },
});
const adminInquiriesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'inquiries',
  component: InquiryPage,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(adminInquiriesQuery());
  },
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  signupRoute,
  recoverRoute,
  appRoute.addChildren([appIndexRoute, dashboardRoute, curriculumRoute, lessonRoute]),
  adminRoute.addChildren([
    adminIndexRoute,
    adminOverviewRoute,
    adminLessonNewRoute,
    adminLessonEditRoute,
    adminLessonsRoute,
    adminUsersRoute,
    adminAuditRoute,
    adminInquiriesRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  context: { getUser: () => useAuthStore.getState().user, waitForAuth: authReady, queryClient },
  defaultPreload: 'intent',
});

// 라우트 객체는 내보내지 않는다. 페이지가 다시 import 하면 순환이 생긴다.
// 페이지는 useParams({ from })/useSearch({ from }) 로 라우트 ID 를 써서 읽는다.

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
