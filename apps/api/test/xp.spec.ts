import { describe, expect, it } from 'vitest';

import {
  accountLevel,
  asLessonLevel,
  lessonXp,
  XP_PER_ACCOUNT_LEVEL,
  xpIntoLevel,
} from '@coblocks/shared';

describe('XP 배점', () => {
  it('난이도 × 10 을 준다', () => {
    expect(lessonXp(1)).toBe(10);
    expect(lessonXp(2)).toBe(20);
    expect(lessonXp(3)).toBe(30);
  });

  it('DB 에서 온 범위 밖 난이도를 좁힌다', () => {
    expect(asLessonLevel(0)).toBe(1);
    expect(asLessonLevel(2)).toBe(2);
    expect(asLessonLevel(9)).toBe(3);
    expect(asLessonLevel(-4)).toBe(1);
  });
});

describe('계정 레벨', () => {
  it('0 XP 는 1레벨이고 100 마다 오른다', () => {
    expect(accountLevel(0)).toBe(1);
    expect(accountLevel(99)).toBe(1);
    expect(accountLevel(100)).toBe(2);
    expect(accountLevel(250)).toBe(3);
  });

  it('음수 XP 는 0 으로 본다', () => {
    expect(accountLevel(-10)).toBe(1);
    expect(xpIntoLevel(-10)).toBe(0);
  });

  it('레벨 안에서 쌓은 XP 를 돌려준다', () => {
    expect(xpIntoLevel(0)).toBe(0);
    expect(xpIntoLevel(130)).toBe(30);
    expect(xpIntoLevel(XP_PER_ACCOUNT_LEVEL)).toBe(0);
  });
});

/**
 * 원장 계산 자체는 서버가 DB 안에서 하지만, 규칙은 순수 함수로 표현할 수 있다.
 * "이미 준 만큼은 다시 주지 않는다" 를 여기서 고정해 둔다.
 */
const delta = (target: number, granted: number): number => Math.max(0, target - granted);

describe('XP 원장 규칙', () => {
  it('처음 완료하면 목표만큼 준다', () => {
    expect(delta(lessonXp(2), 0)).toBe(20);
  });

  it('다시 풀어도 더 주지 않는다', () => {
    expect(delta(lessonXp(2), 20)).toBe(0);
    expect(delta(lessonXp(2), 30)).toBe(0);
  });

  it('목표가 오르면 부족분만 채운다 (v0.8 제약 보너스 대비)', () => {
    expect(delta(30, 20)).toBe(10);
  });

  it('기능 이전에 완료한 미션은 목표가 0 이라 아무것도 주지 않는다', () => {
    expect(delta(0, 0)).toBe(0);
  });
});
