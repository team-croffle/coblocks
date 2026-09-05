import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import type { AuthUser } from '@coblocks/shared';

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
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuthStore } from '@/stores/auth';

export interface RouterContext {
  /** 가드에서 최신 상태를 읽어야 하므로 값이 아니라 함수를 넘긴다. */
  getUser: () => AuthUser | null;
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

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
});

/** 로그인이 필요한 영역. 서버 가드가 진짜 방어선이고 여기는 UX 용이다. */
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppLayout,
  beforeLoad: ({ context, location }) => {
    if (!context.getUser()) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'dashboard',
  component: DashboardPage,
});
const curriculumRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'curriculum',
  component: CurriculumPage,
});
const lessonRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'learn/$slug',
  component: LessonPlayerPage,
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
  beforeLoad: ({ context, location }) => {
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
});
const adminLessonsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'lessons',
  component: LessonManagePage,
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
});
const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'users',
  component: UsersPage,
});
const adminAuditRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'audit',
  component: AuditPage,
});
const adminInquiriesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'inquiries',
  component: InquiryPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  signupRoute,
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
  context: { getUser: () => useAuthStore.getState().user },
  defaultPreload: 'intent',
});

// 라우트 객체는 내보내지 않는다. 페이지가 다시 import 하면 순환이 생긴다.
// 페이지는 useParams({ from })/useSearch({ from }) 로 라우트 ID 를 써서 읽는다.

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
