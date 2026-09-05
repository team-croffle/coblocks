export type UserRole = 'student' | 'teacher' | 'admin';

/**
 * 일반 계정은 본인이 만들고 닉네임만 갖는다.
 * 교육 계정은 교사가 만들며 닉네임에 더해 교사가 지정한 학번을 갖는다(v0.5).
 */
export type AccountType = 'personal' | 'edu';

export interface AuthUser {
  id: string;
  /** 표시 이름이자 로그인 아이디. 실명은 저장하지 않는다. */
  nickname: string;
  role: UserRole;
  accountType: AccountType;
  /** 교육 계정에서 교사가 지정한 학번. 일반 계정은 null. */
  studentNo: string | null;
}

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SignupRequest {
  nickname: string;
  password: string;
}

export interface SignupResponse extends LoginResponse {
  /**
   * 복구 코드. 이메일을 받지 않으므로 비밀번호를 잊었을 때 쓸 수 있는 유일한 수단이다.
   * 서버는 해시만 보관하므로 이 응답 이후로는 다시 볼 수 없다.
   */
  recoveryCodes: string[];
}

export interface RecoverRequest {
  nickname: string;
  code: string;
  newPassword: string;
}

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 16;
export const PASSWORD_MIN = 8;

/** 한글·영문·숫자와 밑줄·하이픈만. 공백과 특수문자는 받지 않는다. */
const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9_-]+$/;

/**
 * 닉네임 규칙을 web 과 api 가 같은 함수로 검사한다.
 * 통과하면 null, 아니면 사용자에게 보여줄 이유를 돌려준다.
 */
export function validateNickname(nickname: string): string | null {
  const value = nickname.trim();
  if (value.length < NICKNAME_MIN) return `닉네임은 ${NICKNAME_MIN}자 이상이어야 합니다.`;
  if (value.length > NICKNAME_MAX) return `닉네임은 ${NICKNAME_MAX}자 이하여야 합니다.`;
  if (!NICKNAME_PATTERN.test(value)) {
    return '닉네임에는 한글·영문·숫자와 _ - 만 쓸 수 있습니다.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `비밀번호는 ${PASSWORD_MIN}자 이상이어야 합니다.`;
  return null;
}

export const isAdmin = (u: AuthUser | null): boolean => u?.role === 'admin';
export const isStaff = (u: AuthUser | null): boolean =>
  u?.role === 'admin' || u?.role === 'teacher';
