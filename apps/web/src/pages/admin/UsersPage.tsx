import { useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import type { FormEvent } from 'react';

import type { MaskedUser, Paginated } from '@coblocks/shared';

import { fetchUsers, requestUnmask } from '@/api/admin';

const EMPTY: Paginated<MaskedUser> = { items: [], total: 0, page: 1, pageSize: 20 };

const STATE = {
  active: { label: '정상', cssVar: '--color-ok' },
  dormant: { label: '휴면', cssVar: '--color-muted' },
  suspended: { label: '정지', cssVar: '--color-bad' },
} as const;
const ROLE = { student: '학생', teacher: '교사', admin: '관리자' } as const;
const ACCOUNT_TYPE = { personal: '일반', edu: '교육' } as const;

export function UsersPage() {
  const [q, setQ] = useState('');
  const [notice, setNotice] = useState('');
  
  /** 열람 사유를 입력받는 중인 사용자. null 이면 폼이 닫혀 있다. */
  const [unmaskTarget, setUnmaskTarget] = useState<MaskedUser | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['admin', 'users', q],
    queryFn: () => fetchUsers({ q }),
    initialData: EMPTY,
    enabled: false,
  });

  function openUnmaskForm(user: MaskedUser) {
    setUnmaskTarget(user);
    setReason('');
    setNotice('');
  }

  function closeUnmaskForm() {
    setUnmaskTarget(null);
    setReason('');
  }

  async function onUnmask(user: MaskedUser) {
    const reason = window.prompt(`${user.maskedNickname}의 식별 정보 열람 사유를 입력하세요.`);
    if (!reason) return;
    try {
      await requestUnmask(user.id, reason);
      setNotice(`${user.maskedNickname} 열람 요청을 기록했습니다. 책임자 승인 후에만 마스킹이 해제됩니다.`);
    } catch {
      setNotice('API 연결 전입니다. 요청은 감사 로그에 남는 설계입니다.');
    } finally {
      setSubmitting(false);
      closeUnmaskForm();
    }
  }

  return (
    <section>
      <h3 className="text-[21px]">유저 관리</h3>
      <p className="mb-4 text-sm text-muted">
        실명·이메일은 저장하지 않습니다. 닉네임과 학번만 있고, 그마저도 서버가 마스킹한 값만
        내려옵니다. 원본 열람은 사유 입력과 승인이 필요합니다.
      </p>

      <input
        type="search"
        className="field-input mb-4 max-w-[420px]"
        placeholder="닉네임, 학번으로 검색 (Enter)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void refetch();
        }}
      />

      <div className='overflow-x-auto rounded-card border border-line'>
        <table className='w-full min-w-[760px] text-[13.5px]'>
          <thead>
            <tr className="bg-surface text-muted">
              <th className="th">닉네임</th>
              <th className="th">계정</th>
              <th className="th">학번</th>
              <th className="th">구분</th>
              <th className="th">최근 접속</th>
              <th className="th">상태</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="td">{u.maskedNickname}</td>
                <td className="td">{ACCOUNT_TYPE[u.accountType]}</td>
                <td className="td mono">{u.maskedStudentNo ?? '—'}</td>
                <td className="td">{ROLE[u.role]}</td>
                <td className="td mono">{u.lastSeenAt ?? '—'}</td>
                <td className="td">
                  <span
                    className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    style={{ borderColor: `var(${STATE[u.state].cssVar})`, color: `var(${STATE[u.state].cssVar})` }}
                  >
                    {STATE[u.state].label}
                  </span>
                </td>
                <td className="td">
                  <button
                    type="button"
                    className="rounded-md bg-surface-2 px-2.5 py-1 text-[12.5px] text-ink-soft"
                    onClick={() => onUnmask(u)}
                  >
                    원본 열람 요청
                  </button>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td className="td text-muted" colSpan={7}>
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
