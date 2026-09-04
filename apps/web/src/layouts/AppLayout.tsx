import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

const TAB = 'rounded-[9px] px-3.5 py-2 text-[14.5px] font-semibold text-muted hover:bg-surface';
const TAB_ACTIVE = 'bg-brand-soft text-brand';

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    void navigate({ to: '/' });
  }

  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-6 py-2.5">
          <Link to="/app/dashboard" className="flex items-center gap-2.5 font-display text-[19px]">
            <span className="h-6 w-6 rounded-lg bg-seq" aria-hidden="true" />
            Coblocks
          </Link>

          <nav className="ml-3 flex gap-1">
            <Link to="/app/dashboard" className={TAB} activeProps={{ className: `${TAB} ${TAB_ACTIVE}` }}>
              대시보드
            </Link>
            <Link to="/app/curriculum" className={TAB} activeProps={{ className: `${TAB} ${TAB_ACTIVE}` }}>
              학습하기
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/overview" className={TAB} activeProps={{ className: `${TAB} ${TAB_ACTIVE}` }}>
                관리자
              </Link>
            )}
          </nav>

          <span className="flex-1" />
          <ThemeToggle />

          <span className="flex items-center gap-2 text-[13.5px] text-ink-soft">
            <span
              className="grid h-[30px] w-[30px] place-items-center rounded-[9px] font-display text-[15px] text-white"
              style={{ background: user?.role === 'admin' ? 'var(--color-algo)' : 'var(--color-loop)' }}
            >
              {user?.displayName.charAt(0) ?? '?'}
            </span>
            {user?.displayName}
          </span>

          <button type="button" className="text-[13.5px] text-muted underline underline-offset-4" onClick={signOut}>
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
