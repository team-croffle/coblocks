/**
 * 개발용 시드. `pnpm db:seed` 로 실행한다.
 * 여기서 만드는 비밀번호는 개발 전용이며 운영에서는 절대 쓰지 않는다.
 */
import * as argon2 from 'argon2';
import { LESSON_SEED, STANDARDS } from '@coblocks/shared';
import { db, queryClient } from './client';
import { inquiries, lessons, standards, users } from './schema';

const DEV_ACCOUNTS = [
  { memberNo: 'U-24019', loginId: 'student1', name: '김민수', email: 'minsoo@school.kr', role: 'student' as const, schoolName: '원광초등학교' },
  { memberNo: 'U-24020', loginId: 'student2', name: '박서은', email: 'seoeun@school.kr', role: 'student' as const, schoolName: '원광초등학교' },
  { memberNo: 'T-10442', loginId: 'teacher1', name: '이정아', email: 'junga@teacher.kr', role: 'teacher' as const, schoolName: '원광초등학교' },
  { memberNo: 'A-00001', loginId: 'admin', name: '운영자', email: 'admin@coblocks.kr', role: 'admin' as const, schoolName: null },
];

async function main() {
  console.log('· 성취기준 시드');
  await db
    .insert(standards)
    .values(STANDARDS.map((s) => ({ code: s.code, band: s.band, text: s.text })))
    .onConflictDoNothing();

  console.log('· 미션 시드');
  await db
    .insert(lessons)
    .values(
      LESSON_SEED.map((l) => ({
        slug: l.slug,
        title: l.title,
        description: l.description,
        band: l.band,
        concept: l.concept,
        level: l.level,
        periods: l.periods,
        standardCode: l.standardCode,
        blockLabels: l.blockLabels,
        stage: l.stage,
        status: l.status,
        orderIndex: l.orderIndex,
      })),
    )
    .onConflictDoNothing();

  console.log('· 개발 계정 시드 (비밀번호 = 아이디)');
  for (const account of DEV_ACCOUNTS) {
    await db
      .insert(users)
      .values({ ...account, passwordHash: await argon2.hash(account.loginId) })
      .onConflictDoNothing();
  }

  console.log('· 문의 시드');
  await db
    .insert(inquiries)
    .values([
      {
        code: 'INQ-3391',
        title: '블록이 실행 도중 멈춰요',
        body: '중첩 반복 미션에서 반복 횟수를 8로 하면 캐릭터가 세 칸만 가고 멈춥니다.',
        state: 'open',
      },
      {
        code: 'INQ-3388',
        title: '학급 계정 일괄 생성 방법 문의',
        body: '5학년 3반 학생 26명 계정을 한 번에 만들고 싶습니다. 엑셀 업로드가 가능한가요?',
        state: 'open',
      },
    ])
    .onConflictDoNothing();

  console.log('완료');
  await queryClient.end();
}

void main();
