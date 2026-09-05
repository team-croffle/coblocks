import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { MaskedUser, Paginated } from '@coblocks/shared';

import { fetchUsers, requestUnmask } from '@/api/admin';

const EMPTY: Paginated<MaskedUser> = { items: [], total: 0, page: 1, pageSize: 20 };

const STATE = {
  active: { label: '정상', cssVar: '--color-ok' },
  dormant: { label: '휴면', cssVar: '--color-muted' },
  suspended: { label: '정지', cssVar: '--color-bad' },
} as const;
const ROLE = { student: '학생', teacher: '교사', admin: '관리자' } as const;

export function UsersPage() {
  const [q, setQ] = useState('');
  const [notice, setNotice] = useState('');

  const { data, refetch } = useQuery({
    queryKey: ['admin', 'users', q],
    queryFn: () => fetchUsers({ q }),
    initialData: EMPTY,
    enabled: false,
  });

  async function onUnmask(user: MaskedUser) {
    const reason = window.prompt(`${user.memberNo}의 개인정보 열람 사유를 입력하세요.`);
    if (!reason) return;
    try {
      await requestUnmask(user.id, reason);
      setNotice(
        `${user.memberNo} 열람 요청을 기록했습니다. 책임자 승인 후에만 마스킹이 해제됩니다.`,
      );
    } catch {
      setNotice('API 연결 전입니다. 요청은 감사 로그에 남는 설계입니다.');
    }
  }

  return (
    <section>
      <h3 className='text-[21px]'>유저 관리</h3>
      <p className='mb-4 text-sm text-muted'>
        이름·이메일은 서버가 마스킹한 값만 내려옵니다. 원본 열람은 사유 입력과 승인이 필요합니다.
      </p>

      <input
        type='search'
        className='field-input mb-4 max-w-[420px]'
        placeholder='회원번호, 학교로 검색 (Enter)'
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void refetch();
        }}
      />

      <div className='overflow-x-auto rounded-card border border-line'>
        <table className='w-full min-w-[760px] text-[13.5px]'>
          <thead>
            <tr className='bg-surface text-muted'>
              <th className='th'>회원번호</th>
              <th className='th'>이름</th>
              <th className='th'>이메일</th>
              <th className='th'>구분</th>
              <th className='th'>학교</th>
              <th className='th'>최근 접속</th>
              <th className='th'>상태</th>
              <th className='th' aria-label='관리' />
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className='border-t border-line'>
                <td className='td mono'>{u.memberNo}</td>
                <td className='td'>{u.maskedName}</td>
                <td className='td mono'>{u.maskedEmail}</td>
                <td className='td'>{ROLE[u.role]}</td>
                <td className='td'>{u.schoolLabel}</td>
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
                    onClick={() => onUnmask(u)}
                  >
                    원본 열람 요청
                  </button>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td className='td text-muted' colSpan={8}>
                  표시할 사용자가 없습니다. (API 연결 전)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {notice && (
        <p className='mt-3.5 rounded-[10px] border border-dashed border-line-strong bg-surface p-3 text-[13.5px] text-ink-soft'>
          {notice}
        </p>
      )}
    </section>
  );
}
