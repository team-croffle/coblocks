import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { validateNickname, validatePassword } from '@coblocks/shared';

import { BrandMark } from '@/components/BrandMark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/stores/auth';

/**
 * 일반 계정 가입.
 * 실명·이메일·생년월일을 묻지 않는다 — 아동의 개인정보를 아예 받지 않기 위한 설계다.
 * 그래서 비밀번호를 잊었을 때 쓸 수 있는 것은 복구 코드뿐이고, 가입 직후 한 번만 보여준다.
 */
export function SignupPage() {
  const signup = useAuthStore((s) => s.signup);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const reason = validateNickname(nickname) ?? validatePassword(password);
    if (reason) return setError(reason);

    setError('');
    try {
      const res = await signup(nickname.trim(), password);
      setCodes(res.recoveryCodes);
    } catch {
      setError('가입하지 못했어요. 이미 쓰고 있는 닉네임일 수 있습니다.');
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
        {codes ? (
          <div className='w-full max-w-[460px] rounded-[18px] border border-line bg-paper p-8 shadow-card'>
            <h2 className='mb-1.5 text-2xl'>복구 코드를 적어 두세요</h2>
            <p className='mb-4 text-sm text-muted'>
              비밀번호를 잊었을 때 <strong>로그인 화면 → “복구 코드로 다시 정하기”</strong>에서 쓰는
              코드입니다. <strong>이 화면을 닫으면 다시 볼 수 없어요.</strong> 종이에 적거나
              사진으로 남겨 두세요. 한 코드는 한 번만 쓸 수 있습니다.
            </p>

            <ul className='mb-4 grid grid-cols-2 gap-2 rounded-[10px] border border-dashed border-line-strong bg-surface p-3'>
              {codes.map((code) => (
                <li key={code} className='mono text-center text-[15px]'>
                  {code}
                </li>
              ))}
            </ul>

            <label className='mb-4 flex items-start gap-2 text-[13.5px] text-ink-soft'>
              <input type='checkbox' checked={saved} onChange={(e) => setSaved(e.target.checked)} />
              <span>복구 코드를 안전한 곳에 적어 두었습니다.</span>
            </label>

            <button
              type='button'
              className='btn btn-primary w-full'
              disabled={!saved}
              onClick={() => void navigate({ to: '/app/dashboard' })}
            >
              시작하기
            </button>
          </div>
        ) : (
          <form
            className='w-full max-w-[400px] rounded-[18px] border border-line bg-paper p-8 shadow-card'
            onSubmit={onSubmit}
          >
            <h2 className='mb-1.5 text-2xl'>닉네임으로 시작하기</h2>
            <p className='mb-5 text-sm text-muted'>
              이름과 이메일은 묻지 않아요. 닉네임과 비밀번호만 있으면 됩니다.
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
              <p className='mt-1.5 text-[12.5px] text-muted'>
                2~16자, 한글·영문·숫자와 _ - 만 쓸 수 있어요. 실제 이름이나 학교 이름은 쓰지 마세요.
              </p>
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
                autoComplete='new-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className='mt-1.5 text-[12.5px] text-muted'>8자 이상으로 만들어 주세요.</p>
            </div>

            {error && <p className='mb-3 text-[13.5px] text-bad'>{error}</p>}

            <button type='submit' className='btn btn-primary w-full' disabled={loading}>
              {loading ? '만드는 중…' : '계정 만들기'}
            </button>

            <p className='mt-4 text-[13.5px] text-muted'>
              이미 계정이 있나요?{' '}
              <Link to='/login' className='underline underline-offset-4'>
                로그인
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
