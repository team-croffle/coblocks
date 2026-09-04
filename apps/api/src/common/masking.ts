/**
 * 개인정보 마스킹 유틸.
 * 규칙을 여기 한 곳에만 두고, 사용자 데이터를 밖으로 내보내는 모든 경로가 이 함수를 거치게 한다.
 */

/** 홍길동 → 홍O동, 김수 → 김O, Alex → A**x */
export function maskName(name: string): string {
  const chars = [...name.trim()];
  if (chars.length <= 1) return name;
  if (chars.length === 2) return `${chars[0]}O`;
  return `${chars[0]}${'O'.repeat(chars.length - 2)}${chars[chars.length - 1]}`;
}

/** kimsoo@school.kr → ki****@sc****.kr */
export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  const head = local.slice(0, 2) || '*';
  const [host = '', ...rest] = domain.split('.');
  const tld = rest.length ? `.${rest.join('.')}` : '';
  return `${head}****@${host.slice(0, 2)}****${tld}`;
}

/** 010-1234-5678 → 010-****-5678 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{2,3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3');
}

/** 원광초등학교 → O광초등학교 (학교명은 첫 글자만 가린다) */
export function maskSchool(school: string | null): string {
  if (!school) return '—';
  const chars = [...school];
  if (chars.length <= 1) return school;
  return `O${chars.slice(1).join('')}`;
}
