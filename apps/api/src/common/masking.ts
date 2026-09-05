/**
 * 개인정보 마스킹 유틸.
 * 규칙을 여기 한 곳에만 두고, 사용자 데이터를 밖으로 내보내는 모든 경로가 이 함수를 거치게 한다.
 *
 * v0.1 부터 실명·이메일·학교명을 저장하지 않는다(GOALS 결정 15). 그래서 마스킹 대상은
 * 사용자가 고른 닉네임과 교사가 지정한 학번뿐이다.
 */

/** 홍길동 → 홍O동, 김수 → 김O, Alex → A**x */
export function maskName(name: string): string {
  const chars = [...name.trim()];
  if (chars.length <= 1) return name;
  if (chars.length === 2) return `${chars[0]}O`;
  return `${chars[0]}${'O'.repeat(chars.length - 2)}${chars.at(-1)}`;
}

/** 2-3-07 → **-**-07 (마지막 마디만 남긴다) */
export function maskStudentNo(studentNo: string | null): string | null {
  if (!studentNo) return null;
  const parts = studentNo.split('-');
  if (parts.length <= 1) return `**${studentNo.slice(-2)}`;
  const tail = parts[parts.length - 1] ?? '';
  return [...parts.slice(0, -1).map(() => '**'), tail].join('-');
}
