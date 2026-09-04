import type { UserRole } from './auth';

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

/** 목록 API가 돌려주는 형태 — 개인정보는 서버에서 이미 마스킹된 값이다. */
export interface MaskedUser {
  id: string;
  memberNo: string;
  /** 예: 김O수 */
  maskedName: string;
  /** 예: ki****@sc****.kr */
  maskedEmail: string;
  role: UserRole;
  schoolLabel: string;
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
