import { useQuery } from '@tanstack/react-query';
import type { SystemOverview } from '@coblocks/shared';
import { fetchOverview } from '@/api/admin';

const FALLBACK: SystemOverview = {
  onlineNow: 0,
  loginsToday: 0,
  loginFailuresToday: 0,
  programRunsToday: 0,
  hourlyOnline: Array.from({ length: 24 }, () => 0),
  services: [],
};

const STATUS = {
  ok: { label: '정상', cssVar: '--color-ok' },
  warn: { label: '주의', cssVar: '--color-warn' },
  down: { label: '중단', cssVar: '--color-bad' },
} as const;

export function OverviewPage() {
  const { data } = useQuery({ queryKey: ['admin', 'overview'], queryFn: fetchOverview, initialData: FALLBACK });

  const peak = Math.max(1, ...data.hourlyOnline);
  const peakHour = data.hourlyOnline.indexOf(Math.max(...data.hourlyOnline));

  return (
    <section>
      <h3 className="text-[21px]">시스템 개요</h3>
      <p className="mb-5 text-sm text-muted">5분마다 갱신되는 운영 지표입니다.</p>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="text-[12.5px] text-muted">현재 접속자</div>
          <div className="font-display text-[34px] leading-tight tabular-nums">
            {data.onlineNow}
            <small className="ml-1 font-sans text-sm text-muted">명</small>
          </div>
        </div>
        <div className="card">
          <div className="text-[12.5px] text-muted">오늘 로그인</div>
          <div className="font-display text-[34px] leading-tight tabular-nums">
            {data.loginsToday.toLocaleString()}
          </div>
          <div className="text-[12.5px] text-muted">실패 {data.loginFailuresToday}회</div>
        </div>
        <div className="card">
          <div className="text-[12.5px] text-muted">실행된 프로그램</div>
          <div className="font-display text-[34px] leading-tight tabular-nums">
            {data.programRunsToday.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <h4 className="font-display text-[17px]">시간대별 접속자</h4>
          <p className="mb-3 text-[13px] text-muted">오늘 00시~현재, 동시 접속자 수</p>
          <div className="flex h-24 items-end gap-[3px]">
            {data.hourlyOnline.map((v, h) => (
              <div
                key={h}
                className="flex-1 rounded-t"
                style={{
                  height: `${Math.max(3, (v / peak) * 96)}px`,
                  background: h === peakHour ? 'var(--color-algo)' : 'var(--color-data)',
                }}
                title={`${String(h).padStart(2, '0')}시 · ${v}명`}
              />
            ))}
          </div>
          <div className="mono mt-1.5 flex justify-between text-muted">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
          <p className="mt-2.5 text-[13px] text-muted">
            최고 {peak}명 · {String(peakHour).padStart(2, '0')}시
          </p>
        </div>

        <div className="panel p-5">
          <h4 className="font-display text-[17px]">서비스 상태</h4>
          <p className="mb-3 text-[13px] text-muted">최근 30분 관측치</p>
          {data.services.map((s) => (
            <div key={s.name} className="flex items-center gap-3 border-b border-dashed border-line py-2.5 text-sm last:border-0">
              <span
                className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                style={{ borderColor: `var(${STATUS[s.status].cssVar})`, color: `var(${STATUS[s.status].cssVar})` }}
              >
                {STATUS[s.status].label}
              </span>
              <span>{s.name}</span>
              <span className="mono ml-auto text-muted">{s.note}</span>
            </div>
          ))}
          {data.services.length === 0 && <p className="text-sm text-muted">API 연결 전입니다.</p>}
        </div>
      </div>
    </section>
  );
}
