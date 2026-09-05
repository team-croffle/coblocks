import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';

import type { MaskedUser } from '@coblocks/shared';

import { fetchUsers, requestUnmask } from '@/api/admin';

const STATE = {
  active: { label: '정상', cssVar: '--color-ok' },
  dormant: { label: '휴면', cssVar: '--color-muted' },
  suspended: { label: '정지', cssVar: '--color-bad' },
} as const;
const ROLE = { student: '학생', teacher: '교사', admin: '관리자' } as const;
const ACCOUNT_TYPE = { personal: '일반', edu: '교육' } as const;

export function UsersPage() {
  /** 입력 중인 검색어와 실제로 조회에 쓰는 검색어를 나눈다 — 한 글자마다 요청하지 않기 위해. */
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');

  /** 열람 사유를 입력받는 중인 사용자. null 이면 폼이 닫혀 있다. */
  const [unmaskTarget, setUnmaskTarget] = useState<MaskedUser | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: () => fetchUsers({ q: query }),
  });

  const users = data?.items ?? [];

  function openUnmaskForm(user: MaskedUser) {
    setUnmaskTarget(user);
    setReason('');
    setNotice('');
  }

  function closeUnmaskForm() {
    setUnmaskTarget(null);
    setReason('');
  }

  async function onUnmaskSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!unmaskTarget || !reason.trim()) return;

    const target = unmaskTarget;
    setSubmitting(true);
    try {
      await requestUnmask(target.id, reason.trim());
      setNotice(
        `${target.maskedNickname} 열람 요청을 기록했습니다. 책임자 승인 후에만 마스킹이 해제됩니다.`,
      );
    } catch {
      setNotice('API 연결 전입니다. 요청은 감사 로그에 남는 설계입니다.');
    } finally {
      setSubmitting(false);
      closeUnmaskForm();
    }
  }

  return (
    <section>
      <h3 className='text-[21px]'>유저 관리</h3>
      <p className='mb-4 text-sm text-muted'>
        실명·이메일은 저장하지 않습니다. 닉네임과 학번만 있고, 그마저도 서버가 마스킹한 값만
        내려옵니다. 원본 열람은 사유 입력과 승인이 필요합니다.
      </p>

      <input
        type='search'
        className='field-input mb-4 max-w-[420px]'
        placeholder='닉네임, 학번으로 검색 (Enter)'
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setQuery(q.trim());
        }}
      />

      <div className='overflow-x-auto rounded-card border border-line'>
        <table className='w-full min-w-[760px] text-[13.5px]'>
          <thead>
            <tr className='bg-surface text-muted'>
              <th className='th'>닉네임</th>
              <th className='th'>계정</th>
              <th className='th'>학번</th>
              <th className='th'>구분</th>
              <th className='th'>최근 접속</th>
              <th className='th'>상태</th>
              <th className='th'>
                <span className='sr-only'>작업</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className='border-t border-line'>
                <td className='td'>{u.maskedNickname}</td>
                <td className='td'>{ACCOUNT_TYPE[u.accountType]}</td>
                <td className='td mono'>{u.maskedStudentNo ?? '—'}</td>
                <td className='td'>{ROLE[u.role]}</td>
                <td className='td mono'>{u.lastSeenAt ?? '—'}</td>
                <td className='td'>
                  <span
                    className='rounded-full border px-2.5 py-0.5 text-xs font-semibold'
                    style={{
                      borderColor: `var(${STATE[u.state].cssVar})`,
                      color: `var(${STATE[u.state].cssVar})`,
                    }}
                  >
                    {STATE[u.state].label}
                  </span>
                </td>
                <td className='td'>
                  <button
                    type='button'
                    className='rounded-md bg-surface-2 px-2.5 py-1 text-[12.5px] text-ink-soft'
                    onClick={() => openUnmaskForm(u)}
                  >
                    원본 열람 요청
                  </button>
                </td>
              </tr>
            ))}
            {isPending && (
              <tr>
                <td className='td text-muted' colSpan={7}>
                  불러오는 중…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className='td text-bad' colSpan={7}>
                  목록을 불러오지 못했습니다.{' '}
                  <button
                    type='button'
                    className='underline underline-offset-4'
                    onClick={() => void refetch()}
                  >
                    다시 시도
                  </button>
                </td>
              </tr>
            )}
            {!isPending && !isError && users.length === 0 && (
              <tr>
                <td className='td text-muted' colSpan={7}>
                  {query
                    ? `'${query}' 에 해당하는 사용자가 없습니다.`
                    : '표시할 사용자가 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {unmaskTarget && (
        <form
          className='mt-3.5 rounded-[10px] border border-line bg-surface p-3.5'
          onSubmit={onUnmaskSubmit}
        >
          <label
            htmlFor='unmask-reason'
            className='mb-1.5 block text-[13px] font-semibold text-ink-soft'
          >
            {unmaskTarget.maskedNickname} 의 식별 정보 열람 사유
          </label>
          <p className='mb-2 text-[12.5px] text-muted'>
            사유는 감사 로그에 그대로 남습니다. 승인 전까지 마스킹은 해제되지 않습니다.
          </p>
          <input
            id='unmask-reason'
            className='field-input mb-2.5'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <div className='flex gap-2'>
            <button
              type='submit'
              className='btn btn-primary'
              disabled={submitting || !reason.trim()}
            >
              {submitting ? '기록 중…' : '열람 요청'}
            </button>
            <button type='button' className='btn' onClick={closeUnmaskForm} disabled={submitting}>
              취소
            </button>
          </div>
        </form>
      )}

      {notice && (
        <p className='mt-3.5 rounded-[10px] border border-dashed border-line-strong bg-surface p-3 text-[13.5px] text-ink-soft'>
          {notice}
        </p>
      )}
    </section>
  );
}
