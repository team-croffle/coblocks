import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AuditCategory, AuditLog, Paginated } from '@coblocks/shared';
import { fetchAuditLogs } from '@/api/admin';

const EMPTY: Paginated<AuditLog> = { items: [], total: 0, page: 1, pageSize: 50 };

const CATEGORY = {
  access: { label: '접속', cssVar: '--color-muted' },
  activity: { label: '활동', cssVar: '--color-ok' },
  admin: { label: '관리', cssVar: '--color-data' },
} as const;
const OUTCOME = {
  success: { label: '성공', cssVar: '--color-ok' },
  failure: { label: '실패', cssVar: '--color-bad' },
  pending: { label: '대기', cssVar: '--color-warn' },
} as const;

export function AuditPage() {
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState<AuditCategory[]>([]);

  const { data, refetch } = useQuery({
    queryKey: ['admin', 'audit', q, categories.join(',')],
    queryFn: () => fetchAuditLogs({ q, categories }),
    initialData: EMPTY,
  });

  function toggle(c: AuditCategory) {
    setCategories((prev) => (prev.includes(c) ? prev.filter((v) => v !== c) : [...prev, c]));
  }

  return (
    <section>
      <h3 className="text-[21px]">로깅 / 감사</h3>
      <p className="mb-4 text-sm text-muted">
        접속·활동·관리자 행위를 한 곳에서 봅니다. 로그는 추가만 가능하며 수정·삭제할 수 없습니다.
      </p>

      <div className="mb-4 flex flex-col gap-3">
        <input
          type="search"
          className="field-input max-w-[420px]"
          placeholder="회원번호, 동작, IP로 검색 (Enter)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void refetch();
          }}
        />
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="mono w-16 tracking-widest text-muted">유형</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY) as AuditCategory[]).map((key) => (
              <button
                key={key}
                type="button"
                className="chip"
                aria-pressed={categories.includes(key)}
                onClick={() => toggle(key)}
              >
                {CATEGORY[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[820px] text-[13.5px]">
          <thead>
            <tr className="bg-surface text-muted">
              <th className="th">시각</th>
              <th className="th">유형</th>
              <th className="th">주체</th>
              <th className="th">동작</th>
              <th className="th">대상</th>
              <th className="th">IP</th>
              <th className="th">결과</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((log) => (
              <tr key={log.id} className="border-t border-line">
                <td className="td mono">{log.occurredAt}</td>
                <td className="td">
                  <span
                    className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      borderColor: `var(${CATEGORY[log.category].cssVar})`,
                      color: `var(${CATEGORY[log.category].cssVar})`,
                    }}
                  >
                    {CATEGORY[log.category].label}
                  </span>
                </td>
                <td className="td mono">{log.actor}</td>
                <td className="td whitespace-normal">{log.action}</td>
                <td className="td whitespace-normal">{log.target}</td>
                <td className="td mono">{log.ip}</td>
                <td className="td">
                  <span
                    className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      borderColor: `var(${OUTCOME[log.outcome].cssVar})`,
                      color: `var(${OUTCOME[log.outcome].cssVar})`,
                    }}
                  >
                    {OUTCOME[log.outcome].label}
                  </span>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td className="td text-muted" colSpan={7}>
                  표시할 로그가 없습니다. (API 연결 전)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2.5 text-[12.5px] text-muted">
        표시 {data.items.length}건 / 전체 {data.total}건 · 보관 기간 1년
      </p>
    </section>
  );
}
