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

async function main(): Promise<void> {
  // 마이그레이션은 한 연결로만 순서대로 돌린다.
  const client = postgres(url, { max: 1 });
  try {
    console.log(`· 마이그레이션 적용: ${migrationsFolder}`);
    await migrate(drizzle(client), { migrationsFolder });
    console.log('· 완료');
  } catch (error) {
    console.error('마이그레이션 실패:', error);
    // 컨테이너가 실패로 끝나야 compose 가 api/web 을 띄우지 않는다.
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
