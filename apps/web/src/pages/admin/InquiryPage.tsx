import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Inquiry } from '@coblocks/shared';
import { answerInquiry, fetchInquiries, holdInquiry } from '@/api/admin';

const STATE = {
  open: { label: '대기', cssVar: '--color-warn' },
  in_progress: { label: '처리중', cssVar: '--color-data' },
  answered: { label: '완료', cssVar: '--color-ok' },
  held: { label: '보류', cssVar: '--color-muted' },
} as const;

export function InquiryPage() {
  const { data, refetch } = useQuery({
    queryKey: ['admin', 'inquiries'],
    queryFn: fetchInquiries,
    initialData: [] as Inquiry[],
  });

  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState('');
  const [notice, setNotice] = useState('');

  function select(item: Inquiry) {
    setSelected(item);
    setReply(item.answer ?? '');
    setNotice('');
  }

  async function send() {
    if (!selected) return setNotice('먼저 왼쪽에서 문의를 선택해 주세요.');
    if (!reply.trim()) return setNotice('답변 내용을 입력해 주세요.');
    try {
      await answerInquiry(selected.id, reply.trim());
      setNotice(`${selected.code} 답변을 전송했습니다. 발송 내역은 감사 로그에 남습니다.`);
      void refetch();
    } catch {
      setNotice('API 연결 전입니다.');
    }
  }

  async function hold() {
    if (!selected) return setNotice('먼저 왼쪽에서 문의를 선택해 주세요.');
    try {
      await holdInquiry(selected.id);
      setNotice(`${selected.code}을 보류로 표시했습니다.`);
      void refetch();
    } catch {
      setNotice('API 연결 전입니다.');
    }
  }

  return (
    <section>
      <h3 className="text-[21px]">문의 관리</h3>
      <p className="mb-5 text-sm text-muted">문의를 고르면 오른쪽에서 답변을 작성합니다.</p>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          {data.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full flex-col gap-1.5 rounded-xl border p-3.5 text-left"
              style={{
                borderColor: selected?.id === item.id ? 'var(--color-brand)' : 'var(--color-line)',
                background: selected?.id === item.id ? 'var(--color-brand-soft)' : 'var(--color-paper)',
              }}
              onClick={() => select(item)}
            >
              <span className="text-[14.5px] font-semibold">{item.title}</span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span
                  className="rounded-full border px-2.5 py-0.5 font-semibold"
                  style={{
                    borderColor: `var(${STATE[item.state].cssVar})`,
                    color: `var(${STATE[item.state].cssVar})`,
                  }}
                >
                  {STATE[item.state].label}
                </span>
                {item.code} · {item.authorMemberNo} · {item.createdAt}
              </span>
            </button>
          ))}

          {data.length === 0 && <p className="text-sm text-muted">문의가 없습니다. (API 연결 전)</p>}
        </div>

        <div className="panel sticky top-[86px] p-5">
          <h4 className="font-display text-[17px]">{selected?.title ?? '문의를 선택해 주세요'}</h4>
          <div className="text-xs text-muted">
            {selected ? `${selected.code} · ${selected.authorMemberNo} · ${selected.createdAt}` : ''}
          </div>
          <div className="my-3 rounded-[10px] bg-surface p-3 text-sm text-ink-soft">
            {selected?.body ?? '왼쪽 목록에서 문의를 선택하면 내용이 여기에 표시됩니다.'}
          </div>

          <label htmlFor="reply" className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
            답변
          </label>
          <textarea
            id="reply"
            className="field-input min-h-[120px]"
            placeholder="답변 내용을 입력하세요."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />

          <div className="mt-3 flex flex-wrap gap-2.5">
            <button type="button" className="btn btn-primary" onClick={send}>
              답변 보내기
            </button>
            <button type="button" className="btn btn-ghost" onClick={hold}>
              보류로 표시
            </button>
          </div>

          {notice && (
            <p className="mt-3.5 rounded-[10px] border border-dashed border-line-strong bg-surface p-3 text-[13.5px] text-ink-soft">
              {notice}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
