interface Props {
  pending: boolean;
  error: boolean;
  onRetry: () => void;
  /** 무엇을 불러오는 중인지 — "미션 목록" 처럼 적는다. */
  label: string;
}

/**
 * 화면이 데이터를 기다리거나 실패했을 때 보여 주는 자리.
 *
 * 예전에는 페이지마다 시드 데이터를 깔아 두어 API 가 죽어도 그럴듯한 화면이 나왔다.
 * 그러면 무엇이 진짜인지 아무도 모른다. 이제 못 불러오면 못 불러왔다고 말한다.
 */
export function LoadState({ pending, error, onRetry, label }: Props) {
  if (!pending && !error) return null;

  return (
    <div className='grid min-h-[160px] place-items-center rounded-card border border-dashed border-line-strong bg-surface p-6 text-center'>
      {pending ? (
        <p className='text-[13.5px] text-muted'>{label}을(를) 불러오는 중…</p>
      ) : (
        <div>
          <p className='text-[13.5px] text-bad'>{label}을(를) 불러오지 못했습니다.</p>
          <button type='button' className='btn btn-ghost mt-2.5' onClick={onRetry}>
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
