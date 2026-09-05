/**
 * 마이그레이션 실행기. `pnpm db:migrate` 또는 coblocks-migrate 이미지로 돌린다.
 *
 * 운영에서는 `db:push` 를 쓰지 않는다. push 는 스키마를 현재 코드에 맞춰 밀어붙이는 것이라
 * 무엇이 언제 바뀌었는지 남지 않고, 되돌릴 방법도 없다. 배포는 항상 이 파일을 거친다.
 */
import path from 'node:path';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DATABASE_URL ?? 'postgres://coblocks:coblocks@localhost:5432/coblocks';

/**
 * 소스에서 돌리면 src/db 기준, 컨테이너에서 돌리면 dist/db 기준이다.
 * 두 경우 모두 두 단계 위가 apps/api 라 같은 경로로 떨어진다.
 */
const migrationsFolder = process.env.MIGRATIONS_DIR ?? path.resolve(__dirname, '../../drizzle');

/** 이미 있는 객체를 또 만들려다 난 오류인가 — 타입·테이블·인덱스·컬럼 중복 코드. */
const ALREADY_EXISTS_CODES = new Set(['42710', '42P07', '42P06', '42701']);

function isAlreadyExists(error: unknown): boolean {
  let current: unknown = error;
  // drizzle 이 원래 오류를 cause 로 감싸므로 사슬을 따라 내려간다.
  for (let depth = 0; current && depth < 5; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string' && ALREADY_EXISTS_CODES.has(code)) return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

/**
 * `db:push` 로 만든 데이터베이스는 스키마는 최신인데 마이그레이션 기록이 없다.
 * 그러면 첫 마이그레이션이 이미 있는 것들을 다시 만들려다 실패한다.
 * 스택 트레이스만 던지면 원인을 알 수 없으니 무엇을 해야 하는지 적어 준다.
 */
function explainAlreadyExists(): void {
  console.error(
    [
      '',
      '이 데이터베이스에는 스키마가 이미 있는데 마이그레이션 기록이 없습니다.',
      '`db:push` 로 만든 데이터베이스에서 나는 증상입니다. 둘 중 하나를 고르세요.',
      '',
      '  1) 개발 DB 라면 지우고 다시 만든다 (데이터가 사라집니다)',
      '     docker compose -f docker/docker-compose.dev.yaml down -v',
      '     pnpm db:up && pnpm db:migrate && pnpm db:seed',
      '',
      '  2) 지울 수 없는 데이터가 있다면, 그 데이터베이스는 계속 `db:push` 로 맞추고',
      '     마이그레이션은 다음 스키마 변경부터 적용한다.',
      '',
    ].join('\n'),
  );
}

async function main(): Promise<void> {
  // 마이그레이션은 한 연결로만 순서대로 돌린다.
  const client = postgres(url, { max: 1 });
  try {
    console.log(`· 마이그레이션 적용: ${migrationsFolder}`);
    await migrate(drizzle(client), { migrationsFolder });
    console.log('· 완료');
  } catch (error) {
    console.error('마이그레이션 실패:', error);
    if (isAlreadyExists(error)) explainAlreadyExists();
    // 컨테이너가 실패로 끝나야 compose 가 api/web 을 띄우지 않는다.
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
