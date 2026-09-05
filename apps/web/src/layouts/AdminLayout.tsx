import { Link, Outlet, useNavigate } from '@tanstack/react-router';

import { BrandMark } from '@/components/BrandMark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/stores/auth';

const MENU = [
  { to: '/admin/overview', label: '시스템 개요' },
  { to: '/admin/lessons/new', label: '문제 등록' },
  { to: '/admin/lessons', label: '문제 관리' },
  { to: '/admin/users', label: '유저 관리' },
  { to: '/admin/audit', label: '로깅 / 감사' },
  { to: '/admin/inquiries', label: '문의 관리' },
] as const;

const LINK =
  'block w-full rounded-[9px] px-2.5 py-2 text-left text-sm text-ink-soft hover:bg-surface';
const LINK_ACTIVE = 'bg-brand-soft text-brand font-semibold';

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    void navigate({ to: '/' });
  }

  return (
    <div>
      <header className='sticky top-0 z-40 border-b border-line bg-paper'>
        <div className='mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-6 py-2.5'>
          <Link
            to='/app/dashboard'
            className='flex items-center gap-2.5 font-display text-[19px]'
            aria-label='학습자 대시보드로'
          >
            <BrandMark />
            Coblocks
          </Link>
          <span className='rounded-md bg-algo px-2 py-0.5 text-[11.5px] font-semibold text-white'>
            ADMIN
          </span>
          <span className='flex-1' />
          <ThemeToggle />
          <Link
            to='/app/dashboard'
            className='text-[13.5px] text-muted underline underline-offset-4'
          >
            학습자 화면으로
          </Link>
          <button
            type='button'
            className='text-[13.5px] text-muted underline underline-offset-4'
            onClick={signOut}
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className='mx-auto grid max-w-[1180px] items-start gap-6 px-6 py-8 lg:grid-cols-[212px_1fr]'>
        <nav className='panel sticky top-[86px] p-2.5'>
          <div className='mono px-2.5 py-1.5 tracking-widest text-muted'>MENU</div>
          {MENU.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className={LINK}
              activeOptions={{ exact: true }}
              activeProps={{ className: `${LINK} ${LINK_ACTIVE}` }}
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
