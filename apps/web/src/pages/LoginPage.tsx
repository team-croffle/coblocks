import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/stores/auth';

export function LoginPage() {
  // 라우트 객체를 import 하면 router.tsx 와 순환이 생긴다. 라우트 ID 로 읽는다.
  const { redirect } = useSearch({ from: '/login' });
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(loginId.trim(), password);
      if (redirect) void navigate({ to: redirect });
      else if (user.role === 'admin') void navigate({ to: '/admin/overview' });
      else void navigate({ to: '/app/dashboard' });
    } catch {
      setError('아이디 또는 비밀번호를 확인해 주세요.');
    }
  }

  return (
    <div>
      <nav className='border-b border-line bg-paper'>
        <div className='mx-auto flex max-w-[1180px] items-center px-6 py-3'>
          <span className='flex items-center gap-2.5 font-display text-[19px]'>
            <span className='h-6 w-6 rounded-lg bg-seq' aria-hidden='true' />
            Coblocks
          </span>
          <span className='flex-1' />
          <ThemeToggle />
        </div>
      </nav>

      <div className='flex min-h-[calc(100vh-60px)] items-center justify-center bg-surface p-6'>
        <form
          className='w-full max-w-[400px] rounded-[18px] border border-line bg-paper p-8 shadow-card'
          onSubmit={onSubmit}
        >
          <h2 className='mb-1.5 text-2xl'>다시 만나서 반가워요</h2>
          <p className='mb-5 text-sm text-muted'>로그인하면 마지막으로 하던 미션부터 이어집니다.</p>

          <div className='mb-3.5'>
            <label
              htmlFor='loginId'
              className='mb-1.5 block text-[13px] font-semibold text-ink-soft'
            >
              아이디
            </label>
            <input
              id='loginId'
              className='field-input'
              autoComplete='username'
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='password'
              className='mb-1.5 block text-[13px] font-semibold text-ink-soft'
            >
              비밀번호
            </label>
            <input
              id='password'
              type='password'
              className='field-input'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className='mb-3 text-[13.5px] text-bad'>{error}</p>}

          <button type='submit' className='btn btn-primary w-full' disabled={loading}>
            {loading ? '확인 중…' : '로그인'}
          </button>

          <p className='mt-4 rounded-[10px] border border-dashed border-line-strong bg-surface p-3 text-[12.5px] text-muted'>
            개발 시드 계정: <code className='mono'>student1 / student1</code>,{' '}
            <code className='mono'>teacher1 / teacher1</code>,{' '}
            <code className='mono'>admin / admin</code>
          </p>

          <Link
            to='/'
            className='mt-4 inline-block text-[13.5px] text-muted underline underline-offset-4'
          >
            ← 소개 페이지로 돌아가기
          </Link>
        </form>
      </div>
    </div>
  );
}
