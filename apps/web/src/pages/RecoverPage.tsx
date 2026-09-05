import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { validatePassword } from '@coblocks/shared';

import { recover } from '@/api/auth';
import { BrandMark } from '@/components/BrandMark';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * 복구 코드로 비밀번호를 다시 정한다.
 * 이메일을 받지 않으므로 가입할 때 받아 적어 둔 복구 코드가 유일한 통로다.
 */
export function RecoverPage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const reason = validatePassword(newPassword);
    if (reason) return setError(reason);

    setError('');
    setSubmitting(true);
    try {
      await recover({ nickname: nickname.trim(), code: code.trim(), newPassword });
      setDone(true);
    } catch {
      setError('닉네임 또는 복구 코드를 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <nav className='border-b border-line bg-paper'>
        <div className='mx-auto flex max-w-[1180px] items-center px-6 py-3'>
          <span className='flex items-center gap-2.5 font-display text-[19px]'>
            <BrandMark />
            Coblocks
          </span>
          <span className='flex-1' />
          <ThemeToggle />
        </div>
      </nav>

      <div className='flex min-h-[calc(100vh-60px)] items-center justify-center bg-surface p-6'>
        {done ? (
          <div className='w-full max-w-[400px] rounded-[18px] border border-line bg-paper p-8 shadow-card'>
            <h2 className='mb-1.5 text-2xl'>비밀번호를 바꿨어요</h2>
            <p className='mb-5 text-sm text-muted'>
              방금 쓴 복구 코드는 이제 쓸 수 없습니다. 남은 코드는 그대로 두고, 새 비밀번호로
              로그인해 보세요.
            </p>
            <button
              type='button'
              className='btn btn-primary w-full'
              onClick={() => void navigate({ to: '/login' })}
            >
              로그인하러 가기
            </button>
          </div>
        ) : (
          <form
            className='w-full max-w-[400px] rounded-[18px] border border-line bg-paper p-8 shadow-card'
            onSubmit={onSubmit}
          >
            <h2 className='mb-1.5 text-2xl'>복구 코드로 다시 시작하기</h2>
            <p className='mb-5 text-sm text-muted'>
              가입할 때 적어 둔 복구 코드 하나가 필요합니다. 한 번 쓴 코드는 다시 쓸 수 없어요.
            </p>

            <div className='mb-3.5'>
              <label
                htmlFor='nickname'
                className='mb-1.5 block text-[13px] font-semibold text-ink-soft'
              >
                닉네임
              </label>
              <input
                id='nickname'
                className='field-input'
                autoComplete='username'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>

            <div className='mb-3.5'>
              <label
                htmlFor='code'
                className='mb-1.5 block text-[13px] font-semibold text-ink-soft'
              >
                복구 코드
              </label>
              <input
                id='code'
                className='field-input mono'
                placeholder='XXXX-XXXX'
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className='mb-4'>
              <label
                htmlFor='newPassword'
                className='mb-1.5 block text-[13px] font-semibold text-ink-soft'
              >
                새 비밀번호
              </label>
              <input
                id='newPassword'
                type='password'
                className='field-input'
                autoComplete='new-password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className='mt-1.5 text-[12.5px] text-muted'>8자 이상으로 만들어 주세요.</p>
            </div>

            {error && <p className='mb-3 text-[13.5px] text-bad'>{error}</p>}

            <button type='submit' className='btn btn-primary w-full' disabled={submitting}>
              {submitting ? '확인 중…' : '비밀번호 바꾸기'}
            </button>

            <p className='mt-4 text-[13.5px] text-muted'>
              복구 코드를 잃어버렸다면 계정을 되찾을 수 없습니다. 학교 계정이라면 선생님께
              문의하세요.
            </p>

            <Link
              to='/login'
              className='mt-3 inline-block text-[13.5px] text-muted underline underline-offset-4'
            >
              ← 로그인으로 돌아가기
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
