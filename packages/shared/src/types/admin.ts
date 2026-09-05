import type { AccountType, UserRole } from './auth';

export type AuditCategory = 'access' | 'activity' | 'admin';
export type AuditOutcome = 'success' | 'failure' | 'pending';

export interface AuditLog {
  id: string;
  occurredAt: string;
  category: AuditCategory;
  /** 회원번호 또는 시스템 주체 */
  actor: string;
  action: string;
  target: string;
  ip: string;
  outcome: AuditOutcome;
}

export type AccountState = 'active' | 'dormant' | 'suspended';

/**
 * 목록 API가 돌려주는 형태.
 * 실명·이메일은 애초에 저장하지 않으므로 여기에도 없다. 닉네임과 학번만 있고,
 * 그나마도 마스킹된 값이 기본이다.
 */
export interface MaskedUser {
  id: string;
  /** 예: 코O이 */
  maskedNickname: string;
  accountType: AccountType;
  /** 교육 계정의 학번을 마스킹한 값. 일반 계정은 null. 예: **-**-07 */
  maskedStudentNo: string | null;
  role: UserRole;
  lastSeenAt: string | null;
  state: AccountState;
}

export type InquiryState = 'open' | 'in_progress' | 'answered' | 'held';

export interface Inquiry {
  id: string;
  code: string;
  title: string;
  body: string;
  authorMemberNo: string;
  createdAt: string;
  state: InquiryState;
  answer: string | null;
  answeredAt: string | null;
}

export interface SystemOverview {
  onlineNow: number;
  loginsToday: number;
  loginFailuresToday: number;
  programRunsToday: number;
  /** 0시부터 23시까지 24개 */
  hourlyOnline: number[];
  services: Array<{ name: string; status: 'ok' | 'warn' | 'down'; note: string }>;
}
