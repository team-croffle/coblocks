import type { RunResult } from './blocks';
import type { LessonLevel } from './curriculum';

/**
 * XP 규칙 (GOALS 결정 17).
 * 난이도 × 10 — 입문 10 / 기본 20 / 심화 30. 계정 레벨은 누적 100 당 1 이다.
 * 곡선을 바꾸려면 이 두 상수만 고치면 된다.
 */
export const XP_PER_LESSON_LEVEL = 10;
export const XP_PER_ACCOUNT_LEVEL = 100;

/**
 * DB 의 smallint 처럼 범위를 보장할 수 없는 값을 난이도로 좁힌다.
 * 저장된 값이 어긋나 있어도 XP 계산이 터지지 않게 한다.
 */
export function asLessonLevel(value: number): LessonLevel {
  if (value <= 1) return 1;
  if (value >= 3) return 3;
  return 2;
}

/** 미션 하나를 처음 완료했을 때 받는 XP. */
export const lessonXp = (level: LessonLevel): number => level * XP_PER_LESSON_LEVEL;

/** 누적 XP 로 계산한 계정 레벨. 0 XP 가 1레벨이다. */
export const accountLevel = (xp: number): number =>
  Math.floor(Math.max(0, xp) / XP_PER_ACCOUNT_LEVEL) + 1;

/** 현재 레벨 안에서 쌓은 XP. 진행 막대에 쓴다. */
export const xpIntoLevel = (xp: number): number => Math.max(0, xp) % XP_PER_ACCOUNT_LEVEL;

/**
 * 제출 결과 + 이번 제출로 움직인 XP.
 * `awardedXp` 는 **이번에 새로 받은 양**이라 이미 완료한 미션을 다시 풀면 0 이다.
 */
export interface AttemptResult extends RunResult {
  awardedXp: number;
  totalXp: number;
  level: number;
}
